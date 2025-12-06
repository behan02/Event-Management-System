# Event Management System

A full-stack event management platform built with React, Node.js, Express, and MongoDB. Create, manage, and book events with integrated Stripe payment processing.

## Features

- 🎫 **Event Creation & Management** - Create and manage events with images, categories, and capacity
- 🔐 **User Authentication** - Secure JWT-based authentication with role-based access
- 💳 **Payment Integration** - Stripe payment gateway for paid events
- 📅 **Event Booking** - Book free or paid events with capacity tracking
- 🎨 **Modern UI** - Beautiful glassmorphism design with gradient themes
- 📱 **Responsive Design** - Works seamlessly on all devices
- 🔍 **Smart Filtering** - Filter events by location, category, date, and price

## Tech Stack

**Frontend:**
- React 18
- React Router
- Tailwind CSS
- Axios
- React Hot Toast

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Stripe Payment API

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Stripe account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/behan02/Event-Management-System.git
   cd Event-Management-System
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```
   
   Create `.env` file:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   CLIENT_URL=http://localhost:5173
   STRIPE_SECRET_KEY=your_stripe_secret_key
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```
   
   Create `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   ```

4. **Run the Application**
   
   Backend:
   ```bash
   cd backend
   npm run dev
   ```
   
   Frontend:
   ```bash
   cd frontend
   npm run dev
   ```

   Access the app at `http://localhost:5173`

## Payment Testing

Use Stripe test cards:
- **Success:** 4242 4242 4242 4242
- **Decline:** 4000 0000 0000 0002

Use any future date, any 3-digit CVC, and any billing details.

## Project Structure

```
Event-Management-System/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # Database schemas
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth & validation
│   │   └── lib/           # Utilities
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API calls
│   │   └── store/         # State management
│   └── package.json
└── README.md
```

## Key Features Explained

### Event Management
- Create events with title, description, location, date, category, and price
- Upload event images
- Set maximum participant capacity
- Track bookings in real-time

### Payment Processing
- **Free Events:** Direct booking without payment
- **Paid Events:** Secure Stripe checkout integration
- Automatic booking creation after successful payment
- Payment status tracking (Paid/Pending/Failed)

### Filtering & Search
- Filter by location (Colombo, Kandy, Galle, etc.)
- Filter by category (Sports, Education, Concert, etc.)
- Filter by date
- Filter by price range