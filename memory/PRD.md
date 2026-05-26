# MALWA MILK FARM - Product Requirements Document

## Original Problem Statement
Build a modern full-stack dairy management web application for MALWA MILK FARM with daily milk customer entries (Cow/Buffalo milk, prices ₹60/76/78/80, Morning/Evening sessions), automatic revenue calculation, advanced analytics dashboard with 15/30-day averages and % comparisons, interactive Recharts charts, customer management with searchable/filterable breakdown table, full payment tracking, export to PDF/Excel, role-based auth (Admin/Staff), and premium glassmorphism UI inspired by Stripe/Linear/Notion with royal blue, deep navy, white, and soft gold palette.

## Architecture
- **Frontend**: React 19 + Tailwind CSS + Recharts + Framer Motion + Shadcn UI
- **Backend**: FastAPI + SQLAlchemy (async) + PostgreSQL
- **Auth**: JWT (httpOnly cookies) with bcrypt + role-based access (admin/staff)
- **Exports**: jsPDF + xlsx libraries (client-side)

## User Personas
1. **Admin** — Full access including customer deletion and user management
2. **Staff** — Daily operations (entries, customers, payments) but no destructive actions

## Core Requirements (Static)
- Milk entries with customer, type, price, quantity, session, auto-revenue
- KPI cards: today's qty/revenue, 15/30-day averages, % vs previous week
- Charts: 30-day revenue trend, production trend, milk distribution
- Customer CRUD + searchable table
- Payment tracking (paid/pending/partial)
- PDF/Excel export with date filters
- Premium dark glassmorphism UI

## What's Been Implemented (2026-02)
- ✅ Full auth system (login/register/logout/me/refresh) with JWT cookies + bcrypt + brute-force protection
- ✅ Admin & Staff seeding with role-based delete protection
- ✅ Customer CRUD (admin can delete)
- ✅ Milk Entries CRUD with auto revenue calc, filters (milk type, session, date)
- ✅ Analytics endpoints (dashboard stats + chart data)
- ✅ Payment tracking with pending balance calculation
- ✅ Frontend: Login, Register, Dashboard (6 KPI cards + 3 charts), Entries, Customers, Reports, Settings
- ✅ PDF/Excel export from Reports page
- ✅ Premium dark glassmorphism UI with royal blue + soft gold accents
- ✅ Sidebar nav with Lucide icons + page transitions (Framer Motion)
- ✅ Toast notifications (Sonner)
- ✅ Confirmation modals for delete operations
- ✅ Removed Emergent watermark; custom title "MALWA MILK FARM | Dairy Management"

## Test Results
- Backend: 19/19 PASSED (100%) — pytest report at `/app/test_reports/pytest/pytest_results.xml`
- Frontend: All pages load, charts render, auth+RBAC working

## Prioritized Backlog
### P1 (Next iteration)
- Dedicated Payments page with full management UI (currently only pending in Reports)
- Fix % change display when previous week has no data (show "—" instead of huge %)
- Add seed sample data for fresh-install demo

### P2 (Future)
- Dark/Light mode toggle (currently dark only)
- Session-wise comparison chart (Morning vs Evening)
- SMS/Email payment reminders for overdue customers
- Multi-language support (English/Hindi)
- Mobile PWA support
- Bulk import customers via CSV
