import Stripe from "stripe";
import Event from "../models/event.model.js";
import Booking from "../models/booking.model.js";
import mongoose from "mongoose";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { quantity } = req.body;

        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            return res.status(400).json({ message: "Invalid event ID format" });
        }

        if (!quantity || quantity < 1) {
            return res.status(400).json({ message: "Quantity must be at least 1" });
        }

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        if (event.price === 0) {
            return res.status(400).json({ message: "This is a free event, no payment required" });
        }

        if (new Date(event.date) < new Date()) {
            return res.status(400).json({ message: "Cannot book past events" });
        }

        // Check if enough spots available
        if (event.maxParticipants && (event.bookedCount + quantity) > event.maxParticipants) {
            return res.status(400).json({ 
                message: `Not enough spots available. Only ${event.maxParticipants - event.bookedCount} spots left` 
            });
        }

        // Check for duplicate booking
        const existingBooking = await Booking.findOne({
            eventId: eventId,
            userId: req.user._id
        });
        if (existingBooking) {
            return res.status(400).json({ message: "You have already booked this event" });
        }

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'lkr',
                        product_data: {
                            name: event.title,
                            description: `${event.description?.substring(0, 100)}...`,
                            images: event.imageUrl ? [event.imageUrl] : [],
                        },
                        unit_amount: Math.round(event.price * 100), // Convert to cents
                    },
                    quantity: quantity,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/events/${eventId}`,
            metadata: {
                eventId: eventId,
                userId: req.user._id.toString(),
                quantity: quantity.toString(),
            },
        });

        res.status(200).json({ 
            sessionId: session.id,
            url: session.url 
        });
    } catch (error) {
        console.error("Error creating checkout session:", error);
        res.status(500).json({ message: "Error creating payment session" });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({ message: "Session ID is required" });
        }

        // Retrieve the session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status !== 'paid') {
            return res.status(400).json({ message: "Payment not completed" });
        }

        // Extract metadata
        const { eventId, userId, quantity } = session.metadata;

        // Check if booking already exists for this session (by payment ID)
        const existingBookingByPayment = await Booking.findOne({ paymentId: sessionId });
        if (existingBookingByPayment) {
            await existingBookingByPayment.populate('eventId', 'title date location price imageUrl');
            await existingBookingByPayment.populate('userId', 'name email');
            return res.status(200).json({
                message: "Booking already processed",
                booking: existingBookingByPayment,
                alreadyProcessed: true
            });
        }

        // Check if booking already exists for this user and event
        const existingBookingByUser = await Booking.findOne({
            eventId: eventId,
            userId: userId
        });
        if (existingBookingByUser) {
            await existingBookingByUser.populate('eventId', 'title date location price imageUrl');
            await existingBookingByUser.populate('userId', 'name email');
            return res.status(200).json({
                message: "Booking already exists for this event",
                booking: existingBookingByUser,
                alreadyProcessed: true
            });
        }

        // Get event details
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Calculate total price
        const totalPrice = parseInt(quantity) * event.price;

        // Create booking with transaction
        const mongoSession = await mongoose.startSession();
        
        try {
            let newBooking;
            
            await mongoSession.withTransaction(async () => {
                // Double-check for existing booking within transaction
                const duplicateCheck = await Booking.findOne({
                    eventId,
                    userId
                }).session(mongoSession);

                if (duplicateCheck) {
                    throw new Error("DUPLICATE_BOOKING");
                }

                newBooking = new Booking({
                    eventId,
                    userId,
                    quantity: parseInt(quantity),
                    totalPrice,
                    isPaid: true,
                    paymentStatus: "success",
                    paymentId: sessionId
                });
                await newBooking.save({ session: mongoSession });

                // Update event's bookedCount
                await Event.findByIdAndUpdate(
                    eventId,
                    { $inc: { bookedCount: parseInt(quantity) } },
                    { session: mongoSession }
                );
            });

            // Populate the booking
            await newBooking.populate('eventId', 'title date location price imageUrl');
            await newBooking.populate('userId', 'name email');

            res.status(201).json({
                message: "Payment verified and booking created successfully",
                booking: newBooking
            });
        } catch (transactionError) {
            if (transactionError.message === "DUPLICATE_BOOKING") {
                // If duplicate booking detected in transaction, fetch and return existing
                const existingBooking = await Booking.findOne({ eventId, userId })
                    .populate('eventId', 'title date location price imageUrl')
                    .populate('userId', 'name email');
                
                return res.status(200).json({
                    message: "Booking already exists",
                    booking: existingBooking,
                    alreadyProcessed: true
                });
            }
            throw transactionError;
        } finally {
            await mongoSession.endSession();
        }

    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ message: "Error verifying payment" });
    }
};

export const handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            console.log('Payment successful:', session.id);
            // The booking will be created when verifyPayment is called
            break;
        
        case 'checkout.session.expired':
            console.log('Checkout session expired:', event.data.object.id);
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
};
