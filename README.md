# TransitOps — Fleet Operations & Analytics Platform

TransitOps is a full-stack Next.js (App Router) platform backed by a Neo4j Graph database, built for real-time fleet operations management, driver dispatch, maintenance scheduling, and business cost analysis. 

All views, tables, and statistics are **fully dynamic** and integrated with backend Neo4j API endpoints. There are no static mock data left in the frontend view controllers.

---

## 🔑 Demo Test Accounts

The database contains seeded test accounts with distinct role-based access control. You **must select the matching role** in the login dropdown to authenticate successfully:

| Email | Password | Role to Select | Dashboard Access Permissions |
| :--- | :--- | :--- | :--- |
| **`manager@transitops.com`** | `password123` | **Fleet Manager** | View All, Vehicles, Drivers, Trips, Maintenance, Reports |
| **`driver@transitops.com`** | `password123` | **Driver** | View Dashboard, Vehicles, Trips, Live Map |
| **`safety@transitops.com`** | `password123` | **Safety Officer** | View Dashboard, Drivers, Live Map |
| **`analyst@transitops.com`** | `password123` | **Financial Analyst** | View Dashboard, Reports, Fuel & Expenses |

---

## 🚀 Getting Started

### 1. Prerequisite Configuration
Ensure your environment variables are configured in `.env.local` at the root of the project:
```env
NEO4J_URI=neo4j+s://your-instance.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your-neo4j-password
NEO4J_DATABASE=neo4j

NEXTAUTH_SECRET=your-next-auth-secret
NEXTAUTH_URL=http://localhost:3000
```

### 2. Seeding the Neo4j Database
Initialize constraints, seed standard users, and generate mock operations logs (vehicles, drivers, fuel logs, and completed Pune/Mumbai trips) by running the scripts:
```bash
# 1. Initialize DB constraints
npx tsx scripts/init-db.ts

# 2. Seed standard users and passwords
npx tsx scripts/seed-users.ts

# 3. Seed demo operational records and transactions
npx tsx scripts/seed-demo.ts
```

### 3. Launching the App
Install dependencies and run the development server:
```bash
npm install
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser to log in and test.

---

## 🛠️ Implemented Features (100% Dynamic)

### 1. Authentication & Route Gating
- **Role Validation**: NextAuth checks selected role mismatch against Neo4j user nodes at login time.
- **Route Guarding**: Next.js middleware blocks access to `/dashboard`, `/vehicles`, `/drivers`, `/trips`, `/maintenance`, `/reports`, and all `/api/...` endpoints for unauthenticated users, returning standard `401 Unauthorized` responses for API requests.

### 2. Live Dashboard
- Key performance indicators showing vehicle availability, driver statuses, and fleet utilization dynamically compiled from Neo4j.
- Active trips lists and pending alert widgets.
- Styled, controlled filters for vehicle types, status, and region.

### 3. Vehicle Registry
- Complete fleet tracking showing vehicle statuses, odometer readings, and region properties.
- **New Vehicle Sheet**: Validates registration numbers and prevents duplicates by checking database constraints.

### 4. Drivers Pool
- Interactive list of drivers, license details, contact numbers, and safety scores.
- Highlights expired license alerts and prevents expired or suspended drivers from being selected during dispatching.

### 5. Trip Management Kanban Workspace
- Fully interactive board splitting trips into **Draft**, **Dispatched**, **Completed**, and **Cancelled** columns.
- **New Trip Sheet**: Provides live cargo-weight checks matching selected vehicle capacities.
- **Actions**: Dispatch drafts, cancel active trips, or complete trips (prompting for final odometer readings and fuel consumption).

### 6. Maintenance Log
- Interactive cost trackers, records creation sheets, closure forms, and live status updates.

### 7. Fuel & Other Expenses
- Per-vehicle operational cost panels showing aggregate expenditures.
- Tabs displaying detailed fuel logs (liters, cost, dates) and other operating expenses (Toll/Other) loaded directly from the database.

### 8. Reports & Analytics
- 2x2 grid containing responsive charts built with Recharts:
  - **Fuel Efficiency**: Displays average distance traveled per liter of fuel consumed.
  - **Fleet Utilization**: Horizontal bar chart showing active vs total vehicles by type.
  - **Operational Cost**: Stacked bar chart showing Fuel, Maintenance, and Toll/Other costs per vehicle.
  - **Vehicle ROI**: Detailed table calculating ROI metrics based on completion revenue ($15/km) vs acquisition cost.
- **Direct Export**: Stream files in CSV or PDF formats using export buttons per report card.
