import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import sampleEventImg from "../assets/event.jpg";
import { fetchEventById } from "../services/eventService";
import { bookEvent } from "../services/bookingService";
import { createCheckoutSession } from "../services/paymentService";
import { AuthContext } from "../store/useAuthStore";

const formatDateTime = (value) => {
  const date = new Date(value);
  return date.toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [bookingState, setBookingState] = useState({ status: null, message: null });
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadEvent = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchEventById(eventId);
        if (isMounted) {
          setEvent(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || "Unable to load event");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    loadEvent();
    return () => {
      isMounted = false;
    };
  }, [eventId]);

  const availableSeats = useMemo(() => {
    if (!event) return 0;
    return Math.max((event.maxParticipants || 0) - (event.bookedCount || 0), 0);
  }, [event]);

  const isEventCreator = useMemo(() => {
    if (!event || !user) return false;
    return event.createdBy === user._id;
  }, [event, user]);

  const bookingDisabled = !event || availableSeats === 0 || isEventCreator;

  const handleBooking = async (e) => {
    e.preventDefault();
    if (bookingDisabled) return;
    
    if (isEventCreator) {
      toast.error("You cannot book tickets for your own event.");
      return;
    }
    
    setBookingLoading(true);
    setBookingState({ status: null, message: null });
    
    try {
      // For paid events, redirect to Stripe checkout
      if (event.price > 0) {
        const { url } = await createCheckoutSession(event._id, quantity);
        // Redirect to Stripe checkout page
        window.location.href = url;
      } else {
        // For free events, book directly
        const reference = `FREE-${Date.now()}`;
        await bookEvent(event._id, { quantity, paymentId: reference });
        
        // Refresh event data to update booked count
        const updatedEvent = await fetchEventById(eventId);
        setEvent(updatedEvent);
        
        toast.success("Booking confirmed! Check your profile for details.");
        setQuantity(1); // Reset quantity
        setBookingLoading(false);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Unable to complete booking";
      setBookingState({
        status: "error",
        message: errorMsg,
      });
      toast.error(errorMsg);
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-100 via-blue-50 to-white"></div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute -bottom-20 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>
        
        <div className="relative text-slate-500">Loading event details…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-100 via-blue-50 to-white"></div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute -bottom-20 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>
        
        <div className="relative">
          <p className="text-xl text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/events")}
            className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold hover:bg-slate-50"
          >
            Back to events
          </button>
        </div>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-blue-50 to-white"></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-20 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Content */}
      <div className="relative mx-auto px-50 py-10 space-y-8">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="text-sm text-slate-900 font-semibold hover:underline"
      >
        ← Back
      </button>
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="grid md:grid-cols-2 gap-0">
          <img
            src={event.imageUrl || sampleEventImg}
            alt={event.title}
            className="w-full h-80 object-cover"
            loading="lazy"
          />
          <div className="p-6 border-t md:border-t-0 md:border-l border-gray-100 space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
              <span>{event.category}</span>
              <span className="text-indigo-600">{event.price === 0 ? "Free event" : `Rs. ${event.price.toLocaleString()}`}</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900">{event.title}</h1>
            <p className="text-slate-600 leading-relaxed">{event.description}</p>
            <dl className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-3">
                <span className="text-indigo-500">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1z" />
                    <path d="M6 7a1 1 0 000 2h8a1 1 0 100-2H6z" />
                  </svg>
                </span>
                <div>
                  <dt className="font-semibold text-slate-800">Date & time</dt>
                  <dd>{formatDateTime(event.date)}</dd>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-rose-500">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    />
                  </svg>
                </span>
                <div>
                  <dt className="font-semibold text-slate-800">Location</dt>
                  <dd>{event.location}</dd>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-emerald-500">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1z" />
                    <path d="M5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" />
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  </svg>
                </span>
                <div>
                  <dt className="font-semibold text-slate-800">Capacity</dt>
                  <dd>
                    {event.bookedCount || 0}/{event.maxParticipants} booked ({availableSeats} seats left)
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </div>
        <div className="p-6 border-t border-gray-100">
          <form className="space-y-4" onSubmit={handleBooking}>
            <div className="flex flex-wrap items-center gap-4">
              <label className="text-sm font-semibold text-slate-700">How many seats?</label>
              <input
                type="number"
                min="1"
                max={availableSeats || 1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
                className="w-24 rounded-xl border border-gray-200 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
              <div className="text-sm text-slate-500">
                {availableSeats} seat{availableSeats === 1 ? "" : "s"} remaining
              </div>
            </div>
            {event.price > 0 && (
              <p className="text-sm text-slate-600">
                Total price: <span className="font-semibold text-slate-900">Rs. {(event.price * quantity).toLocaleString()}</span>
              </p>
            )}
            {bookingState.status === "error" && bookingState.message && (
              <div className="rounded-xl px-4 py-2 text-sm bg-red-50 text-red-700">
                {bookingState.message}
              </div>
            )}
            {isEventCreator && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">You are the host of this event.</span> You cannot book tickets for your own event.
                </p>
              </div>
            )}
            <button
              type="submit"
              disabled={bookingLoading || bookingDisabled}
              className="w-full md:w-auto px-6 py-3 rounded-2xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60"
            >
              {isEventCreator ? "You are the host" : availableSeats === 0 ? "Event full" : bookingLoading ? "Processing..." : event.price === 0 ? "Book for free" : "Proceed to payment"}
            </button>
          </form>
        </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;

