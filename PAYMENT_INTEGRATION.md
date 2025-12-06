# Stripe Payment Integration Guide

## Overview
The Event Management System now supports secure payment processing through Stripe for non-free events. Users can book one or multiple tickets and complete payment via Stripe Checkout.

## Features Implemented

### Backend (Node.js/Express)

1. **Payment Controller** (`src/controllers/payment.controller.js`)
   - `createCheckoutSession`: Creates a Stripe checkout session for paid events
   - `verifyPayment`: Verifies payment completion and creates booking
   - `handleWebhook`: Processes Stripe webhook events (optional)

2. **Payment Routes** (`src/routes/payment.route.js`)
   - `POST /api/payment/create-checkout-session/:eventId` - Create checkout session
   - `POST /api/payment/verify-payment` - Verify payment after completion
   - `POST /api/payment/webhook` - Stripe webhook endpoint

3. **Environment Variables** (`.env`)
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   CLIENT_URL=http://localhost:5173
   STRIPE_WEBHOOK_SECRET=whsec_... (optional, for webhooks)
   ```

### Frontend (React)

1. **Payment Service** (`src/services/paymentService.js`)
   - `createCheckoutSession`: API call to create Stripe session
   - `verifyPayment`: API call to verify payment completion

2. **PaymentSuccess Page** (`src/pages/PaymentSuccess.jsx`)
   - Verifies payment after redirect from Stripe
   - Displays booking confirmation
   - Shows booking details and payment status

3. **Updated EventDetails Page**
   - Redirects to Stripe Checkout for paid events
   - Books directly for free events
   - Shows "Proceed to payment" button for paid events

4. **Updated Profile Page**
   - Displays payment status for each booking
   - Shows "✓ Paid", "⏱ Pending", or "✗ Failed" status

## Payment Flow

### For Free Events
1. User selects quantity and clicks "Book for free"
2. Booking is created immediately with `isPaid: true` and `paymentStatus: "success"`
3. Success message shown, event booked count updated

### For Paid Events
1. User selects quantity and clicks "Proceed to payment"
2. Backend creates Stripe checkout session with event details
3. User is redirected to Stripe-hosted checkout page
4. User enters payment details and completes payment
5. Stripe redirects to `/payment/success?session_id=...`
6. Frontend verifies payment and creates booking
7. Booking confirmation shown with details

## Testing

### Test Cards (Stripe Test Mode)
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **3D Secure**: 4000 0025 0000 3155

Use any future expiry date, any 3-digit CVC, and any billing details.

## Security Features

1. **Protected Routes**: All payment endpoints require authentication
2. **Duplicate Prevention**: Users cannot book the same event twice
3. **Capacity Validation**: Checks available seats before payment
4. **Transaction Safety**: Uses MongoDB transactions for booking creation
5. **Payment Verification**: Backend verifies payment with Stripe before creating booking

## Error Handling

- Invalid event ID
- Event not found
- Event already fully booked
- Duplicate booking attempt
- Payment verification failure
- Network errors

All errors are handled gracefully with user-friendly messages.

## Future Enhancements

1. **Refunds**: Implement refund functionality for cancellations
2. **Webhooks**: Full webhook integration for automated payment tracking
3. **Email Notifications**: Send booking confirmation emails
4. **PDF Tickets**: Generate downloadable tickets
5. **Payment History**: Detailed payment transaction history
6. **Multiple Payment Methods**: Add support for wallets, bank transfers, etc.

## Setup Instructions

### Backend Setup
1. Install Stripe package: `npm install stripe`
2. Add Stripe keys to `.env` file
3. Restart backend server

### Frontend Setup
1. Install Stripe JS: `npm install @stripe/stripe-js`
2. Add publishable key to `.env`: `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...`
3. Restart frontend dev server

### Stripe Dashboard
1. Sign up at [stripe.com](https://stripe.com)
2. Get test API keys from Dashboard
3. (Optional) Configure webhooks for production

## Currency
Currently configured for LKR (Sri Lankan Rupees). Can be changed in `payment.controller.js`:
```javascript
currency: 'lkr', // Change to 'usd', 'eur', etc.
```

## Support
For issues or questions:
- Check Stripe documentation: https://stripe.com/docs
- Review error logs in browser console and server terminal
- Verify environment variables are correctly set
