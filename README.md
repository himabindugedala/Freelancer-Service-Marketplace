# Freelance Service Marketplace (Full-Stack Platform)

A production-ready, full-stack Freelance Service Marketplace web application engineered with modern web standards, role-based workflows, simulated escrow payments, real-time messaging, and smart recommendation matching.

---

## 🚀 Live Servers & Quick Access

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Backend REST API**: [http://localhost:5000/api](http://localhost:5000/api)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔑 Pre-Seeded Demo Accounts

The application automatically seeds a comprehensive set of realistic categories, services, projects, proposals, orders, and demo accounts upon first startup. Use the quick-fill buttons on the login screen or these credentials:

| Role | Email | Password | Starting Balance | Permissions |
|---|---|---|---|---|
| **Platform Administrator** | `admin@marketplace.com` | `Admin123!Secure` | $10,000 | Platform analytics, user suspension, moderation, dispute resolution |
| **Client 1 (TechCorp)** | `client1@techcorp.com` | `Password123!` | $5,000 | Post projects, receive bids, atomic escrow hiring, approve/deliver |
| **Client 2 (GrowthScale)** | `client2@growthscale.io` | `Password123!` | $3,500 | Project management, direct service purchase, leave reviews |
| **Freelancer 1 (Full-Stack)** | `freelancer1@marketplace.com` | `Password123!` | $0 ($4,200 earned) | Publish services, submit proposals, deliver milestones |
| **Freelancer 2 (Designer)** | `freelancer2@marketplace.com` | `Password123!` | $0 ($2,800 earned) | Manage design gigs, review client briefs, live chat |

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 with Vite and TypeScript (Strict Mode)
- **Styling**: Tailwind CSS with custom typography, responsive design, and glassmorphism accents
- **Routing**: React Router DOM v6 with protected routes and role-based redirects
- **State & Context**: Context API for Authentication (`AuthContext`), WebSocket (`SocketContext`), and Alerts (`NotificationContext`)
- **HTTP Client**: Axios with automatic JWT interceptors and typed API service modules
- **Forms & Validation**: React Hook Form with Zod schemas
- **Icons**: Lucide React
- **Real-Time**: Socket.IO Client for instant messaging and live notifications
- **Testing**: Vitest + React Testing Library + JSDOM

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database & ODM**: MongoDB with Mongoose ODM
- **Zero-Config Database Fallback**: Embedded `mongodb-memory-server` automatically spins up if an external MongoDB daemon is not detected
- **Authentication**: Stateless JSON Web Tokens (JWT) with `bcryptjs` password hashing
- **Real-Time Engine**: Socket.IO with JWT handshake authentication and room multiplexing
- **File Uploads**: Multer with localized storage in `/uploads` and disk streaming
- **Validation**: Zod schema validation middleware
- **Security**: Helmet, CORS origin restriction, and Express rate limiting
- **Testing**: Vitest + Supertest integration suite

---

## 📂 Project Architecture

```
FSM project/
├── backend/
│   ├── src/
│   │   ├── config/              # Environment config and zero-config DB connection
│   │   ├── controllers/         # 15 controller modules (auth, orders, proposals, chat, etc.)
│   │   ├── middleware/          # JWT auth, role RBAC, Zod validation, Multer, rate limiter
│   │   ├── models/              # 13 Mongoose schemas (User, Order, Service, Project, etc.)
│   │   ├── routes/              # Modular Express routers aggregated under /api
│   │   ├── scripts/             # Database seed script with rich realistic demo data
│   │   ├── services/            # Order state machine, matching engine, notifications
│   │   ├── sockets/             # Socket.IO room management and real-time chat
│   │   ├── validators/          # Zod request validation schemas
│   │   ├── app.js               # Express application configuration
│   │   └── server.js            # HTTP + Socket.IO server boot with auto-seed
│   ├── tests/                   # Backend Vitest integration test suite (18 tests)
│   ├── uploads/                 # Static uploads directory
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/          # Common UI (Button, Input, Modal, ServiceCard, Navbar, etc.)
│   │   ├── context/             # AuthContext, SocketContext, NotificationContext
│   │   ├── layouts/             # MainLayout, DashboardLayout, AdminLayout
│   │   ├── pages/
│   │   │   ├── public/          # Home, BrowseServices, ServiceDetail, BrowseFreelancers, HowItWorks
│   │   │   ├── auth/            # Login, Register, ForgotPassword
│   │   │   ├── client/          # ClientDashboard, PostProject, MyProjects, ProjectProposals, Orders
│   │   │   ├── freelancer/      # FreelancerDashboard, MyServices, CreateService, BrowseProjects, Orders
│   │   │   ├── shared/          # MessagesPage (live chat), NotificationsPage, SettingsPage
│   │   │   └── admin/           # AdminDashboard, AdminUsers, AdminServices, AdminReports
│   │   ├── services/            # Axios instance and typed endpoint functions
│   │   ├── types/               # TypeScript interfaces for full data model
│   │   ├── App.tsx              # Main application router
│   │   ├── App.test.tsx         # Component unit tests
│   │   └── main.tsx             # Entrypoint
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
└── README.md
```

---

## ⚡ Getting Started

### 1. Installation

Both frontend and backend dependencies are installed. To install manually:

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Environment Configuration

Default `.env` files are provided for both tiers:

**Backend (`backend/.env`):**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/freelance_marketplace
JWT_SECRET=super_secret_marketplace_jwt_key_2025_secure!
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
UPLOAD_DIR=uploads
ADMIN_EMAIL=admin@marketplace.com
ADMIN_PASSWORD=Admin123!Secure
ADMIN_NAME=Platform Administrator
```

**Frontend (`frontend/.env`):**
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

> **Note on Zero-Config Database:** If a local MongoDB instance (`mongod`) is not running at `mongodb://localhost:27017`, the backend automatically launches an embedded in-memory MongoDB server. No manual MongoDB installation or configuration is necessary.

### 3. Running the Application

Open two terminal windows:

```bash
# Terminal 1: Backend Server
cd backend
npm start
# Server boots at http://localhost:5000 and auto-seeds initial data

# Terminal 2: Frontend Development Server
cd frontend
npm run dev
# Vite runs at http://localhost:5173
```

---

## 🧪 Automated Testing & Verification

### Backend Integration Tests (18 tests)
```bash
cd backend
npm test
```
*Covers authentication, service listing, filtering, order state transitions, proposal bidding, and admin authorization.*

### Frontend Component Tests (5 tests)
```bash
cd frontend
npm test
```
*Covers interactive buttons, form inputs, dynamic star ratings, empty states, and service cards.*

### Complete End-to-End Workflow Test (28 tests)
A PowerShell script executes the complete lifecycle against the live backend server:
```powershell
powershell -ExecutionPolicy Bypass -File "C:\Users\himab\.gemini\antigravity\brain\5325a44f-7e00-4801-a89a-ec610ac6f847\scratch\api_test.ps1"
```

**Verified Workflows in E2E Suite:**
1. Health check verification
2. Client account registration & instant initial wallet credit
3. Freelancer account registration & profile instantiation
4. Category listing
5. JWT authenticated `/auth/me` profile resolution
6. Public marketplace service browsing & full-text search
7. Service detail lookup with seller reputation & reviews
8. Freelancer service creation with skills and tiered parameters
9. Freelancer services query
10. Client project posting with budget constraints and deadline
11. Freelancer proposal submission with cover letter & bid amount
12. Client proposal review and profile inspection
13. Atomic proposal acceptance: Escrow deposit + Order creation + Other bids rejected
14. Dual-party order visibility verification
15. Freelancer work delivery with delivery notes
16. Client revision request with revision counter increment
17. Freelancer work re-delivery
18. Client completion approval: Escrow release to freelancer wallet + balance update
19. Client review and star rating submission
20. Freelancer directory exploration
21. Freelancer public profile with portfolio & stats
22. Real-time notifications retrieval
23. Direct service purchase with automatic escrow funding
24. Client order cancellation with automated escrow refund
25. Secure administrator login
26. Platform metrics calculation (users, volume, active orders, disputes)
27. Client dashboard order summary
28. Freelancer dashboard order summary

---

## 🛡️ Order State Machine & Escrow Workflow

Orders strictly enforce state transitions to ensure financial and contractual safety:

```
                  ┌───────────────┐
                  │  in_progress  │ ◄─── (Created via Proposal Acceptance or Direct Order)
                  └───────┬───────┘
                          │
            [Freelancer submits delivery]
                          ▼
                  ┌───────────────┐
       ┌─────────►│   delivered   ├──────────┐
       │          └───────┬───────┘          │
       │                  │                  │
 [Freelancer       [Client requests    [Client approves]
  re-delivers]        revision]              │
       │                  ▼                  ▼
       │          ┌───────────────┐   ┌───────────────┐
       └──────────┤revision_req'd │   │   completed   │
                  └───────────────┘   └───────────────┘
                                      (Escrow Released)
```

- **Cancellation / Refund**: At any pre-completion state, an authorized party or admin can cancel the order, immediately issuing a simulated escrow refund to the client's wallet.
- **Audit History**: Every state change writes an immutable entry into `OrderStatusHistory`.

---

## 📡 Key REST API Endpoints

### Authentication & Profiles
- `POST /api/auth/register` - Create client or freelancer account
- `POST /api/auth/login` - Authenticate and receive JWT
- `GET /api/auth/me` - Current session user & profile
- `PUT /api/auth/profile` - Update bio, skills, hourly rate, and portfolio

### Services (Gigs)
- `GET /api/services` - Filtered & paginated services (search, category, price, rating)
- `GET /api/services/:id` - Service details, freelancer profile, and reviews
- `POST /api/services` - Create service (*Freelancer only*)
- `PUT /api/services/:id` - Edit service (*Owner only*)
- `DELETE /api/services/:id` - Delete service (*Owner/Admin*)

### Projects & Proposals
- `GET /api/projects` - Browse open client projects
- `POST /api/projects` - Post project with budget & skills (*Client only*)
- `POST /api/proposals/project/:projectId` - Submit bid proposal (*Freelancer only*)
- `GET /api/proposals/project/:projectId` - View bids on project (*Client only*)
- `POST /api/proposals/:proposalId/accept` - Atomic hiring & escrow funding (*Client only*)

### Orders & Escrow
- `POST /api/orders/direct` - Buy service directly (*Client only*)
- `GET /api/orders/my/orders` - Role-filtered orders list
- `GET /api/orders/:id` - Order details, delivery notes, and audit log
- `POST /api/orders/:id/deliver` - Submit work delivery (*Freelancer only*)
- `POST /api/orders/:id/revision` - Request revision (*Client only*)
- `POST /api/orders/:id/approve` - Approve order & release escrow (*Client only*)
- `POST /api/orders/:id/cancel` - Cancel order & refund escrow

### Real-Time Chat & Notifications
- `GET /api/chat/conversations` - User conversation list
- `POST /api/chat/conversations` - Create or resume conversation
- `GET /api/chat/conversations/:id/messages` - Paginated chat messages
- `GET /api/notifications` - User alerts and unread count
- `PATCH /api/notifications/:id/read` - Mark notification as read

### Admin Administration
- `GET /api/admin/stats` - Platform health, financial volume, and counts
- `GET /api/admin/users` - Paginated user management with status filters
- `PATCH /api/admin/users/:id/toggle-status` - Suspend or activate user
- `POST /api/admin/seed` - Re-populate demo database on demand
