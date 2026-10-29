# 🏠 Bachelorent – Smart Rental & Job Platform

> A full-stack web platform for bachelors and university students in Bangladesh to find verified rentals and part-time jobs.

---

## 📦 Tech Stack

| Layer      | Technology                            |
|------------|---------------------------------------|
| Frontend   | React.js 18, React Router v6, Axios   |
| Backend    | Node.js, Express.js                   |
| Database   | MySQL 8.0+                            |
| Auth       | JWT (JSON Web Tokens) + bcryptjs      |
| Uploads    | Multer (local file storage)           |
| Styling    | Custom CSS Design System              |

---

## 📁 Project Structure

```
bachelorent/
├── database/
│   └── schema.sql              # Full MySQL schema
├── backend/
│   ├── config/db.js            # MySQL connection pool
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── propertyController.js
│   │   ├── jobController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js             # JWT protect + role authorize
│   │   └── upload.js           # Multer file handler
│   ├── routes/
│   │   ├── auth.js
│   │   ├── properties.js
│   │   ├── jobs.js
│   │   └── admin.js
│   ├── server.js               # Express entry point
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── public/index.html
    └── src/
        ├── components/
        │   └── common/
        │       ├── Navbar.js
        │       ├── Footer.js
        │       ├── PropertyCard.js
        │       ├── JobCard.js
        │       └── ProtectedRoute.js
        ├── context/AuthContext.js
        ├── pages/
        │   ├── Home.js
        │   ├── Properties.js
        │   ├── PropertyDetail.js
        │   ├── Jobs.js
        │   ├── JobDetail.js
        │   ├── Profile.js
        │   ├── auth/
        │   │   ├── Login.js
        │   │   └── Register.js
        │   ├── tenant/TenantDashboard.js
        │   ├── provider/ProviderDashboard.js
        │   ├── employer/EmployerDashboard.js
        │   └── admin/AdminDashboard.js
        ├── styles/global.css
        ├── utils/api.js
        ├── App.js
        └── index.js
```

---

## 🚀 Setup Instructions

### Step 1 — MySQL Database

```sql
-- In MySQL Workbench or CLI:
mysql -u root -p
source /path/to/bachelorent/database/schema.sql
```

### Step 2 — Backend Setup

```bash
cd bachelorent/backend

# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env with your MySQL credentials and JWT secret

# Start the backend
npm run dev      # development (nodemon)
npm start        # production
```

Your API will run at: `http://localhost:5000`

### Step 3 — Frontend Setup

```bash
cd bachelorent/frontend

# Install dependencies
npm install

# Start the React app
npm start
```

Your app will run at: `http://localhost:3000`

---

## ⚙️ Environment Variables (backend/.env)

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=bachelorent
JWT_SECRET=your_super_secret_key_min_32_chars
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

---

## 👤 User Roles

| Role       | Capabilities                                               |
|------------|------------------------------------------------------------|
| `tenant`   | Search properties, apply for jobs, save listings           |
| `provider` | Post/manage rental listings, receive inquiries             |
| `employer` | Post/manage jobs, review and update applicant status       |
| `admin`    | Approve/reject all listings, verify users, delete content  |

---

## 🔌 API Endpoints

### Auth
```
POST   /api/auth/register          Register new user
POST   /api/auth/login             Login
GET    /api/auth/me                Get current user
PUT    /api/auth/profile           Update profile (multipart)
PUT    /api/auth/change-password   Change password
```

### Properties
```
GET    /api/properties             List all approved (filterable)
GET    /api/properties/:id         Property details
GET    /api/properties/my          Provider's own listings
GET    /api/properties/saved       Tenant saved properties
POST   /api/properties             Create property (multipart, provider)
PUT    /api/properties/:id         Update property (provider)
DELETE /api/properties/:id         Delete property (provider/admin)
POST   /api/properties/:id/inquire Send inquiry (tenant)
POST   /api/properties/:id/save    Save property (tenant)
```

### Jobs
```
GET    /api/jobs                   List all approved jobs
GET    /api/jobs/:id               Job details
GET    /api/jobs/my                Employer's posted jobs
GET    /api/jobs/applications      Tenant's applications
POST   /api/jobs                   Create job (employer)
POST   /api/jobs/:id/apply         Apply for job (tenant, multipart)
GET    /api/jobs/:id/applications  View applicants (employer)
PUT    /api/jobs/:id/applications/:appId/status  Update applicant status
```

### Admin (all require admin role)
```
GET    /api/admin/dashboard              Stats overview
GET    /api/admin/users                  All users (filterable)
PUT    /api/admin/users/:id/verify       Verify/unverify user
PUT    /api/admin/users/:id/toggle       Activate/deactivate user
GET    /api/admin/listings/pending       Pending approvals
PUT    /api/admin/properties/:id/status  Approve/reject property
PUT    /api/admin/jobs/:id/status        Approve/reject job
DELETE /api/admin/content/:type/:id      Delete content
GET    /api/admin/inquiries              All inquiries
```

---

## 🔐 Default Admin Login

After running the schema, update the admin password:

```sql
-- Generate a bcrypt hash of 'admin123' and update:
UPDATE users SET password = '$2b$10$YOURHASHHERE' WHERE email = 'admin@bachelorent.com';
```

Or register normally then update the role:
```sql
UPDATE users SET role = 'admin', is_verified = 1 WHERE email = 'youremail@example.com';
```

---

## 📱 Pages & Features

| Page                   | URL                     | Access       |
|------------------------|-------------------------|--------------|
| Homepage               | `/`                     | Public       |
| Properties List        | `/properties`           | Public       |
| Property Detail        | `/properties/:id`       | Public       |
| Jobs List              | `/jobs`                 | Public       |
| Job Detail             | `/jobs/:id`             | Public       |
| Login                  | `/login`                | Public       |
| Register               | `/register`             | Public       |
| Tenant Dashboard       | `/dashboard/tenant`     | Tenant only  |
| Provider Dashboard     | `/dashboard/provider`   | Provider only|
| Employer Dashboard     | `/dashboard/employer`   | Employer only|
| Admin Panel            | `/admin`                | Admin only   |
| Profile                | `/profile`              | Authenticated|

---

## 🎨 Design System

- **Primary color**: Terracotta `#C8552A`
- **Secondary**: Deep Navy `#1E2D3D`
- **Fonts**: Playfair Display (headings) + DM Sans (body)
- **Taka symbol**: ৳ for Bangladeshi currency display

---

## 🔒 Security Features

- Passwords hashed with bcryptjs (10 rounds)
- JWT authentication with expiry
- Role-based access control on all protected routes
- Admin-only endpoints for content moderation
- File upload validation (type + size limits)
- Inactive account blocking

---

## 📌 Notes

- Uploaded files are served from `http://localhost:5000/uploads/`
- For production, consider using cloud storage (AWS S3, Cloudinary)
- Add HTTPS, rate limiting, and helmet.js for production security
- Admin must approve all listings before they appear publicly
