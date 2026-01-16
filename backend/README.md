# HackForge Backend API

Backend API server for HackForge mobile app using Node.js, Express, and MySQL.

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hackforge_db
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
```

### 3. Initialize Database

Run the database schema initialization script:

```bash
npm run init-db
```

Or manually import the schema:

```bash
mysql -u root -p < database/schema.sql
```

### 4. Start the Server

For development with auto-reload:

```bash
npm run dev
```

For production:

```bash
npm start
```

The server will run on `http://localhost:5000` (or the PORT specified in .env)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires auth)
- `PUT /api/auth/profile` - Update user profile (requires auth)

### Companies
- `GET /api/companies` - Get all companies (with filters: verified, featured, search)
- `GET /api/companies/:id` - Get company by ID

### Jobs
- `GET /api/jobs` - Get all jobs (with filters: status, company_id, type, location, search)
- `GET /api/jobs/:id` - Get job by ID

### Applications
- `GET /api/applications` - Get user applications (requires auth)
- `GET /api/applications/:id` - Get application by ID (requires auth)
- `POST /api/applications` - Create new application (requires auth)
- `PUT /api/applications/:id` - Update application (requires auth)

### Resumes
- `GET /api/resumes` - Get user resumes (requires auth)
- `GET /api/resumes/:id` - Get resume by ID (requires auth)
- `POST /api/resumes` - Upload resume (requires auth)
- `PUT /api/resumes/:id/active` - Set resume as active (requires auth)
- `DELETE /api/resumes/:id` - Delete resume (requires auth)

### Saved Jobs
- `GET /api/saved-jobs` - Get saved jobs (requires auth)
- `POST /api/saved-jobs` - Save a job (requires auth)
- `DELETE /api/saved-jobs/:job_id` - Remove saved job (requires auth)
- `GET /api/saved-jobs/check/:job_id` - Check if job is saved (requires auth)

### Interviews
- `GET /api/interviews` - Get user interviews (requires auth)
- `GET /api/interviews/:id` - Get interview by ID (requires auth)

### Notifications
- `GET /api/notifications` - Get user notifications (requires auth)
- `GET /api/notifications/unread-count` - Get unread count (requires auth)
- `PUT /api/notifications/:id/read` - Mark notification as read (requires auth)
- `PUT /api/notifications/read-all` - Mark all as read (requires auth)
- `DELETE /api/notifications/:id` - Delete notification (requires auth)

## Database Schema

The database includes the following tables:
- `companies` - Company information
- `users` - User accounts
- `jobs` - Job postings
- `applications` - Job applications
- `resumes` - User resumes
- `saved_jobs` - Saved jobs by users
- `interviews` - Interview scheduling
- `notifications` - User notifications

See `database/schema.sql` for complete schema definition.

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

Tokens are obtained from the `/api/auth/login` or `/api/auth/register` endpoints.

## Project Structure

```
backend/
├── config/
│   └── database.js       # Database connection configuration
├── controllers/
│   └── authController.js # Authentication controller
├── database/
│   └── schema.sql        # Database schema SQL file
├── middleware/
│   └── auth.js           # Authentication middleware
├── models/
│   ├── Application.js    # Application model
│   ├── Company.js        # Company model
│   ├── Interview.js      # Interview model
│   ├── Job.js            # Job model
│   ├── Notification.js   # Notification model
│   ├── Resume.js         # Resume model
│   ├── SavedJob.js       # SavedJob model
│   └── User.js           # User model
├── routes/
│   ├── applications.js   # Application routes
│   ├── auth.js           # Authentication routes
│   ├── companies.js      # Company routes
│   ├── interviews.js     # Interview routes
│   ├── jobs.js           # Job routes
│   ├── notifications.js  # Notification routes
│   ├── resumes.js        # Resume routes
│   └── savedJobs.js      # SavedJob routes
├── scripts/
│   └── init-database.js  # Database initialization script
├── .env                  # Environment variables (create this)
├── .gitignore
├── package.json
├── server.js             # Express server entry point
└── README.md

```


