import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { verifyPayment } from "../services/paymentService";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying");
  const [booking, setBooking] = useState(null);
  const verificationAttempted = useRef(false);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      toast.error("Invalid payment session");
      navigate("/events");
      return;
    }

    // Prevent duplicate verification attempts
    if (verificationAttempted.current) {
      return;
    }
    verificationAttempted.current = true;

    const verify = async () => {
      try {
        const response = await verifyPayment(sessionId);
        setBooking(response.booking);
        setStatus("success");
        
        if (response.alreadyProcessed) {
          toast.success("Booking already processed");
        } else {
          toast.success("Payment successful! Booking confirmed.");
        }
      } catch (error) {
        console.error("Payment verification failed:", error);
        setStatus("failed");
        toast.error(error.response?.data?.message || "Payment verification failed");
      }
    };

    verify();
  }, [searchParams, navigate]);

  if (status === "verifying") {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-blue-50 to-white"></div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute -bottom-20 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>
        
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h2 className="text-2xl font-bold text-slate-900">Verifying Payment...</h2>
          <p className="text-slate-600">Please wait while we confirm your booking.</p>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-100 via-blue-50 to-white"></div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute -bottom-20 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>
        
        <div className="max-w-md w-full bg-white rounded-3xl shadow-lg p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Verification Failed</h2>
            <p className="text-slate-600">
              We couldn't verify your payment. If you were charged, please contact support.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate("/events")}
              className="w-full px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
            >
              Back to Events
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="w-full px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
            >
              View My Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-100 via-blue-50 to-white"></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-20 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>
      
      <div className="max-w-md w-full bg-white rounded-3xl shadow-lg p-8 text-center space-y-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h2>
          <p className="text-slate-600">
            Your booking has been confirmed. We've sent you an email with the details.
          </p>
        </div>
        {booking && (
          <div className="bg-slate-50 rounded-xl p-4 text-left space-y-2">
            <h3 className="font-semibold text-slate-900 mb-3">Booking Details</h3>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-600">Event:</span>
                <span className="font-semibold text-slate-900">{booking.eventId?.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Quantity:</span>
                <span className="font-semibold text-slate-900">{booking.quantity} ticket{booking.quantity > 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Total Paid:</span>
                <span className="font-semibold text-slate-900">Rs. {booking.totalPrice?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Status:</span>
                <span className="font-semibold text-green-600">Confirmed</span>
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate("/profile")}
            className="w-full px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
          >
            View My Bookings
          </button>
          <button
            onClick={() => navigate("/events")}
            className="w-full px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
          >
            Browse More Events
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
