# GatsisHub

A web-based manufacturing management system for custom hanger production. Built to handle the complete workflow from customer orders through production to delivery.

## Overview

GatsisHub manages the end-to-end process of custom hanger manufacturing, including 3D design customization, order processing, payment verification, production tracking, and quality control.

## Features

### For Customers
- 3D hanger design tool with real-time preview
- Save and reuse custom designs
- Order placement with quantity and delivery options
- Payment submission with proof of payment
- Real-time order status tracking
- Order history and feedback system

### For Sales Administrators
- Order evaluation and quotation
- Payment verification
- Customer communication via messaging system
- Order history management

### For Operational Managers
- Production workflow oversight
- Quality control verification
- Production submission reviews
- Team and employee management
- Comprehensive notification system

### For Production Employees
- Work assignment viewing
- Production progress submission
- Unit completion tracking

### For System Administrators
- User account management
- System-wide configuration
- Department and team administration

## Tech Stack

**Frontend:**
- React 18 with Vite
- Three.js for 3D rendering
- Tailwind CSS
- React Router for navigation

**Backend:**
- Node.js with Express 5
- Supabase (PostgreSQL)
- Real-time subscriptions via WebSocket

**Deployment:**
- Vercel for both frontend and backend

## Project Structure

```
GatsisHub/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── CustomerPages/
│   │   │   ├── SalesAdminPages/
│   │   │   ├── OperationalManagerPages/
│   │   │   ├── ProductionPages/
│   │   │   └── SystemAdminPages/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   └── layouts/
│   └── public/
│       ├── models/
│       └── fonts/
├── backend/
│   ├── routes/
│   │   ├── auth.js
│   │   ├── orders.js
│   │   ├── payments.js
│   │   ├── submissions.js
│   │   └── ...
│   ├── utils/
│   └── server.js
└── database/
    └── *.sql migration files
```

## Getting Started

### Prerequisites
- Node.js 16+
- Supabase account
- Vercel account (for deployment)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/GatsisHub.git
cd GatsisHub
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

4. Set up environment variables

Create `.env` in the backend directory:
```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
EMAIL_SERVICE=your_email_service
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

Create `.env` in the frontend directory:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_BACKEND_URL=http://localhost:3000
```

5. Run database migrations

Execute the SQL files in order to set up your database schema. Key tables include: customers, employees, orders, payments, designs, products, feedbacks, notifications, and more.

6. Start the development servers

Backend:
```bash
cd backend
node server.js
```

Frontend:
```bash
cd frontend
npm run dev
```

## Database Schema

Main tables:
- `customers` - Customer accounts and authentication
- `employees` - Employee accounts with role and department
- `orders` - Order records with status tracking
- `payments` - Payment submissions and verification
- `designs` - Saved 3D hanger designs
- `products` - Product catalog (hanger types)
- `materials` - Material options and pricing
- `production_submissions` - Production progress entries
- `feedbacks` - Customer feedback and ratings
- `notifications` - Customer notifications
- `admin_notifications` - Employee notifications
- `messages` - Customer-sales admin messaging
- `teams` - Employee team organization

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - Customer registration
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset confirmation

### Orders
- `GET /api/orders` - Get orders (filtered by role)
- `GET /api/orders/:id` - Get specific order
- `POST /api/orders` - Create new order
- `PATCH /api/orders/:id` - Update order
- `PATCH /api/orders/:id/status` - Update order status

### Payments
- `GET /api/payments` - Get payments
- `POST /api/payments` - Submit payment
- `PATCH /api/payments/:id/verify` - Verify payment
- `DELETE /api/payments/:id` - Reject payment

### Production
- `GET /api/submissions` - Get production submissions
- `POST /api/submissions` - Submit production progress
- `PATCH /api/submissions/:id/verify` - Verify submission

(Additional endpoints for designs, notifications, feedbacks, teams, and more)

## Deployment

The application is configured for deployment on Vercel. Each directory contains a `vercel.json` configuration file.

To deploy:
```bash
vercel --prod
```

Make sure to configure environment variables in your Vercel dashboard.

## Security

- Row Level Security (RLS) enabled on all Supabase tables
- Role-based access control
- Email verification for new accounts
- Password reset with verification codes
- Secure file upload to Supabase Storage

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is for educational/commercial use as part of a capstone project.
