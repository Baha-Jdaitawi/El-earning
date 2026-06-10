# Learning Management System

A full-stack LMS with role-based access for students, instructors, and admins.

## Tech Stack

**Frontend:** React, Redux Toolkit, Tailwind CSS, Vite  
**Backend:** Node.js, Express, PostgreSQL

## Features

- JWT authentication with httpOnly cookies and Google OAuth
- Course builder with modules, lessons, quizzes and assignments
- Auto-graded quizzes and manual assignment grading with feedback
- Course ratings and reviews
- Progress tracking
- Admin dashboard for user and category management

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL

### Backend Setup
```bash
cd Backend
npm install
 npm run dev
```

### Frontend Setup
```bash
cd Frontend
npm install
npm run dev
```

### Database Setup
```bash
psql -U postgres -d lms_db -f migrations/001_users.sql
psql -U postgres -d lms_db -f migrations/002_categories.sql
psql -U postgres -d lms_db -f migrations/003_courses.sql
psql -U postgres -d lms_db -f migrations/004_modules.sql
psql -U postgres -d lms_db -f migrations/005_lessons.sql
psql -U postgres -d lms_db -f migrations/006_enrollments.sql
psql -U postgres -d lms_db -f migrations/007_progress.sql
psql -U postgres -d lms_db -f migrations/008_quizzes.sql
psql -U postgres -d lms_db -f migrations/009_assignments.sql
psql -U postgres -d lms_db -f migrations/010_submissions.sql
psql -U postgres -d lms_db -f migrations/011_seed.sql
psql -U postgres -d lms_db -f migrations/012_reviews.sql
```



## Roles

- **Student** — browse and enroll in courses, take quizzes, submit assignments, leave reviews
- **Instructor** — create and manage courses, grade submissions
- **Admin** — manage users and categories