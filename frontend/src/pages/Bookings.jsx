import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { fetchMyBookings, cancelBooking } from "../services/bookingService";

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

const Bookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const allBookings = await fetchMyBookings();
      const now = new Date();
      // Filter to show only future bookings
      const futureBookings = allBookings.filter((booking) => {
        if (!booking.eventId?.date) return false;
        return new Date(booking.eventId.date) > now;
      });
      // Sort by date (earliest first)
      futureBookings.sort((a, b) => {
        const dateA = new Date(a.eventId?.date || 0);
        const dateB = new Date(b.eventId?.date || 0);
        return dateA - dateB;
      });
      setBookings(futureBookings);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    const confirmation = window.confirm("Cancel this booking? This action cannot be undone.");
    if (!confirmation) return;
    try {
      await cancelBooking(bookingId);
      toast.success('Booking cancelled successfully');
      await loadBookings();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Unable to cancel booking";
      toast.error(errorMsg);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <section className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Upcoming Bookings</h1>
          <p className="text-slate-500 mt-2">View your upcoming event reservations</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl">{error}</div>
        )}

        {loading ? (
          <div className="text-center text-slate-500 py-12">Loading bookings…</div>
        ) : bookings.length === 0 ? (
          <div className="border border-dashed border-gray-300 rounded-2xl p-10 text-center text-slate-500">
            <p className="mb-4">No upcoming bookings found.</p>
            <button
              type="button"
              onClick={() => navigate("/events")}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
            >
              Browse Events
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookings.map((booking) => {
              const eventDate = new Date(booking.eventId?.date);
              const isUpcoming = eventDate > new Date();
              
              return (
                <article
                  key={booking._id}
                  className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 space-y-4 flex flex-col"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide mb-1">
                        Booking
                      </p>
                      <h3 className="text-xl font-semibold text-slate-900">
                        {booking.eventId?.title || "Event"}
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Tickets</p>
                      <p className="text-2xl font-bold text-slate-900">{booking.quantity}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        />
                      </svg>
                      <span>{booking.eventId?.location || "Location TBD"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1z" />
                        <path d="M6 7a1 1 0 000 2h8a1 1 0 100-2H6z" />
                      </svg>
                      <span>{formatDateTime(booking.eventId?.date)}</span>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase text-slate-500 mb-1">Total paid</p>
                        <p className="text-lg font-semibold text-slate-900">
                          Rs. {booking.totalPrice?.toLocaleString() || "0"}
                        </p>
                      </div>
                      {isUpcoming && (
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                            Upcoming
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCancel(booking._id)}
                            className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Bookings;

