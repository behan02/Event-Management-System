import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import sampleEventImg from "../../assets/event.jpg";
import { fetchEvents, fetchMyEvents } from "../../services/eventService";
import { AuthContext } from "../../store/useAuthStore";

const getCategoryColor = (category) => {
  const colors = {
    Technology: "bg-blue-100 text-blue-800",
    Sports: "bg-green-100 text-green-800",
    Education: "bg-purple-100 text-purple-800",
    Concert: "bg-pink-100 text-pink-800",
    Workshop: "bg-orange-100 text-orange-800",
    Food: "bg-red-100 text-red-800",
  };
  return colors[category] || "bg-gray-100 text-gray-800";
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const EventGrid = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    let isMounted = true;
    const loadEvents = async () => {
      try {
        setLoading(true);
        const [allEvents, myEvents] = await Promise.all([
          fetchEvents(),
          isAuthenticated ? fetchMyEvents() : Promise.resolve([])
        ]);
        
        if (isMounted) {
          const currentDate = new Date();
          
          // Filter out past events but show all events including user's own
          const futureEvents = allEvents.filter(event => new Date(event.date) >= currentDate);
          setEvents(futureEvents.slice(0, 6));
        }
      } catch (err) {
        if (isMounted) {
          const errorMsg = err.response?.data?.message || "Unable to load events";
          setError(errorMsg);
          toast.error(errorMsg);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    loadEvents();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Upcoming events</h2>
          <p className="text-gray-500 text-sm">Browse what the community is hosting next.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/events")}
          className="px-4 py-2 rounded-xl text-sm font-semibold border border-indigo-200 text-indigo-600 hover:bg-indigo-50"
        >
          Manage events
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12 text-gray-500">Loading events...</div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg">{error}</div>
      ) : events.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-10 text-center text-gray-500">
          No events scheduled yet. Be the first to{" "}
          <button className="text-indigo-600 font-semibold" onClick={() => navigate("/events")}>
            create one
          </button>
          .
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const occupied = event.bookedCount ?? 0;
            const capacity = event.maxParticipants || 0;
            const progress = capacity ? Math.min((occupied / capacity) * 100, 100) : 0;
            return (
              <article
                key={event._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition border border-gray-100 overflow-hidden flex flex-col"
              >
                <div className="relative">
                  <img
                    src={event.imageUrl || sampleEventImg}
                    alt={event.title}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(event.category)}`}>
                      {event.category || "General"}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 bg-white/90 rounded-lg px-3 py-1 text-sm font-bold text-gray-800">
                    {event.price === 0 ? "FREE" : `Rs. ${event.price?.toLocaleString()}`}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 min-h-[48px]">{event.description}</p>
                  <div className="space-y-3 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-indigo-500">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1z" />
                          <path d="M6 7a1 1 0 000 2h8a1 1 0 100-2H6z" />
                        </svg>
                      </span>
                      <span>
                        {formatDate(event.date)} • {formatTime(event.date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-rose-500">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          />
                        </svg>
                      </span>
                      <span>{event.location}</span>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Booked</span>
                      <span>
                        {occupied}/{capacity || "∞"}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-200">
                      <div className="h-2 rounded-full bg-gradient-to-r from-green-400 to-green-600" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  <div className="mt-auto flex gap-2 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      className="flex-1 bg-indigo-600 text-white rounded-xl py-2 text-sm font-semibold hover:bg-indigo-700 transition"
                      onClick={() => navigate(`/events/${event._id}`)}
                    >
                      Book now
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 rounded-xl border border-indigo-200 text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
                      onClick={() => navigate(`/events/${event._id}`)}
                      aria-label="View event details"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EventGrid;