# Job Board Server (Node.js + Express + Prisma)

A TypeScript backend for a job board platform supporting authentication (including Google OAuth), role-based access control, job postings, applications, saved jobs, user/company profiles, dashboards, real-time messaging with Socket.IO, file uploads, and email notifications. Backed by PostgreSQL via Prisma.


## Features

- Authentication & Authorization
  - Email/password signup and signin
  - Email verification (token-based) and resend verification
  - Password reset (request + reset)
  - JWT access/refresh token flow with refresh token persistence and blacklist support
  - Session support (express-session) and Passport integration
  - Google OAuth 2.0 login
  - Role-based access control: EMPLOYER, JOBSEEKER
- Users
  - GET /api/users — list users
  - GET /api/users/me — current authenticated user
  - GET /api/users/:id — get user by ID
- Profiles
  - GET/POST/PUT/DELETE /api/profiles/me — manage the current user profile
  - Upload endpoints: /api/profiles/upload-resume, /api/profiles/upload-profile-image
  - JSON parsing for skills, education, experience
- Companies
  - Public: list companies, get by ID
  - Authenticated employer: get current company (/api/companies/my-company), create, update, delete
- Jobs
  - Public: list jobs, suggestions, by company, get by ID
  - Employer-only: create, update, delete jobs
  - List applications by job (employer)
- Applications
  - Authenticated users can create, update, delete, and list applications
  - Resume upload via Multer
- Saved Jobs (Jobseeker-only)
  - List, check single, check batch, save, remove saved jobs
- Dashboards
  - Jobseeker dashboard + withdraw application
  - Employer dashboard + update application status + profile completion
- Messaging & Realtime
  - REST: list conversations, get conversation by ID, list messages in conversation
  - Socket.IO: presence, secure room join, send message (chat:send), mark read, typing indicators, notifications
- Platform hardening
  - CORS with allowlist FRONTEND_URL
  - Rate limiting
  - Centralized error handling
  - Input validation (express-validator)
- File & Media
  - Multer-based uploads
  - Cloudinary and Firebase Storage integration (configurable)
- Emails & Notifications
  - SMTP transport via Nodemailer
  - Resend SDK available (dependency)


## Tech Stack

- Runtime: Node.js 20.x, TypeScript
- Web: Express
- Auth: Passport (Google OAuth 2.0), JWT (jsonwebtoken), bcrypt, express-session
- DB/ORM: Prisma + PostgreSQL (pg)
- Realtime: Socket.IO
- Validation & Middleware: express-validator, cors, express-rate-limit, body-parser, multer, dotenv
- Media: Cloudinary, Firebase Admin (Storage)
- Email: Nodemailer (SMTP), Resend (dependency present)
- Dev tooling: tsx, ts-node, nodemon, ESLint (@typescript-eslint), Prettier


## Requirements

- Node.js 20.x
- PostgreSQL instance (local or remote)
- A configured .env file (see Environment Variables below)

Optional/feature-specific:
- Google OAuth credentials (Client ID, Secret, Redirect URI)
- Cloudinary account (cloud name, API key, secret) if using Cloudinary
- Firebase service account default credentials and a Storage bucket if using Firebase Storage


## Environment Variables

Create a .env file based on .env.example and ensure the following exist.

Required for auth and app basics:
- DATABASE_URL
- JWT_SECRET
- REFRESH_TOKEN_SECRET
- SESSION_SECRET
- FRONTEND_URL

SMTP (email):
- SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS

Google OAuth:
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GOOGLE_REDIRECT_URI

Cloudinary (if using Cloudinary uploads):
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET

Firebase (if using Firebase Storage):
- FIREBASE_STORAGE_BUCKET
- FIREBASE_PROJECT_ID
- FIREBASE_API_KEY
- FIREBASE_APP_ID
- FIREBASE_MESSAGING_SENDER_ID
- FIREBASE_MEASUREMENT_ID

Other:
- NODE_ENV=development|production


## Scripts

- start: node dist/index.js
- build: tsc
- dev: nodemon --ext ts --exec tsx src/index.ts
- test: echo "Error: no test specified" && exit 1
- lint: eslint .
- lint:fix: eslint . --fix
- format: prettier --write .
- db:generate: prisma generate
- db:migrate: prisma migrate dev
- db:push: prisma push

Examples:
```bash path=null start=null
# install dependencies
npm install

# generate prisma client
yarn prisma generate # or: npm run db:generate

# run database migrations
yarn prisma migrate dev # or: npm run db:migrate

# start in dev mode (watch + tsx)
npm run dev

# build and run production
npm run build
npm start
```


## Project Structure

```text path=null start=null
/home/yehtet/Porfolio/JobBoardServer
├─ package.json
├─ tsconfig.json
├─ .env.example
├─ prisma/
│  ├─ schema.prisma
│  └─ migrations/
├─ src/
│  ├─ index.ts
│  ├─ config/
│  │  ├─ env.config.ts
│  │  ├─ passport.config.ts
│  │  ├─ cloudinary.config.ts
│  │  ├─ firebase.config.ts
│  │  └─ socket.config.ts
│  ├─ controllers/
│  │  ├─ auth.controller.ts
│  │  ├─ user.controller.ts
│  │  ├─ profile.controller.ts
│  │  ├─ company.controller.ts
│  │  ├─ job.controller.ts
│  │  ├─ application.controller.ts
│  │  ├─ saved-job.controller.ts
│  │  ├─ messaging.controller.ts
│  │  └─ dashboard.controller.ts
│  ├─ routes/
│  │  ├─ auth.route.ts
│  │  ├─ user.route.ts
│  │  ├─ profile.route.ts
│  │  ├─ company.route.ts
│  │  ├─ job.route.ts
│  │  ├─ application.route.ts
│  │  ├─ saved-job.route.ts
│  │  ├─ message.route.ts
│  │  └─ dashboard.routes.ts
│  ├─ middleware/
│  │  ├─ auth.middleware.ts
│  │  ├─ role.middleware.ts
│  │  ├─ error.middleware.ts
│  │  └─ errorHandler.ts
│  ├─ services/
│  │  ├─ auth.service.ts
│  │  ├─ uploadCloud.service.ts
│  │  └─ messaging.service.ts
│  ├─ utils/
│  │  ├─ index.ts
│  │  └─ mediaUploadMulter.ts
│  ├─ lib/
│  │  └─ client.js  # Prisma client instance
│  └─ types/
│     ├─ users.d.ts
│     ├─ job.d.ts
│     ├─ company.d.ts
│     ├─ messaging.d.ts
│     ├─ applicaton.d.ts
│     └─ error.d.ts
```


## API Overview (current endpoints)

Base path: /api

- /api/auth
  - POST /signup, /signin, /refresh-token, /logout
  - GET /verify-email/:token
  - POST /resend-verification, /forgot-password, /reset-password
  - GET /google, /google/callback
- /api/users
  - GET / — list users
  - GET /me — current user
  - GET /:id — user by ID
- /api/profiles
  - GET/POST/PUT/DELETE /me
  - POST /upload-resume, /upload-profile-image
- /api/companies
  - GET / — list companies
  - GET /my-company — current employer company (auth)
  - GET /:id — company by ID
  - POST / (employer)
  - PUT /:id (employer)
  - DELETE /:id (employer)
- /api/jobs
  - GET / — list jobs
  - GET /suggestions — search suggestions
  - GET /company/:companyId — jobs by company
  - GET /:id — job by ID
  - GET /:id/applications — applications for job (employer)
  - POST /, PUT /:id, DELETE /:id (employer)
- /api/applications
  - GET /users/:userId — applications by user
  - GET /:id — application by ID
  - POST /jobs/:jobId — create application
  - PUT /:id — update application
  - DELETE /:id — delete application
- /api/saved-jobs (jobseeker only)
  - GET / — list saved jobs
  - GET /check/:jobId — check single
  - POST /check-batch — check multiple
  - POST / — save job
  - DELETE /:savedJobId — remove saved
- /api/dashboard
  - GET /jobseeker, DELETE /jobseeker/applications/:id
  - GET /employer, PUT /employer/applications/:id, GET /employer/profile-completion
- /api/conversations
  - GET / — list conversations
  - GET /:id — conversation by ID
  - GET /:id/messages — messages in conversation

Socket.IO events (names):
- connection (auth via JWT optional)
- join, chat:send, chat:markRead
- typing:start, typing:stop
- presence:update, notification (server-emitted)


## Database

Prisma models include: User, Profile, Company, Job, JobApplication, SavedJob, JobView, RefreshToken, BlacklistedToken, Conversation, ConversationParticipant, Message, Notification. Provider: postgresql.


## Getting Started

1) Install dependencies
```bash path=null start=null
npm install
```

2) Configure environment
```bash path=null start=null
cp .env.example .env
# fill in all required variables
```

3) Setup database and Prisma
```bash path=null start=null
npm run db:generate
npm run db:migrate
```

4) Run development server
```bash path=null start=null
npm run dev
# Server listens on PORT (default 3000)
```

5) Build and run production
```bash path=null start=null
npm run build
npm start
```


## Linting and Formatting

```bash path=null start=null
npm run lint
npm run lint:fix
npm run format
```


## Notes

- tsconfig.json compiles TypeScript from src to dist, with path alias @/* -> src/*.
- CORS is restricted by FRONTEND_URL; set accordingly in .env.
- Rate limiter is enabled globally; tune limits/windows as needed.
- Prisma client logs queries in development mode.


## License

ISC
