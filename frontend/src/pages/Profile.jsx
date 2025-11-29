import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../store/useAuthStore";
import { cancelBooking, fetchMyBookings } from "../services/bookingService";

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  const loadBookings = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const data = await fetchMyBookings();
      setBookings(data);
    } catch (err) {
      setFeedback(err.response?.data?.message || "Unable to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    const confirmation = window.confirm("Cancel this booking?");
    if (!confirmation) return;
    try {
      await cancelBooking(bookingId);
      await loadBookings();
    } catch (err) {
      setFeedback(err.response?.data?.message || "Unable to cancel booking");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <section className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
        <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl font-semibold">
          {(user?.name || "E")[0]}
        </div>
        <div className="flex-1">
          <p className="text-sm uppercase font-semibold text-slate-500">Profile</p>
          <h1 className="text-3xl font-bold text-slate-900">{user?.name || "Eventix member"}</h1>
          <p className="text-slate-500">{user?.email}</p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">My bookings</h2>
          <button
            type="button"
            onClick={loadBookings}
            className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>
        {feedback && <div className="bg-red-50 text-red-700 px-4 py-2 rounded-xl">{feedback}</div>}
        {loading ? (
          <div className="text-center text-slate-500 py-12">Loading bookings…</div>
        ) : bookings.length === 0 ? (
          <div className="border border-dashed border-gray-300 rounded-2xl p-10 text-center text-slate-500">
            No bookings yet. Visit the events page to reserve seats.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookings.map((booking) => (
              <article
                key={booking._id}
                className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 space-y-3 flex flex-col"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">Booking</p>
                    <h3 className="text-xl font-semibold text-slate-900">{booking.eventId?.title || "Event"}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Tickets</p>
                    <p className="text-xl font-bold text-slate-900">{booking.quantity}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-500">
                  {booking.eventId?.location} •{" "}
                  {new Date(booking.eventId?.date).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-xs uppercase text-slate-500">Total paid</p>
                    <p className="text-lg font-semibold text-slate-900">Rs. {booking.totalPrice?.toLocaleString()}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCancel(booking._id)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold border border-red-200 text-red-600 hover:bg-red-50"
                  >
                    Cancel
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Profile;