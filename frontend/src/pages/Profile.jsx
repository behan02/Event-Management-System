import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AuthContext } from "../store/useAuthStore";
import { fetchMyBookings } from "../services/bookingService";
import { fetchMyEvents } from "../services/eventService";
import { fetchUserProfile } from "../services/authService";

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

const Profile = () => {
  const { user: contextUser } = useContext(AuthContext);
  const [user, setUser] = useState(contextUser);
  const [bookings, setBookings] = useState([]);
  const [events, setEvents] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadBookings = async () => {
    setBookingsLoading(true);
    setError(null);
    try {
      const data = await fetchMyBookings();
      // Sort by date (most recent first)
      data.sort((a, b) => {
        const dateA = new Date(a.eventId?.date || 0);
        const dateB = new Date(b.eventId?.date || 0);
        return dateB - dateA;
      });
      setBookings(data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load bookings");
    } finally {
      setBookingsLoading(false);
    }
  };

  const loadEvents = async () => {
    setEventsLoading(true);
    try {
      const data = await fetchMyEvents();
      // Sort by date (most recent first)
      data.sort((a, b) => {
        const dateA = new Date(a.date || 0);
        const dateB = new Date(b.date || 0);
        return dateB - dateA;
      });
      setEvents(data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load events");
    } finally {
      setEventsLoading(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      setUserLoading(true);
      const userData = await fetchUserProfile();
      setUser(userData);
    } catch (err) {
      console.error('Failed to load user profile:', err);
      toast.error('Failed to load profile data');
      // Fallback to context user if API fails
      setUser(contextUser);
    } finally {
      setUserLoading(false);
    }
  };

  useEffect(() => {
    loadUserProfile();
    loadBookings();
    loadEvents();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <section className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
        {userLoading ? (
          <div className="flex items-center gap-4 w-full">
            <div className="w-16 h-16 rounded-2xl bg-gray-200 animate-pulse"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl font-semibold">
              {(user?.name || "E")[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-sm uppercase font-semibold text-slate-500">Profile</p>
              <h1 className="text-3xl font-bold text-slate-900">{user?.name || "Eventix member"}</h1>
              <p className="text-slate-500">{user?.email}</p>
              {user?.createdAt && (
                <p className="text-xs text-slate-400 mt-1">
                  Member since {new Date(user.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long' 
                  })}
                </p>
              )}
            </div>
          </>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">All My Bookings</h2>
          <p className="text-sm text-slate-500 mt-1">View all your bookings, past and future</p>
        </div>
        {error && <div className="bg-red-50 text-red-700 px-4 py-2 rounded-xl">{error}</div>}
        {bookingsLoading ? (
          <div className="text-center text-slate-500 py-12">Loading bookings…</div>
        ) : bookings.length === 0 ? (
          <div className="border border-dashed border-gray-300 rounded-2xl p-10 text-center text-slate-500">
            No bookings yet. Visit the events page to reserve seats.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookings.map((booking) => {
              const eventDate = new Date(booking.eventId?.date);
              const isPast = eventDate < new Date();
              
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
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <p className="text-xs uppercase text-slate-500 mb-1">Total paid</p>
                        <p className="text-lg font-semibold text-slate-900">
                          {booking.totalPrice === 0 ? "Free" : `Rs. ${booking.totalPrice?.toLocaleString() || "0"}`}
                        </p>
                        <p className={`text-xs font-semibold mt-1 ${
                          booking.paymentStatus === 'success' ? 'text-green-600' : 
                          booking.paymentStatus === 'pending' ? 'text-yellow-600' : 
                          'text-red-600'
                        }`}>
                          {booking.paymentStatus === 'success' ? '✓ Paid' : 
                           booking.paymentStatus === 'pending' ? '⏱ Pending' : 
                           '✗ Failed'}
                        </p>
                      </div>
                      {isPast ? (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                          Past
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          Upcoming
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">My Created Events</h2>
          <p className="text-sm text-slate-500 mt-1">All events you've created, past and future</p>
        </div>
        {eventsLoading ? (
          <div className="text-center text-slate-500 py-12">Loading events…</div>
        ) : events.length === 0 ? (
          <div className="border border-dashed border-gray-300 rounded-2xl p-10 text-center text-slate-500">
            You haven't created any events yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((event) => {
              const eventDate = new Date(event.date);
              const isPast = eventDate < new Date();
              
              return (
                <article
                  key={event._id}
                  className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 space-y-4 flex flex-col"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-purple-600 uppercase tracking-wide mb-1">
                        Event
                      </p>
                      <h3 className="text-xl font-semibold text-slate-900">{event.title}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Price</p>
                      <p className="text-lg font-bold text-slate-900">
                        {event.price === 0 ? "FREE" : `Rs. ${event.price?.toLocaleString()}`}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 line-clamp-2">{event.description}</p>

                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        />
                      </svg>
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1z" />
                        <path d="M6 7a1 1 0 000 2h8a1 1 0 100-2H6z" />
                      </svg>
                      <span>{formatDateTime(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                      <span>
                        {event.bookedCount || 0}/{event.maxParticipants} participants
                      </span>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase text-slate-500 mb-1">Category</p>
                        <p className="text-sm font-semibold text-slate-900">{event.category || "General"}</p>
                      </div>
                      {isPast ? (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                          Past
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          Upcoming
                        </span>
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

export default Profile;