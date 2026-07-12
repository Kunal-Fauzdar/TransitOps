# TransitOps

TransitOps is a full-stack fleet operations platform built with Next.js App Router and Neo4j to manage vehicles, drivers, trips, maintenance, fuel logs, expenses, and reporting from a single operational dashboard. The project is designed around the mandatory modules, business rules, and analytics requirements defined in the TransitOps brief, while also reflecting a realistic two-developer delivery strategy for a short hackathon build window.

## Project Scope

The original brief targets an end-to-end transport operations platform with authentication, fleet lifecycle management, dispatch workflows, maintenance, fuel and expense tracking, reporting, and analytics. In practice, the full brief plus bonus features is larger than a small team can complete to production quality in a compressed build window, so the recommended implementation strategy prioritizes a demo-ready core with all mandatory modules and business rules enforced first, and bonus features only if time remains.

## Objectives

TransitOps is intended to replace spreadsheet-based transport operations with a centralized workflow that improves scheduling, maintenance visibility, dispatch accuracy, cost tracking, and operational reporting. The system should support authenticated access, role-aware navigation, CRUD workflows, transactional status updates, and analytics outputs that are useful during a live demo and extensible after the hackathon.

## Core Modules

- Authentication with role-based access control.
- Dashboard with KPI summaries and filter controls.
- Vehicle Registry.
- Driver Management.
- Trip Management.
- Maintenance Log.
- Fuel & Expense Management.
- Reports & Analytics with CSV export.

## Recommended Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ App Router |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Component System | shadcn/ui |
| Forms | react-hook-form + zod |
| Tables | TanStack Table |
| Charts | Recharts |
| Motion | Framer Motion |
| Authentication | NextAuth credentials provider |
| Database | Neo4j Aura / Neo4j via official `neo4j-driver` |

This stack aligns with the implementation direction in the task planning sheet and supports a single-repo full-stack approach where frontend screens and backend API routes live in the same Next.js project.

## Domain Model

The application should be built against a clear shared entity model so frontend and backend stay aligned.

| Entity | Key Fields |
|---|---|
| User | id, name, email, passwordHash, role |
| Vehicle | regNumber, name, type, maxLoadCapacity, odometer, acquisitionCost, status, region |
| Driver | id, name, licenseNumber, licenseCategory, licenseExpiryDate, contactNumber, safetyScore, status |
| Trip | id, source, destination, vehicleId, driverId, cargoWeight, plannedDistance, actualDistance, fuelConsumed, status, createdAt |
| MaintenanceLog | id, vehicleId, type, cost, startDate, endDate, isActive |
| FuelLog | id, vehicleId, liters, cost, date |
| Expense | id, vehicleId, type, amount, date |

These entities map directly to the brief's expected platform data areas for users, vehicles, drivers, trips, maintenance logs, fuel logs, and expenses.

## Business Rules

These rules are the validation layer of the system and should be enforced in the API and database workflows, not treated as optional UI hints.

1. Vehicle registration numbers must be unique.
2. Retired or In Shop vehicles must be excluded from dispatch selection.
3. Drivers with expired licenses or Suspended status must be excluded from dispatch selection.
4. A vehicle or driver already marked On Trip cannot be assigned to another trip.
5. Cargo weight must not exceed the selected vehicle's maximum load capacity.
6. Dispatching a trip must update both vehicle and driver status to On Trip in one transaction.
7. Completing a trip must update the trip and restore both vehicle and driver to Available in one transaction.
8. Cancelling a dispatched trip must restore both vehicle and driver to Available.
9. Creating an active maintenance record must move the vehicle to In Shop.
10. Closing maintenance must restore the vehicle to Available unless the vehicle has been separately retired.

Rules involving multiple entities should be implemented as single transactional writes in Neo4j to avoid inconsistent states during demos or concurrent actions.

## Roles and Access

The brief defines four target user roles with different responsibilities across the platform.

| Role | Primary Focus |
|---|---|
| Fleet Manager | Vehicles, maintenance, operational efficiency |
| Driver | Trips and active delivery workflows |
| Safety Officer | Drivers, compliance, license validity, safety score |
| Financial Analyst | Fuel, expenses, operational cost, ROI, reporting |

A practical RBAC implementation should gate navigation items, page access, and action controls based on the authenticated session role.

## Frontend Architecture

The frontend should be structured as a Next.js App Router dashboard application with a shared shell, module-specific component folders, and typed API clients.

```text
app/
├── (auth)/login/page.tsx
├── (dashboard)/layout.tsx
├── (dashboard)/dashboard/page.tsx
├── (dashboard)/vehicles/page.tsx
├── (dashboard)/drivers/page.tsx
├── (dashboard)/trips/page.tsx
├── (dashboard)/maintenance/page.tsx
├── (dashboard)/fuel-expenses/page.tsx
├── (dashboard)/reports/page.tsx
└── api/
components/
├── dashboard/
├── vehicles/
├── drivers/
├── trips/
├── maintenance/
├── fuel-expenses/
├── reports/
└── layout/
lib/
├── api-client.ts
├── neo4j.ts
├── types.ts
└── utils.ts
scripts/
└── init-db.ts
```

The UI should follow a dense operations-dashboard style with a sidebar, topbar, data-rich tables, drawers, modals, tabs, and charts, matching the design direction used across the screen set.

## Backend Architecture

The backend should be implemented as Next.js App Router API routes with Neo4j as the primary database and the official Neo4j driver for connectivity. The recommended connection utility is a shared singleton in `lib/neo4j.ts`, backed by environment variables for Neo4j Aura or a self-hosted Neo4j instance.

### Environment Variables

```bash
NEO4J_URI=neo4j+s://<your-instance-id>.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=<your-password>
NEO4J_DATABASE=neo4j
NEXTAUTH_SECRET=<random-string>
NEXTAUTH_URL=http://localhost:3000
```

### Neo4j Constraints

Create database constraints before regular app usage so uniqueness is enforced at the database level.

```cypher
CREATE CONSTRAINT vehicle_reg_unique IF NOT EXISTS FOR (v:Vehicle) REQUIRE v.regNumber IS UNIQUE;
CREATE CONSTRAINT driver_license_unique IF NOT EXISTS FOR (d:Driver) REQUIRE d.licenseNumber IS UNIQUE;
CREATE CONSTRAINT user_email_unique IF NOT EXISTS FOR (u:User) REQUIRE u.email IS UNIQUE;
```

### Graph Model

```text
(:User {id, name, email, passwordHash, role})
(:Vehicle {regNumber, name, type, maxLoadCapacity, odometer, acquisitionCost, status, region})
(:Driver {id, name, licenseNumber, licenseCategory, licenseExpiryDate, contactNumber, safetyScore, status})
(:Trip {id, source, destination, cargoWeight, plannedDistance, actualDistance, fuelConsumed, status, createdAt})
(:MaintenanceLog {id, type, cost, startDate, endDate, isActive})
(:FuelLog {id, liters, cost, date})
(:Expense {id, type, amount, date})
```

### Relationships

```text
(:Trip)-[:USES_VEHICLE]->(:Vehicle)
(:Trip)-[:ASSIGNED_DRIVER]->(:Driver)
(:MaintenanceLog)-[:FOR_VEHICLE]->(:Vehicle)
(:FuelLog)-[:FOR_VEHICLE]->(:Vehicle)
(:Expense)-[:FOR_VEHICLE]->(:Vehicle)
```

## API Surface

The backend should expose route handlers that mirror the platform modules and keep validation close to business rules.

### Auth

- `POST /api/auth/[...nextauth]` for NextAuth credentials-based login and JWT role propagation.

### Vehicles

- `GET /api/vehicles`
- `POST /api/vehicles`
- `GET /api/vehicles/[reg]`
- `PATCH /api/vehicles/[reg]`
- `GET /api/vehicles/dispatch-pool`

### Drivers

- `GET /api/drivers`
- `POST /api/drivers`
- `PATCH /api/drivers/[id]`
- `GET /api/drivers/dispatch-pool`

### Trips

- `GET /api/trips`
- `POST /api/trips`
- `POST /api/trips/[id]/dispatch`
- `POST /api/trips/[id]/complete`
- `POST /api/trips/[id]/cancel`

### Maintenance

- `GET /api/maintenance`
- `POST /api/maintenance`
- `POST /api/maintenance/[id]/close`

### Fuel & Expenses

- `GET/POST /api/fuel-logs`
- `GET/POST /api/expenses`
- `GET /api/vehicles/[reg]/cost-summary`

### Dashboard & Reports

- `GET /api/dashboard/kpis`
- `GET /api/reports/fuel-efficiency`
- `GET /api/reports/utilization`
- `GET /api/reports/operational-cost`
- `GET /api/reports/roi`
- `GET /api/reports/export.csv`

This route structure follows the breakdown in the planning sheet, where feature modules are split vertically into backend and frontend tasks per screen.

## Backend Implementation Principles

- Validate request payloads with zod before database access.
- Use explicit Neo4j write transactions for every multi-node state change.
- Return 422 responses for business-rule violations instead of generic 500 errors.
- Keep query filters aligned with dispatch safety rules so invalid options never appear in pool endpoints.
- Start implementation with connection setup and constraints, then Vehicles, then Drivers, then Trips and Maintenance because those are more stateful and higher risk.

## Screen Inventory

The application maps cleanly to eight primary screens defined in the brief and design workflow.

| Screen | Purpose |
|---|---|
| Login | Authentication entry point |
| Dashboard | KPI and operational overview |
| Vehicle Registry | Fleet asset management |
| Maintenance | Vehicle maintenance workflow |
| Driver Management | Driver profile and compliance management |
| Trip Management | Dispatch lifecycle and trip execution |
| Fuel & Expenses | Cost and fuel tracking |
| Reports & Analytics | Reporting, charts, ROI, CSV export |

## Suggested Delivery Strategy

For a two-developer team on a limited timeline, the most effective strategy is a vertical-slice workflow where each developer owns full modules end to end. This minimizes merge conflicts and allows each screen to become demo-ready independently.

### Branch Strategy

```text
main
└── develop
    ├── feature/setup-nextjs-neo4j
    ├── feature/auth-rbac
    ├── feature/vehicle-registry
    ├── feature/maintenance-log
    ├── feature/dashboard-kpis
    ├── feature/driver-management
    ├── feature/trip-management
    ├── feature/fuel-expense
    └── feature/reports-analytics
```

This structure matches the sheet's module decomposition and helps keep frontend and backend work organized per feature branch.


## Installation

### Prerequisites

- Node.js 18 or later
- npm, pnpm, or yarn
- A Neo4j instance, preferably Neo4j Aura for rapid setup
- Environment variables for NextAuth and Neo4j

### Install

```bash
npm install
```

### Suggested dependencies

```bash
npm install neo4j-driver next-auth bcryptjs zod react-hook-form @hookform/resolvers recharts framer-motion lucide-react @tanstack/react-table
npx shadcn@latest add button input label select table tabs dialog sheet badge progress card textarea
```

### Run the development server

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

Open [http://localhost:3000](http://localhost:3000) after the app starts.

## Database Initialization

A one-time setup script such as `scripts/init-db.ts` should create constraints and seed initial data for users, vehicles, drivers, trips, maintenance logs, fuel logs, and expenses. This supports a reliable demo flow and reduces manual setup errors during judging.

## Demo Workflow Checklist

Use the example workflow from the brief as a manual integration test before the demo.

- Register a vehicle with a valid maximum capacity.
- Register a driver with a valid license.
- Create a trip with cargo weight within capacity.
- Dispatch the trip and confirm both vehicle and driver become On Trip.
- Complete the trip and confirm both return to Available.
- Create a maintenance record and confirm the vehicle becomes In Shop.
- Close maintenance and confirm status restoration rules work as expected.
- Verify reports update fuel efficiency and operational cost using trip and fuel log data.

## Priority Order If Behind Schedule

If time becomes tight, finish all mandatory modules and business rules first, then cut lower-priority enhancements. The recommended cut order is:

1. PDF export
2. Email reminders
3. Vehicle document management
4. Dark mode
5. Advanced chart polish, while keeping table-based reporting if needed

This prioritization is consistent with the project scope and helps preserve a stable, demoable core over incomplete extras.

## Bonus Features

Only begin bonus work after the mandatory flow is functioning end to end.

- Search, filter, and sorting improvements
- Dark mode
- CSV export enhancements
- PDF export
- Email reminders for expiring licenses
- Vehicle document management

## Development Notes

- Keep shared interfaces in `lib/types.ts` and ensure both developers agree on them before module work begins.
- Use role-gated sidebar navigation and protected layouts for cleaner RBAC handling.
- Keep frontend validation aligned with backend rules, but never rely on client-only validation for safety-critical logic.
- Prefer dense, consistent dashboard UI patterns such as tables, drawers, modals, badges, and charts to reduce implementation overhead while maintaining a professional feel.

## License

This repository is a hackathon-oriented implementation of the TransitOps transport operations brief and associated planning worksheet.
