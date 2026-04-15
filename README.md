# EGP-USDT Cryptocurrency Exchange

A peer-to-admin cryptocurrency exchange platform for EGP to USDT conversion.

## Features

### User Features
- Register / Login with JWT authentication
- Create exchange orders (EGP to USDT and USDT to EGP)
- Upload payment proof (image)
- View order status (pending / approved / rejected)
- Set USDT wallet address for withdrawals

### Admin Features
- Admin dashboard with overview
- View all orders
- Approve / reject orders
- Set exchange rate
- Manage users
- View transaction history

## Tech Stack

### Backend
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT authentication
- Multer for file uploads

### Frontend
- Next.js 14 (App Router)
- React
- Tailwind CSS

## Project Structure

```
/newProject
├── /backend
│   ├── /src
│   │   ├── /config          # Database, JWT, upload config
│   │   ├── /controllers     # Route handlers
│   │   ├── /middleware      # Auth, validation, admin, logging
│   │   ├── /models          # Mongoose schemas
│   │   ├── /routes          # API routes
│   │   └── server.js        # Entry point
│   ├── /uploads             # Uploaded files
│   ├── .env                 # Environment variables
│   └── package.json
├── /frontend
│   ├── /app                 # Next.js app router pages
│   ├── /components          # React components
│   ├── /context             # Auth context
│   ├── /lib                 # API client
│   ├── jsconfig.json
│   ├── next.config.js
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB instance (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (or modify the existing one):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/egp_usdt_exchange
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

4. Start the server:
```bash
npm run dev
```

The backend will run on http://localhost:5000

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on http://localhost:3000

### Creating an Admin User

To create an admin user, you'll need to:
1. Register through the frontend at http://localhost:3000/auth/register
2. Manually update the user's role in MongoDB:
```javascript
db.users.updateOne({ email: "your-email@example.com" }, { $set: { role: "admin" } })
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Users (Admin only for list/delete)
- `GET /api/users` - List all users
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/wallet` - Update wallet address

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders/:id/proof` - Upload payment proof
- `GET /api/orders/admin/all` - List all orders (admin)
- `PUT /api/orders/:id/approve` - Approve order (admin)
- `PUT /api/orders/:id/reject` - Reject order (admin)

### Exchange Rate
- `GET /api/rate` - Get current rate
- `PUT /api/rate` - Update rate (admin)

### Transactions
- `GET /api/transactions` - Get transaction history (admin)

## Security Features

- Password hashing with bcrypt
- JWT access tokens (15 min expiry)
- JWT refresh tokens (7 day expiry, HTTP-only cookies)
- Input validation with express-validator
- Rate limiting on API endpoints
- File type and size validation for uploads
- Admin role protection
- Transaction logging

## License

MIT
