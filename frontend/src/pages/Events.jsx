import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import sampleEventImg from "../assets/event.jpg";
import {
  createEvent,
  deleteEvent,
  fetchEvents,
  fetchMyEvents,
  updateEvent,
} from "../services/eventService";

const defaultFormState = {
  title: "",
  description: "",
  date: "",
  location: "",
  category: "",
  price: 0,
  maxParticipants: 10,
  imageUrl: "",
};

const formatDate = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatForInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
};

const Events = () => {
  const [events, setEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [banner, setBanner] = useState(null);
  const [isFormOpen, setFormOpen] = useState(false);
  const [formValues, setFormValues] = useState(defaultFormState);
  const [editingId, setEditingId] = useState(null);

  const navigate = useNavigate();

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [allEvents, ownedEvents] = await Promise.all([fetchEvents(), fetchMyEvents()]);
      setEvents(allEvents);
      setMyEvents(ownedEvents);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const openCreateForm = () => {
    setFormValues(defaultFormState);
    setEditingId(null);
    setFormOpen(true);
  };

  const openEditForm = (event) => {
    setFormValues({
      ...event,
      date: formatForInput(event.date),
    });
    setEditingId(event._id);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setFormValues(defaultFormState);
  };

  const handleDelete = async (eventId) => {
    const confirmDelete = window.confirm("Delete this event? This cannot be undone.");
    if (!confirmDelete) return;
    setActionLoading(true);
    setBanner(null);
    try {
      await deleteEvent(eventId);
      setBanner({ type: "success", message: "Event deleted successfully." });
      await loadEvents();
    } catch (err) {
      setBanner({ type: "error", message: err.response?.data?.message || "Unable to delete event" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setActionLoading(true);
    setBanner(null);

    const payload = {
      ...formValues,
      price: Number(formValues.price) || 0,
      maxParticipants: Number(formValues.maxParticipants) || 1,
      date: formValues.date ? new Date(formValues.date).toISOString() : new Date().toISOString(),
    };

    try {
      if (editingId) {
        await updateEvent(editingId, payload);
        setBanner({ type: "success", message: "Event updated successfully." });
      } else {
        await createEvent(payload);
        setBanner({ type: "success", message: "Event created successfully." });
      }
      closeForm();
      await loadEvents();
    } catch (err) {
      setBanner({ type: "error", message: err.response?.data?.message || "Unable to save event" });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      <header className="space-y-3">
        <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">Events</p>
        <h1 className="text-3xl font-bold text-slate-900">Plan, publish & discover</h1>
        <p className="text-slate-500 max-w-3xl">
          Create public or private events, manage capacity, and explore what other organizers in the Eventix community
          are hosting.
        </p>
      </header>

      {banner && (
        <div
          className={`rounded-xl px-4 py-3 text-sm ${
            banner.type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
          }`}
        >
          {banner.message}
        </div>
      )}

      <section className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Manage your events</h2>
            <p className="text-sm text-slate-500">Create new experiences or update existing ones.</p>
          </div>
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-indigo-700"
          >
            <span className="text-xl leading-none">＋</span>
            Create event
          </button>
        </div>

        {loading ? (
          <div className="text-center text-slate-500 py-10">Loading your events…</div>
        ) : myEvents.length === 0 ? (
          <div className="border border-dashed border-gray-300 rounded-2xl p-8 text-center text-slate-500">
            You haven&apos;t published any events yet.
          </div>
        ) : (
          <div className="overflow-hidden border border-gray-100 rounded-2xl">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Capacity</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {myEvents.map((event, index) => (
                  <tr key={event._id} className="border-t border-gray-100">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{event.title}</div>
                      <div className="text-xs text-slate-500">{event.category}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(event.date)}</td>
                    <td className="px-4 py-3 text-slate-600">{event.location}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {event.bookedCount || 0}/{event.maxParticipants}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                          onClick={() => openEditForm(event)}
                        >
                          Edit
                        </button>
                        <button
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(event._id)}
                          disabled={actionLoading}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Discover events</h2>
          <p className="text-sm text-slate-500">
            Browse what everyone else is organizing. View the details page to see descriptions and book seats.
          </p>
        </div>

        {loading ? (
          <div className="text-center text-slate-500 py-10">Loading events…</div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl">{error}</div>
        ) : events.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-10 text-center text-slate-500">
            No events are published yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((event) => (
              <article
                key={event._id}
                className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden flex flex-col"
              >
                <img
                  src={event.imageUrl || sampleEventImg}
                  alt={event.title}
                  className="h-48 w-full object-cover"
                  loading="lazy"
                />
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-3 text-xs font-semibold">
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700">{event.category || "Event"}</span>
                    <span className="text-indigo-600">
                      {event.price === 0 ? "Free" : `Rs. ${event.price?.toLocaleString()}`}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">{event.title}</h3>
                  <p className="text-sm text-slate-500 mt-2 min-h-[60px]">{event.description}</p>
                  <dl className="mt-4 space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <span className="text-indigo-500">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1z" />
                          <path d="M6 7a1 1 0 000 2h8a1 1 0 100-2H6z" />
                        </svg>
                      </span>
                      <span>{formatDate(event.date)}</span>
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
                  </dl>
                  <div className="mt-auto pt-5 flex items-center justify-between border-t border-slate-100">
                    <div className="text-xs text-slate-500">
                      {event.bookedCount || 0}/{event.maxParticipants} seats booked
                    </div>
                    <div className="flex gap-2">
                      {myEvents.some((owned) => owned._id === event._id) && (
                        <span className="px-3 py-1 text-xs rounded-lg bg-indigo-50 text-indigo-600 font-semibold">
                          You are the host
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => navigate(`/events/${event._id}`)}
                        className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800"
                      >
                        View details
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">
                  {editingId ? "Update event" : "Create new event"}
                </h3>
                <p className="text-sm text-slate-500">Provide the essentials to help guests discover your event.</p>
              </div>
              <button
                onClick={closeForm}
                className="text-slate-400 hover:text-slate-600 rounded-full p-2"
                aria-label="Close form"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Title</label>
                  <input
                    type="text"
                    required
                    value={formValues.title}
                    onChange={(e) => setFormValues((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Category</label>
                  <input
                    type="text"
                    required
                    value={formValues.category}
                    onChange={(e) => setFormValues((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Date & time</label>
                  <input
                    type="datetime-local"
                    required
                    value={formValues.date}
                    onChange={(e) => setFormValues((prev) => ({ ...prev, date: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Location</label>
                  <input
                    type="text"
                    required
                    value={formValues.location}
                    onChange={(e) => setFormValues((prev) => ({ ...prev, location: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Ticket price (Rs)</label>
                  <input
                    type="number"
                    min="0"
                    value={formValues.price}
                    onChange={(e) => setFormValues((prev) => ({ ...prev, price: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Max participants</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formValues.maxParticipants}
                    onChange={(e) => setFormValues((prev) => ({ ...prev, maxParticipants: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Image URL</label>
                <input
                  type="url"
                  placeholder="https://"
                  value={formValues.imageUrl}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, imageUrl: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Description</label>
                <textarea
                  required
                  rows="4"
                  value={formValues.description}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-2xl border border-gray-200 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60"
                >
                  {actionLoading ? "Saving..." : editingId ? "Update event" : "Create event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;