"""Backend API tests for MALWA MILK FARM dairy management."""
import os
import pytest
import requests
from datetime import datetime, timezone

BASE_URL = os.environ.get("BACKEND_URL", os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8000")).rstrip("/")
ADMIN = {"email": "admin@malwamilk.com", "password": "admin123"}
STAFF = {"email": "staff@malwamilk.com", "password": "staff123"}


@pytest.fixture(scope="session")
def admin_session():
    s = requests.Session()
    r = s.post(f"{BASE_URL}/api/auth/login", json=ADMIN)
    assert r.status_code == 200, r.text
    return s


@pytest.fixture(scope="session")
def staff_session():
    s = requests.Session()
    r = s.post(f"{BASE_URL}/api/auth/login", json=STAFF)
    assert r.status_code == 200, r.text
    return s


# --- Auth tests ---
class TestAuth:
    def test_login_admin(self):
        r = requests.post(f"{BASE_URL}/api/auth/login", json=ADMIN)
        assert r.status_code == 200
        d = r.json()
        assert d["email"] == ADMIN["email"]
        assert d["role"] == "admin"
        assert "access_token" in r.cookies

    def test_login_invalid(self):
        r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": "admin@malwamilk.com", "password": "wrong"})
        assert r.status_code in (401, 429)

    def test_me_unauth(self):
        r = requests.get(f"{BASE_URL}/api/auth/me")
        assert r.status_code == 401

    def test_me_authed(self, admin_session):
        r = admin_session.get(f"{BASE_URL}/api/auth/me")
        assert r.status_code == 200
        assert r.json()["role"] == "admin"

    def test_logout(self):
        s = requests.Session()
        s.post(f"{BASE_URL}/api/auth/login", json=ADMIN)
        r = s.post(f"{BASE_URL}/api/auth/logout")
        assert r.status_code == 200


# --- Customer CRUD ---
class TestCustomers:
    created_id = None

    def test_create_customer(self, admin_session):
        r = admin_session.post(f"{BASE_URL}/api/customers", json={"name": "TEST_Cust1", "phone": "9999999999", "address": "Test Addr"})
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["name"] == "TEST_Cust1"
        TestCustomers.created_id = d["id"]

    def test_get_customers(self, admin_session):
        r = admin_session.get(f"{BASE_URL}/api/customers")
        assert r.status_code == 200
        assert any(c["id"] == TestCustomers.created_id for c in r.json())

    def test_update_customer(self, admin_session):
        cid = TestCustomers.created_id
        r = admin_session.put(f"{BASE_URL}/api/customers/{cid}", json={"name": "TEST_Cust1U", "phone": "1", "address": "x"})
        assert r.status_code == 200
        assert r.json()["name"] == "TEST_Cust1U"

    def test_delete_customer_staff_forbidden(self, staff_session):
        cid = TestCustomers.created_id
        r = staff_session.delete(f"{BASE_URL}/api/customers/{cid}")
        assert r.status_code == 403

    def test_delete_customer_admin(self, admin_session):
        cid = TestCustomers.created_id
        r = admin_session.delete(f"{BASE_URL}/api/customers/{cid}")
        assert r.status_code == 200


# --- Milk Entries ---
class TestEntries:
    cust_id = None
    entry_id = None

    def test_setup_customer(self, admin_session):
        r = admin_session.post(f"{BASE_URL}/api/customers", json={"name": "TEST_EntryCust"})
        TestEntries.cust_id = r.json()["id"]

    def test_create_entry(self, admin_session):
        payload = {
            "customer_id": TestEntries.cust_id,
            "milk_type": "Cow Milk",
            "price": 60.0,
            "quantity": 10.0,
            "session": "Morning",
            "entry_date": datetime.now(timezone.utc).isoformat(),
        }
        r = admin_session.post(f"{BASE_URL}/api/entries", json=payload)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["revenue"] == 600.0
        TestEntries.entry_id = d["id"]

    def test_get_entries_filter(self, admin_session):
        r = admin_session.get(f"{BASE_URL}/api/entries", params={"milk_type": "Cow Milk", "session": "Morning"})
        assert r.status_code == 200
        assert any(e["id"] == TestEntries.entry_id for e in r.json())

    def test_update_entry(self, admin_session):
        payload = {
            "customer_id": TestEntries.cust_id, "milk_type": "Buffalo Milk", "price": 80.0,
            "quantity": 5.0, "session": "Evening", "entry_date": datetime.now(timezone.utc).isoformat()
        }
        r = admin_session.put(f"{BASE_URL}/api/entries/{TestEntries.entry_id}", json=payload)
        assert r.status_code == 200
        assert r.json()["revenue"] == 400.0

    def test_delete_entry(self, admin_session):
        r = admin_session.delete(f"{BASE_URL}/api/entries/{TestEntries.entry_id}")
        assert r.status_code == 200
        admin_session.delete(f"{BASE_URL}/api/customers/{TestEntries.cust_id}")


# --- Analytics ---
class TestAnalytics:
    def test_dashboard(self, admin_session):
        r = admin_session.get(f"{BASE_URL}/api/analytics/dashboard")
        assert r.status_code == 200
        keys = ["today_quantity", "today_revenue", "avg_15_day_quantity", "avg_30_day_quantity", "quantity_change", "revenue_change"]
        d = r.json()
        for k in keys:
            assert k in d

    def test_charts(self, admin_session):
        r = admin_session.get(f"{BASE_URL}/api/analytics/charts")
        assert r.status_code == 200
        d = r.json()
        assert "daily_trend" in d and "milk_distribution" in d


# --- Payments ---
class TestPayments:
    def test_create_and_list_payment(self, admin_session):
        cr = admin_session.post(f"{BASE_URL}/api/customers", json={"name": "TEST_PayCust"})
        cid = cr.json()["id"]
        # create an entry so balance exists
        admin_session.post(f"{BASE_URL}/api/entries", json={
            "customer_id": cid, "milk_type": "Cow Milk", "price": 60, "quantity": 10,
            "session": "Morning", "entry_date": datetime.now(timezone.utc).isoformat()
        })
        pay = {"customer_id": cid, "amount": 300, "payment_date": datetime.now(timezone.utc).isoformat(), "status": "partial", "notes": "TEST"}
        r = admin_session.post(f"{BASE_URL}/api/payments", json=pay)
        assert r.status_code == 200, r.text
        r2 = admin_session.get(f"{BASE_URL}/api/payments", params={"customer_id": cid})
        assert r2.status_code == 200
        assert len(r2.json()) >= 1

    def test_pending_payments(self, admin_session):
        r = admin_session.get(f"{BASE_URL}/api/payments/pending")
        assert r.status_code == 200
        assert isinstance(r.json(), list)
