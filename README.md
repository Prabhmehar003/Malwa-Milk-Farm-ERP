<div align="center">

<img src="https://img.shields.io/badge/🐄 MALWA MILK FARM ERP-Premium Dairy Management System-1a9c4a?style=for-the-badge&labelColor=0d5c2e" alt="Malwa Milk Farm ERP" width="600"/>

<br/><br/>

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-81.8%25-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=flat-square)]()

<br/>

> **A full-stack, production-grade ERP system purpose-built for dairy farm operations** — tracking every litre, every customer, and every rupee in a single modern SaaS dashboard.

<br/>

[✨ Features](#-features) • [🏗️ Architecture](#-architecture) • [⚡ Quick Start](#-quick-start) • [📂 Project Structure](#-project-structure) • [🌐 API Reference](#-api-reference) • [🤝 Contributing](#-contributing)

---

</div>

> Deployment note: this exported project now includes a free Render + PostgreSQL deployment path. See [`DEPLOY_FREE.md`](DEPLOY_FREE.md).

## 🌟 Why Malwa Milk Farm ERP?

Most dairy farms still run on paper ledgers and WhatsApp messages. **Malwa Milk Farm ERP** changes that — a premium, real-world ERP system built for the needs of a growing dairy business, featuring the kind of polished UI you'd expect from enterprise SaaS, not a local farm.

| ❌ Before | ✅ After |
|---|---|
| Manual khata entries for each customer | Automated digital customer ledger |
| No insight into daily milk collection | Real-time milk tracking dashboard |
| Chasing payments via phone | Automated payment analytics & alerts |
| Zero visibility into revenue trends | Interactive revenue charts & KPI cards |
| Scattered records across notebooks | Centralized PostgreSQL data warehouse |

---

## ✨ Features

### 👥 Customer Management
- Register and manage dairy customers with complete profiles
- Track per-customer milk delivery history
- View outstanding balances at a glance
- Search, filter, and sort across all customer records

### 🥛 Milk Tracking
- Log daily milk delivery quantities per customer
- Fat percentage and quality tracking
- Shift-wise (morning/evening) collection records
- Historical delivery trends and graphs

### 💰 Payment & Billing
- Generate monthly bills automatically based on delivery logs
- Record partial and full payments
- Outstanding dues dashboard with aging analysis
- Payment history per customer

### 📊 Revenue & Analytics Dashboard
- Total revenue, collection, and outstanding KPI cards
- Daily/weekly/monthly revenue trend charts
- Top customers by volume and revenue
- Payment collection rate metrics

### 🎨 Premium SaaS UI
- Modern, responsive design built with Tailwind CSS
- Dark/light mode ready
- Mobile-friendly across all screen sizes
- Clean sidebar navigation with role-aware views

---

## 🏗️ Architecture

```
Malwa-Milk-Farm-ERP
│
├── 🖥️  Frontend          React 18 + Vite + Tailwind CSS
│       └── SaaS-grade dashboard UI, reusable component library
│
├── ⚙️  Backend           Node.js + Express REST API
│       └── Business logic, authentication, data validation
│
├── 🗄️  Database          PostgreSQL
│       └── Relational schema for customers, deliveries, payments
│
└── 🧪  Tests             Automated test suite
        └── Unit + integration tests for critical flows
```

**Tech Choices & Why:**

| Layer | Technology | Reason |
|---|---|---|
| Frontend | React 18 + Vite | Fast HMR, component reusability, modern SPA |
| Styling | Tailwind CSS | Rapid UI dev, consistent design system |
| Backend | Node.js + Express | Lightweight, async-first, JS full-stack consistency |
| Database | PostgreSQL | Relational integrity for financial records |
| Language | JavaScript (81.8%) + Python (14.1%) | JS for app logic, Python for scripts & automation |

---

## ⚡ Quick Start

### Prerequisites

Make sure you have the following installed:

```bash
node --version    # v18+ recommended
npm --version     # v9+
psql --version    # PostgreSQL 14+
```

### 1. Clone the Repository

```bash
git clone https://github.com/Prabhmehar003/Malwa-Milk-Farm-erp.git
cd Malwa-Milk-Farm-erp
git checkout premium-dashboard
```

### 2. Configure the Database

```bash
# Create the PostgreSQL database
psql -U postgres
CREATE DATABASE malwa_milk_farm;
\q
```

### 3. Set Up the Backend

```bash
cd backend
npm install

# Create environment file
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=malwa_milk_farm
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key
```

```bash
# Run database migrations
npm run migrate

# Start backend server
npm run dev
```

Backend runs at → `http://localhost:5000`

### 4. Set Up the Frontend

```bash
cd ../frontend
npm install

# Create environment file
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

```bash
# Start the development server
npm run dev
```

Frontend runs at → `http://localhost:5173`

### 5. Open the App 🎉

Navigate to `http://localhost:5173` and you'll see the premium Malwa Milk Farm ERP dashboard live.

---

## 📂 Project Structure

```
Malwa-Milk-Farm-erp/
│
├── frontend/                     # React frontend application
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   │   ├── Dashboard/        # Revenue & analytics widgets
│   │   │   ├── Customers/        # Customer management views
│   │   │   ├── MilkTracking/     # Delivery log forms & tables
│   │   │   ├── Payments/         # Billing and payment UI
│   │   │   └── Layout/           # Sidebar, navbar, wrappers
│   │   ├── pages/                # Route-level page components
│   │   ├── hooks/                # Custom React hooks
│   │   ├── services/             # API call abstractions
│   │   └── utils/                # Helper functions
│   └── public/                   # Static assets
│
├── backend/                      # Node.js/Express API
│   ├── routes/                   # Express route handlers
│   │   ├── customers.js          # Customer CRUD endpoints
│   │   ├── milk.js               # Milk delivery endpoints
│   │   ├── payments.js           # Billing & payment endpoints
│   │   └── analytics.js          # Revenue & report endpoints
│   ├── controllers/              # Business logic layer
│   ├── models/                   # Database models/queries
│   ├── middleware/               # Auth, validation, error handling
│   └── config/                   # DB connection, env config
│
├── tests/                        # Automated test suite
│   ├── unit/                     # Unit tests
│   └── integration/              # Integration tests
│
├── test_reports/                 # Test execution reports
├── memory/                       # Agent memory files
├── design_guidelines.json        # UI/UX design tokens
├── .gitignore
└── README.md
```

---

## 🌐 API Reference

Base URL: `http://localhost:5000/api`

### Customers

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/customers` | List all customers |
| `GET` | `/customers/:id` | Get customer by ID |
| `POST` | `/customers` | Create a new customer |
| `PUT` | `/customers/:id` | Update customer details |
| `DELETE` | `/customers/:id` | Delete a customer |

### Milk Deliveries

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/milk` | List all delivery logs |
| `GET` | `/milk/:customerId` | Get deliveries by customer |
| `POST` | `/milk` | Log a new delivery |
| `PUT` | `/milk/:id` | Update a delivery record |

### Payments

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/payments` | List all payments |
| `GET` | `/payments/:customerId` | Get payments by customer |
| `POST` | `/payments` | Record a payment |
| `GET` | `/bills/:customerId` | Generate monthly bill |

### Analytics

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/analytics/revenue` | Revenue overview & trends |
| `GET` | `/analytics/top-customers` | Top customers by volume |
| `GET` | `/analytics/collection-rate` | Payment collection rate |

---

## 🧪 Running Tests

```bash
# Run all tests
cd tests
npm test

# Run with coverage report
npm run test:coverage

# View test reports
cat test_reports/latest.md
```

---

## 🖼️ Screenshots

> _Coming soon — add screenshots of your dashboard, customer list, and analytics page here for maximum visual impact on GitHub._

**Tip:** Add images like this:
```markdown
![Dashboard Overview](./assets/screenshots/dashboard.png)
![Customer Management](./assets/screenshots/customers.png)
![Revenue Analytics](./assets/screenshots/analytics.png)
```

---

## 🛣️ Roadmap

- [x] Customer Management Module
- [x] Milk Delivery Tracking
- [x] Payment & Billing System
- [x] Revenue Analytics Dashboard
- [x] Premium SaaS UI (Tailwind CSS)
- [ ] SMS/WhatsApp notifications for payment reminders
- [ ] PDF bill generation & download
- [ ] Multi-farm / multi-branch support
- [ ] Role-based access control (Owner / Staff)
- [ ] Mobile app (React Native)
- [ ] Cattle health tracking integration

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

```bash
# Fork the repo, then clone your fork
git clone https://github.com/YOUR_USERNAME/Malwa-Milk-Farm-erp.git

# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes, then commit
git commit -m "feat: add your feature description"

# Push and open a Pull Request
git push origin feature/your-feature-name
```

Please follow conventional commit messages (`feat:`, `fix:`, `docs:`, `refactor:`).

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 👨‍💻 Author

<div align="center">

**Prabhmehar Singh**

[![GitHub](https://img.shields.io/badge/GitHub-Prabhmehar003-181717?style=flat-square&logo=github)](https://github.com/Prabhmehar003)

_Built with ❤️ for Malwa Milk Farm — because every farm deserves enterprise-grade software._

</div>

---

<div align="center">

⭐ **If this project helped you, please give it a star!** ⭐

</div>
