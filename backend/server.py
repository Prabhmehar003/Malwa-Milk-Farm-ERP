from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Enum, ForeignKey, select, func, and_, or_, Index
from sqlalchemy.orm import declarative_base, relationship
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit
import os
import jwt
import bcrypt
import logging
import secrets

# Environment variables
def env_bool(name: str, default: bool = False) -> bool:
    value = os.environ.get(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def normalize_postgres_url(database_url: str) -> tuple[str, dict]:
    url = database_url.strip()
    if url.startswith("postgres://"):
        url = "postgresql://" + url[len("postgres://"):]
    if url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)

    split_url = urlsplit(url)
    query_items = dict(parse_qsl(split_url.query, keep_blank_values=True))
    sslmode = query_items.pop("sslmode", None)
    ssl = query_items.pop("ssl", None)
    query_items.pop("channel_binding", None)
    connect_args = {}

    if sslmode and sslmode.lower() not in {"disable", "allow"}:
        connect_args["ssl"] = True
    if ssl and ssl.lower() in {"1", "true", "require"}:
        connect_args["ssl"] = True
    if os.environ.get("POSTGRES_SSL") is not None:
        connect_args["ssl"] = env_bool("POSTGRES_SSL")

    cleaned_query = urlencode(query_items)
    return urlunsplit((split_url.scheme, split_url.netloc, split_url.path, cleaned_query, split_url.fragment)), connect_args


APP_ENV = os.environ.get("APP_ENV", "development").lower()
IS_PRODUCTION = APP_ENV == "production"
POSTGRES_URL, POSTGRES_CONNECT_ARGS = normalize_postgres_url(
    os.environ.get(
        "POSTGRES_URL",
        os.environ.get("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/malwa_dairy"),
    )
)
JWT_SECRET = os.environ.get("JWT_SECRET")
if not JWT_SECRET:
    if IS_PRODUCTION:
        raise RuntimeError("JWT_SECRET must be set in production.")
    JWT_SECRET = "dev-only-change-me"
JWT_ALGORITHM = "HS256"
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@malwamilk.com")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD")
if not ADMIN_PASSWORD:
    if IS_PRODUCTION:
        raise RuntimeError("ADMIN_PASSWORD must be set in production.")
    ADMIN_PASSWORD = "admin123"

FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")
FRONTEND_URLS = [
    origin.strip().rstrip("/")
    for origin in os.environ.get("FRONTEND_URLS", FRONTEND_URL).split(",")
    if origin.strip()
]
COOKIE_SECURE = env_bool("COOKIE_SECURE", IS_PRODUCTION)
COOKIE_SAMESITE = os.environ.get("COOKIE_SAMESITE", "lax").lower()
if COOKIE_SAMESITE == "none" and not COOKIE_SECURE:
    COOKIE_SECURE = True

# Database setup
engine = create_async_engine(POSTGRES_URL, echo=False, connect_args=POSTGRES_CONNECT_ARGS)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

# Database Models
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    role = Column(Enum("admin", "staff", name="user_role"), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class Customer(Base):
    __tablename__ = "customers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone = Column(String)
    address = Column(Text)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class MilkEntry(Base):
    __tablename__ = "milk_entries"
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    milk_type = Column(Enum("Cow Milk", "Buffalo Milk", name="milk_type"), nullable=False)
    price = Column(Float, nullable=False)
    quantity = Column(Float, nullable=False)
    revenue = Column(Float, nullable=False)
    session = Column(Enum("Morning", "Evening", name="session_type"), nullable=False)
    entry_date = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    created_by = Column(Integer, ForeignKey("users.id"))
    
    __table_args__ = (
        Index('idx_entry_date', 'entry_date'),
        Index('idx_customer_date', 'customer_id', 'entry_date'),
    )

class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    entry_id = Column(Integer, ForeignKey("milk_entries.id"), nullable=True)
    amount = Column(Float, nullable=False)
    payment_date = Column(DateTime(timezone=True), nullable=False)
    status = Column(Enum("paid", "pending", "partial", name="payment_status"), nullable=False)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class LoginAttempt(Base):
    __tablename__ = "login_attempts"
    id = Column(Integer, primary_key=True, index=True)
    identifier = Column(String, index=True, nullable=False)
    attempts = Column(Integer, default=0)
    locked_until = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token = Column(String, unique=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

# Pydantic Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str = "staff"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    role: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class CustomerCreate(BaseModel):
    name: str
    phone: Optional[str] = None
    address: Optional[str] = None

class CustomerResponse(BaseModel):
    id: int
    name: str
    phone: Optional[str]
    address: Optional[str]
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class MilkEntryCreate(BaseModel):
    customer_id: int
    milk_type: str
    price: float
    quantity: float
    session: str
    entry_date: datetime

class MilkEntryResponse(BaseModel):
    id: int
    customer_id: int
    milk_type: str
    price: float
    quantity: float
    revenue: float
    session: str
    entry_date: datetime
    created_at: datetime
    customer_name: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class PaymentCreate(BaseModel):
    customer_id: int
    entry_id: Optional[int] = None
    amount: float
    payment_date: datetime
    status: str
    notes: Optional[str] = None

class PaymentResponse(BaseModel):
    id: int
    customer_id: int
    entry_id: Optional[int]
    amount: float
    payment_date: datetime
    status: str
    notes: Optional[str]
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Utility Functions
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

def create_access_token(user_id: int, email: str) -> str:
    payload = {
        "sub": str(user_id),
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=15),
        "type": "access"
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: int) -> str:
    payload = {
        "sub": str(user_id),
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "refresh"
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def set_auth_cookie(response: Response, key: str, value: str, max_age: int):
    response.set_cookie(
        key=key,
        value=value,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        max_age=max_age,
        path="/",
    )


def delete_auth_cookie(response: Response, key: str):
    response.delete_cookie(
        key=key,
        path="/",
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
    )

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

async def get_current_user(request: Request, db: AsyncSession = Depends(get_db)) -> User:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        
        result = await db.execute(select(User).where(User.id == int(payload["sub"])))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def require_role(required_role: str):
    async def role_checker(user: User = Depends(get_current_user)):
        if user.role != required_role and user.role != "admin":
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user
    return role_checker

# FastAPI App
app = FastAPI()
api_router = APIRouter(prefix="/api")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_URLS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth Routes
@api_router.post("/auth/register", response_model=UserResponse)
async def register(user_data: UserRegister, response: Response, db: AsyncSession = Depends(get_db)):
    email = user_data.email.lower()
    
    result = await db.execute(select(User).where(User.email == email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed = hash_password(user_data.password)
    new_user = User(
        email=email,
        password_hash=hashed,
        name=user_data.name,
        role=user_data.role
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    access_token = create_access_token(new_user.id, new_user.email)
    refresh_token = create_refresh_token(new_user.id)
    
    set_auth_cookie(response, "access_token", access_token, 900)
    set_auth_cookie(response, "refresh_token", refresh_token, 604800)
    
    return new_user

@api_router.post("/auth/login", response_model=UserResponse)
async def login(credentials: UserLogin, response: Response, request: Request, db: AsyncSession = Depends(get_db)):
    email = credentials.email.lower()
    identifier = f"{request.client.host}:{email}"
    
    # Check brute force
    result = await db.execute(select(LoginAttempt).where(LoginAttempt.identifier == identifier))
    attempt = result.scalar_one_or_none()
    
    if attempt and attempt.locked_until and attempt.locked_until > datetime.now(timezone.utc):
        raise HTTPException(status_code=429, detail="Too many failed attempts. Please try again later.")
    
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(credentials.password, user.password_hash):
        # Increment failed attempts
        if not attempt:
            attempt = LoginAttempt(identifier=identifier, attempts=1)
            db.add(attempt)
        else:
            attempt.attempts += 1
            if attempt.attempts >= 5:
                attempt.locked_until = datetime.now(timezone.utc) + timedelta(minutes=15)
        await db.commit()
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Clear attempts on success
    if attempt:
        await db.delete(attempt)
        await db.commit()
    
    access_token = create_access_token(user.id, user.email)
    refresh_token = create_refresh_token(user.id)
    
    set_auth_cookie(response, "access_token", access_token, 900)
    set_auth_cookie(response, "refresh_token", refresh_token, 604800)
    
    return user

@api_router.post("/auth/logout")
async def logout(response: Response):
    delete_auth_cookie(response, "access_token")
    delete_auth_cookie(response, "refresh_token")
    return {"message": "Logged out successfully"}

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(user: User = Depends(get_current_user)):
    return user

@api_router.post("/auth/refresh")
async def refresh(request: Request, response: Response, db: AsyncSession = Depends(get_db)):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        
        result = await db.execute(select(User).where(User.id == int(payload["sub"])))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        access_token = create_access_token(user.id, user.email)
        set_auth_cookie(response, "access_token", access_token, 900)
        
        return {"message": "Token refreshed"}
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Customer Routes
@api_router.get("/customers", response_model=List[CustomerResponse])
async def get_customers(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    result = await db.execute(select(Customer).order_by(Customer.name))
    customers = result.scalars().all()
    return customers

@api_router.post("/customers", response_model=CustomerResponse)
async def create_customer(customer: CustomerCreate, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    new_customer = Customer(**customer.model_dump())
    db.add(new_customer)
    await db.commit()
    await db.refresh(new_customer)
    return new_customer

@api_router.put("/customers/{customer_id}", response_model=CustomerResponse)
async def update_customer(customer_id: int, customer: CustomerCreate, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    result = await db.execute(select(Customer).where(Customer.id == customer_id))
    db_customer = result.scalar_one_or_none()
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    for key, value in customer.model_dump().items():
        setattr(db_customer, key, value)
    await db.commit()
    await db.refresh(db_customer)
    return db_customer

@api_router.delete("/customers/{customer_id}")
async def delete_customer(customer_id: int, db: AsyncSession = Depends(get_db), user: User = Depends(require_role("admin"))):
    result = await db.execute(select(Customer).where(Customer.id == customer_id))
    customer = result.scalar_one_or_none()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    await db.delete(customer)
    await db.commit()
    return {"message": "Customer deleted"}

# Milk Entry Routes
@api_router.get("/entries", response_model=List[Dict[str, Any]])
async def get_entries(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    customer_id: Optional[int] = None,
    milk_type: Optional[str] = None,
    session: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    query = select(MilkEntry, Customer.name).join(Customer, MilkEntry.customer_id == Customer.id)
    
    conditions = []
    if start_date:
        conditions.append(MilkEntry.entry_date >= datetime.fromisoformat(start_date))
    if end_date:
        conditions.append(MilkEntry.entry_date <= datetime.fromisoformat(end_date))
    if customer_id:
        conditions.append(MilkEntry.customer_id == customer_id)
    if milk_type:
        conditions.append(MilkEntry.milk_type == milk_type)
    if session:
        conditions.append(MilkEntry.session == session)
    
    if conditions:
        query = query.where(and_(*conditions))
    
    query = query.order_by(MilkEntry.entry_date.desc())
    result = await db.execute(query)
    entries = []
    for entry, customer_name in result.all():
        entry_dict = {
            "id": entry.id,
            "customer_id": entry.customer_id,
            "customer_name": customer_name,
            "milk_type": entry.milk_type,
            "price": entry.price,
            "quantity": entry.quantity,
            "revenue": entry.revenue,
            "session": entry.session,
            "entry_date": entry.entry_date,
            "created_at": entry.created_at
        }
        entries.append(entry_dict)
    return entries

@api_router.post("/entries", response_model=MilkEntryResponse)
async def create_entry(entry: MilkEntryCreate, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    revenue = entry.price * entry.quantity
    new_entry = MilkEntry(
        customer_id=entry.customer_id,
        milk_type=entry.milk_type,
        price=entry.price,
        quantity=entry.quantity,
        revenue=revenue,
        session=entry.session,
        entry_date=entry.entry_date,
        created_by=user.id
    )
    db.add(new_entry)
    await db.commit()
    await db.refresh(new_entry)
    return new_entry

@api_router.put("/entries/{entry_id}", response_model=MilkEntryResponse)
async def update_entry(entry_id: int, entry: MilkEntryCreate, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    result = await db.execute(select(MilkEntry).where(MilkEntry.id == entry_id))
    db_entry = result.scalar_one_or_none()
    if not db_entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    db_entry.customer_id = entry.customer_id
    db_entry.milk_type = entry.milk_type
    db_entry.price = entry.price
    db_entry.quantity = entry.quantity
    db_entry.revenue = entry.price * entry.quantity
    db_entry.session = entry.session
    db_entry.entry_date = entry.entry_date
    
    await db.commit()
    await db.refresh(db_entry)
    return db_entry

@api_router.delete("/entries/{entry_id}")
async def delete_entry(entry_id: int, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    result = await db.execute(select(MilkEntry).where(MilkEntry.id == entry_id))
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    await db.delete(entry)
    await db.commit()
    return {"message": "Entry deleted"}

# Analytics Routes
@api_router.get("/analytics/dashboard")
async def get_dashboard_analytics(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Today's stats
    today_result = await db.execute(
        select(func.sum(MilkEntry.quantity), func.sum(MilkEntry.revenue))
        .where(MilkEntry.entry_date >= today_start)
    )
    today_quantity, today_revenue = today_result.one()
    
    # 15-day stats
    day_15_ago = today_start - timedelta(days=15)
    result_15 = await db.execute(
        select(func.sum(MilkEntry.quantity), func.sum(MilkEntry.revenue))
        .where(MilkEntry.entry_date >= day_15_ago)
    )
    qty_15, rev_15 = result_15.one()
    
    # 30-day stats
    day_30_ago = today_start - timedelta(days=30)
    result_30 = await db.execute(
        select(func.sum(MilkEntry.quantity), func.sum(MilkEntry.revenue))
        .where(MilkEntry.entry_date >= day_30_ago)
    )
    qty_30, rev_30 = result_30.one()
    
    # Previous week comparison
    prev_week_start = today_start - timedelta(days=7)
    prev_week_result = await db.execute(
        select(func.sum(MilkEntry.quantity), func.sum(MilkEntry.revenue))
        .where(and_(MilkEntry.entry_date >= prev_week_start, MilkEntry.entry_date < today_start))
    )
    prev_qty, prev_rev = prev_week_result.one()
    
    return {
        "today_quantity": float(today_quantity or 0),
        "today_revenue": float(today_revenue or 0),
        "avg_15_day_quantity": float(qty_15 or 0) / 15,
        "avg_15_day_revenue": float(rev_15 or 0) / 15,
        "avg_30_day_quantity": float(qty_30 or 0) / 30,
        "avg_30_day_revenue": float(rev_30 or 0) / 30,
        "quantity_change": ((float(today_quantity or 0) - float(prev_qty or 0)) / float(prev_qty or 1)) * 100,
        "revenue_change": ((float(today_revenue or 0) - float(prev_rev or 0)) / float(prev_rev or 1)) * 100
    }

@api_router.get("/analytics/charts")
async def get_chart_data(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    now = datetime.now(timezone.utc)
    thirty_days_ago = now - timedelta(days=30)
    
    # Monthly trend
    daily_result = await db.execute(
        select(
            func.date(MilkEntry.entry_date).label('date'),
            func.sum(MilkEntry.quantity).label('quantity'),
            func.sum(MilkEntry.revenue).label('revenue')
        )
        .where(MilkEntry.entry_date >= thirty_days_ago)
        .group_by(func.date(MilkEntry.entry_date))
        .order_by(func.date(MilkEntry.entry_date))
    )
    
    daily_data = []
    for row in daily_result.all():
        daily_data.append({
            "date": row.date.isoformat(),
            "quantity": float(row.quantity or 0),
            "revenue": float(row.revenue or 0)
        })
    
    # Milk type distribution
    type_result = await db.execute(
        select(MilkEntry.milk_type, func.sum(MilkEntry.quantity))
        .where(MilkEntry.entry_date >= thirty_days_ago)
        .group_by(MilkEntry.milk_type)
    )
    
    milk_distribution = []
    for milk_type, quantity in type_result.all():
        milk_distribution.append({
            "type": milk_type,
            "quantity": float(quantity or 0)
        })
    
    return {
        "daily_trend": daily_data,
        "milk_distribution": milk_distribution
    }

# Payment Routes
@api_router.get("/payments", response_model=List[PaymentResponse])
async def get_payments(customer_id: Optional[int] = None, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    query = select(Payment)
    if customer_id:
        query = query.where(Payment.customer_id == customer_id)
    query = query.order_by(Payment.payment_date.desc())
    result = await db.execute(query)
    return result.scalars().all()

@api_router.post("/payments", response_model=PaymentResponse)
async def create_payment(payment: PaymentCreate, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    new_payment = Payment(**payment.model_dump())
    db.add(new_payment)
    await db.commit()
    await db.refresh(new_payment)
    return new_payment

@api_router.get("/payments/pending")
async def get_pending_payments(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    # Get customers with pending payments
    result = await db.execute(
        select(
            Customer.id,
            Customer.name,
            func.sum(MilkEntry.revenue).label('total_due')
        )
        .join(MilkEntry, Customer.id == MilkEntry.customer_id)
        .outerjoin(Payment, and_(Payment.customer_id == Customer.id, Payment.status == "paid"))
        .group_by(Customer.id, Customer.name)
    )
    
    pending = []
    for customer_id, customer_name, total_due in result.all():
        paid_result = await db.execute(
            select(func.sum(Payment.amount))
            .where(and_(Payment.customer_id == customer_id, Payment.status == "paid"))
        )
        total_paid = paid_result.scalar() or 0
        
        if total_due > total_paid:
            pending.append({
                "customer_id": customer_id,
                "customer_name": customer_name,
                "total_due": float(total_due or 0),
                "total_paid": float(total_paid),
                "balance": float(total_due or 0) - float(total_paid)
            })
    
    return pending

# Include router
app.include_router(api_router)

FRONTEND_BUILD_DIR = Path(
    os.environ.get(
        "FRONTEND_BUILD_DIR",
        Path(__file__).resolve().parent.parent / "frontend" / "build",
    )
)

if FRONTEND_BUILD_DIR.exists():
    frontend_build_root = FRONTEND_BUILD_DIR.resolve()
    static_dir = FRONTEND_BUILD_DIR / "static"
    if static_dir.exists():
        app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

    @app.api_route("/{full_path:path}", methods=["GET", "HEAD"], include_in_schema=False)
    async def serve_frontend(full_path: str):
        requested_path = (FRONTEND_BUILD_DIR / full_path).resolve()
        if (
            full_path
            and requested_path.is_file()
            and frontend_build_root in requested_path.parents
        ):
            return FileResponse(requested_path)
        return FileResponse(FRONTEND_BUILD_DIR / "index.html")

# Startup event
@app.on_event("startup")
async def startup_event():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Seed admin
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.email == ADMIN_EMAIL.lower()))
        admin = result.scalar_one_or_none()
        
        if not admin:
            hashed = hash_password(ADMIN_PASSWORD)
            admin = User(
                email=ADMIN_EMAIL.lower(),
                password_hash=hashed,
                name="Admin",
                role="admin"
            )
            session.add(admin)
            await session.commit()
        elif not verify_password(ADMIN_PASSWORD, admin.password_hash):
            admin.password_hash = hash_password(ADMIN_PASSWORD)
            await session.commit()
        
        if env_bool("SEED_STAFF_USER", not IS_PRODUCTION):
            staff_email = "staff@malwamilk.com"
            result = await session.execute(select(User).where(User.email == staff_email))
            staff = result.scalar_one_or_none()
            if not staff:
                staff = User(
                    email=staff_email,
                    password_hash=hash_password("staff123"),
                    name="Staff User",
                    role="staff"
                )
                session.add(staff)
                await session.commit()

    if env_bool("WRITE_TEST_CREDENTIALS", not IS_PRODUCTION):
        memory_dir = Path(os.environ.get("MEMORY_DIR", Path(__file__).resolve().parent.parent / "memory"))
        memory_dir.mkdir(parents=True, exist_ok=True)
        with open(memory_dir / "test_credentials.md", "w") as f:
            f.write("# Test Credentials for MALWA MILK FARM\n\n")
            f.write("## Admin Account\n")
            f.write(f"- Email: {ADMIN_EMAIL}\n")
            f.write(f"- Password: {ADMIN_PASSWORD}\n")
            f.write("- Role: admin\n\n")
            if env_bool("SEED_STAFF_USER", not IS_PRODUCTION):
                f.write("## Staff Account\n")
                f.write("- Email: staff@malwamilk.com\n")
                f.write("- Password: staff123\n")
                f.write("- Role: staff\n\n")
            f.write("## Auth Endpoints\n")
            f.write("- POST /api/auth/login\n")
            f.write("- POST /api/auth/register\n")
            f.write("- GET /api/auth/me\n")
            f.write("- POST /api/auth/logout\n")
            f.write("- POST /api/auth/refresh\n")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_event():
    await engine.dispose()
