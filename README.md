<div align="center">
```
███╗   ███╗ █████╗ ██╗     ██╗    ██╗ █████╗
████╗ ████║██╔══██╗██║     ██║    ██║██╔══██╗
██╔████╔██║███████║██║     ██║ █╗ ██║███████║
██║╚██╔╝██║██╔══██║██║     ██║███╗██║██╔══██║
██║ ╚═╝ ██║██║  ██║███████╗╚███╔███╔╝██║  ██║
╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝ ╚══╝╚══╝ ╚═╝  ╚═╝
```
 
### 🐄 MILK FARM ERP — *Enterprise Operations, Farm Scale*
 
<br/>
**[ [🚀 LIVE DEMO →](https://malwa-milk-farm-erp.vercel.app/dashboard) ]**
 
<br/>
[![Live](https://img.shields.io/badge/🟢_LIVE-malwa--milk--farm--erp.vercel.app-1a9c4a?style=for-the-badge)](https://malwa-milk-farm-erp.vercel.app/dashboard)
 
<br/>
[![React](https://img.shields.io/badge/React_18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js_Express-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-81.8%25-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/)
[![MIT License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Active_✓-brightgreen?style=flat-square)]()
[![Deployed on Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=flat-square&logo=vercel)](https://malwa-milk-farm-erp.vercel.app/dashboard)
 
<br/>
---
 
> *"Most dairy farms run on paper ledgers and WhatsApp messages.*  
> *This changes that."*
 
---
 
</div>
<br/>
## 🌐 Try It Live — Right Now
 
> No setup. No login walls. Open it straight from your browser.
 
```
https://malwa-milk-farm-erp.vercel.app/dashboard
```
 
**→ [Open the Dashboard](https://malwa-milk-farm-erp.vercel.app/dashboard)**
 
The full production app — customer ledgers, milk tracking, payment analytics, revenue dashboards — all live and running.
 
<br/>
---
 
## 📌 What Is This?
 
**Malwa Milk Farm ERP** is a full-stack, production-grade Enterprise Resource Planning system purpose-built for dairy farm operations.
 
It replaces the scattered notebooks, WhatsApp receipts, and mental maths that most dairy businesses still rely on — with a clean, modern SaaS dashboard that tracks every litre, every customer, and every rupee in one place.
 
| ❌ The Old Way | ✅ The ERP Way |
|:---|:---|
| Manual *khata* entries per customer | Automated digital customer ledger |
| No daily milk collection insight | Real-time milk tracking dashboard |
| Chasing payments by phone | Payment analytics with aging analysis |
| Zero revenue visibility | Interactive charts + KPI cards |
| Notebooks across the farm | Centralised PostgreSQL data warehouse |
 
<br/>
---
 
## ✨ Feature Breakdown
 
<details>
<summary><b>👥 Customer Management</b></summary>
<br/>
- Register & manage dairy customers with complete profiles
- Per-customer milk delivery history at a glance
- Outstanding balance tracking — no more mental maths
- Search, filter, and sort across all records
</details>
<details>
<summary><b>🥛 Milk Tracking</b></summary>
<br/>
- Log daily delivery quantities per customer
- Fat percentage & quality tracking
- Shift-wise (morning / evening) collection records
- Historical delivery trends visualised as graphs
</details>
<details>
<summary><b>💰 Payment & Billing</b></summary>
<br/>
- Auto-generate monthly bills from delivery logs
- Record partial and full payments
- Outstanding dues dashboard with aging analysis
- Full payment history per customer
</details>
<details>
<summary><b>📊 Analytics Dashboard</b></summary>
<br/>
- Revenue, collection, and outstanding KPI cards
- Daily / weekly / monthly trend charts
- Top customers by volume and revenue
- Payment collection rate metrics
</details>
<br/>
---
 
## 🏗️ Architecture
 
```
┌─────────────────────────────────────────────────────────────┐
│                   MALWA MILK FARM ERP                       │
│                                                             │
│   ┌──────────────────┐      ┌──────────────────────────┐   │
│   │   🖥️  FRONTEND    │ ───► │      ⚙️  BACKEND          │   │
│   │                  │      │                          │   │
│   │  React 18 + Vite │      │  Node.js + Express       │   │
│   │  Tailwind CSS    │      │  REST API                │   │
│   │  SaaS Dashboard  │ ◄─── │  Auth + Validation       │   │
│   └──────────────────┘      └────────────┬─────────────┘   │
│                                          │                  │
│                             ┌────────────▼─────────────┐   │
│                             │      🗄️  DATABASE          │   │
│                             │                          │   │
│                             │  PostgreSQL              │   │
│                             │  Customers, Deliveries,  │   │
│                             │  Payments, Analytics     │   │
│                             └──────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```
 
| Layer | Technology | Why |
|:---|:---|:---|
| Frontend | React 18 + Vite | Fast HMR, reusable components, modern SPA |
| Styling | Tailwind CSS | Rapid UI dev, consistent design system |
| Backend | Node.js + Express | Lightweight, async-first, JS full-stack |
| Database | PostgreSQL | Relational integrity for financial records |
| Language | JavaScript 81.8% + Python 14.1% | JS for app logic, Python for scripts & automation |
| Hosting | Vercel | Zero-config deployment, global CDN |
 
<br/>
---
 
## ⚡ Run It Locally
 
### Prerequisites
 
```bash
node --version    # v18+ recommended
npm --version     # v9+
psql --version    # PostgreSQL 14+
```
 
### 1 — Clone
 
```bash
git clone https://github.com/Prabhmehar003/Malwa-Milk-Farm-erp.git
cd Malwa-Milk-Farm-erp
git checkout premium-dashboard
```
 
### 2 — Database
 
```bash
psql -U postgres
CREATE DATABASE malwa_milk_farm;
\q
```
 
### 3 — Backend
 
```bash
cd backend
npm install
cp .env.example .env
```
 
```env
# .env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=malwa_milk_farm
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key
```
 
```bash
npm run migrate
npm run dev
# ✓ Backend → http://localhost:5000
```
 
### 4 — Frontend
 
```bash
cd ../frontend
npm install
cp .env.example .env
```
 
```env
# .env
VITE_API_URL=http://localhost:5000/api
```
 
```bash
npm run dev
# ✓ Frontend → http://localhost:5173
```
 
### 5 — Done 🎉
 
Open `http://localhost:5173` — the full ERP dashboard is live locally.
 
> **Or just use the deployed version:** [malwa-milk-farm-erp.vercel.app/dashboard](https://malwa-milk-farm-erp.vercel.app/dashboard)
 
<br/>
---
 
## 📂 Project Structure
 
```
Malwa-Milk-Farm-erp/
│
├── frontend/                     # React frontend
│   └── src/
│       ├── components/
│       │   ├── Dashboard/        # Revenue & analytics widgets
│       │   ├── Customers/        # Customer management views
│       │   ├── MilkTracking/     # Delivery log forms & tables
│       │   ├── Payments/         # Billing & payment UI
│       │   └── Layout/           # Sidebar, navbar, wrappers
│       ├── pages/                # Route-level components
│       ├── hooks/                # Custom React hooks
│       ├── services/             # API call abstractions
│       └── utils/                # Helper functions
│
├── backend/                      # Node.js + Express API
│   ├── routes/
│   │   ├── customers.js          # Customer CRUD
│   │   ├── milk.js               # Milk delivery endpoints
│   │   ├── payments.js           # Billing & payment
│   │   └── analytics.js          # Revenue & reporting
│   ├── controllers/              # Business logic
│   ├── models/                   # DB queries
│   ├── middleware/               # Auth, validation, errors
│   └── config/                   # DB connection, env
│
├── tests/                        # Automated test suite
│   ├── unit/
│   └── integration/
│
├── test_reports/
├── design_guidelines.json
└── README.md
```
 
<br/>
---
 
## 🌐 API Reference
 
**Base URL (local):** `http://localhost:5000/api`
 
### Customers
| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/customers` | List all customers |
| `GET` | `/customers/:id` | Get customer by ID |
| `POST` | `/customers` | Create a new customer |
| `PUT` | `/customers/:id` | Update customer |
| `DELETE` | `/customers/:id` | Delete customer |
 
### Milk Deliveries
| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/milk` | All delivery logs |
| `GET` | `/milk/:customerId` | Deliveries by customer |
| `POST` | `/milk` | Log a new delivery |
| `PUT` | `/milk/:id` | Update a delivery record |
 
### Payments
| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/payments` | All payments |
| `GET` | `/payments/:customerId` | Payments by customer |
| `POST` | `/payments` | Record a payment |
| `GET` | `/bills/:customerId` | Generate monthly bill |
 
### Analytics
| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/analytics/revenue` | Revenue overview & trends |
| `GET` | `/analytics/top-customers` | Top customers by volume |
| `GET` | `/analytics/collection-rate` | Payment collection rate |
 
<br/>
---
 
## 🧪 Tests
 
```bash
cd tests
npm test                  # Run all tests
npm run test:coverage     # With coverage report
cat test_reports/latest.md
```
 
<br/>
---
 
## 🛣️ Roadmap
 
```
[✅] Customer Management Module
[✅] Milk Delivery Tracking
[✅] Payment & Billing System
[✅] Revenue Analytics Dashboard
[✅] Premium SaaS UI (Tailwind CSS)
[✅] Live Deployment on Vercel
 
[⏳] SMS / WhatsApp payment reminders
[⏳] PDF bill generation & download
[⏳] Multi-farm / multi-branch support
[⏳] Role-based access (Owner / Staff)
[⏳] Mobile app (React Native)
[⏳] Cattle health tracking integration
```
 
<br/>
---
 
## 🤝 Contributing
 
```bash
# Fork the repo, then:
git clone https://github.com/YOUR_USERNAME/Malwa-Milk-Farm-erp.git
git checkout -b feature/your-feature-name
 
# Make changes, commit with conventional messages:
git commit -m "feat: your feature description"
 
git push origin feature/your-feature-name
# → Open a Pull Request
```
 
Commit conventions: `feat:` `fix:` `docs:` `refactor:`
 
<br/>
---
 
## 📄 License
 
[MIT](LICENSE) — free to use, fork, and build upon.
 
<br/>
---
 
<div align="center">
## 👨‍💻 Built by Prabhmehar Singh
 
[![GitHub](https://img.shields.io/badge/GitHub-Prabhmehar003-181717?style=for-the-badge&logo=github)](https://github.com/Prabhmehar003)
[![Live App](https://img.shields.io/badge/🚀_Live_App-Visit_Now-1a9c4a?style=for-the-badge)](https://malwa-milk-farm-erp.vercel.app/dashboard)
 
<br/>
*Because every farm deserves enterprise-grade software.*
 
<br/>
---
 
⭐ **Found this useful? Star the repo and share it.** ⭐
 
*A star takes 2 seconds. It helps more people discover this project.*
 
---
 
**[🚀 Open Live App](https://malwa-milk-farm-erp.vercel.app/dashboard)** · **[📂 Browse Code](https://github.com/Prabhmehar003/Malwa-Milk-Farm-erp)** · **[🐛 Report Bug](https://github.com/Prabhmehar003/Malwa-Milk-Farm-erp/issues)** · **[💡 Request Feature](https://github.com/Prabhmehar003/Malwa-Milk-Farm-erp/issues)**
 
</div>
