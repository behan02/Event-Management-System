import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
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
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [banner, setBanner] = useState(null);
  const [isFormOpen, setFormOpen] = useState(false);
  const [formValues, setFormValues] = useState(defaultFormState);
  const [editingId, setEditingId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    location: '',
    category: '',
    date: '',
    priceRange: ''
  });

  const navigate = useNavigate();

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      location: '',
      category: '',
      date: '',
      priceRange: ''
    });
  };

  const applyFilters = useCallback((eventsList) => {
    let filtered = [...eventsList];

    // Filter by location
    if (filters.location) {
      filtered = filtered.filter(event => 
        event.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Filter by category
    if (filters.category) {
      filtered = filtered.filter(event => 
        event.category === filters.category
      );
    }

    // Filter by date
    if (filters.date) {
      const filterDate = new Date(filters.date);
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.toDateString() === filterDate.toDateString();
      });
    }

    // Filter by price range
    if (filters.priceRange) {
      filtered = filtered.filter(event => {
        const price = event.price || 0;
        switch (filters.priceRange) {
          case 'free':
            return price === 0;
          case '0-2500':
            return price >= 0 && price <= 2500;
          case '2501-5000':
            return price >= 2501 && price <= 5000;
          case '5001-10000':
            return price >= 5001 && price <= 10000;
          case '10001-20000':
            return price >= 10001 && price <= 20000;
          case '20001+':
            return price >= 20001;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [filters]);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [allEvents, ownedEvents] = await Promise.all([fetchEvents(), fetchMyEvents()]);
      
      const currentDate = new Date();
      
      // Filter out past events but show all events including user's own
      const futureEvents = allEvents.filter(event => new Date(event.date) >= currentDate);
      
      // Filter past events from user's events too
      const futureMyEvents = ownedEvents.filter(event => new Date(event.date) >= currentDate);
      
      setEvents(futureEvents);
      setMyEvents(futureMyEvents);
      setFilteredEvents(futureEvents);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to load events";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Apply filters whenever events or filters change
  useEffect(() => {
    const filtered = applyFilters(events);
    setFilteredEvents(filtered);
  }, [events, applyFilters]);

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
    setSelectedImage(null);
    setImagePreview(event.imageUrl || null);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setFormValues(defaultFormState);
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleDelete = async (eventId) => {
    const confirmDelete = window.confirm("Delete this event? This cannot be undone.");
    if (!confirmDelete) return;
    setActionLoading(true);
    setBanner(null);
    try {
      await deleteEvent(eventId);
      toast.success("Event deleted successfully.");
      await loadEvents();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Unable to delete event";
      setBanner({ type: "error", message: errorMsg });
      toast.error(errorMsg);
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
      description: formValues.description || 'No description provided',
    };

    // Handle image upload
    if (selectedImage) {
      try {
        const base64Image = await convertToBase64(selectedImage);
        payload.image = base64Image;
      } catch (error) {
        console.error('Error converting image:', error);
        toast.error('Failed to process image');
        setActionLoading(false);
        return;
      }
    }

    try {
      if (editingId) {
        await updateEvent(editingId, payload);
        toast.success("Event updated successfully.");
      } else {
        await createEvent(payload);
        toast.success("Event created successfully.");
      }
      closeForm();
      await loadEvents();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Unable to save event";
      setBanner({ type: "error", message: errorMsg });
      toast.error(errorMsg);
    } finally {
      setActionLoading(false);
    }
  };

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
      <div className="relative mx-auto px-20 py-10 space-y-10">
      <header className="space-y-3">
        {/* <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">Events</p> */}
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

      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Discover events</h2>
          <p className="text-sm text-slate-500">
            Browse what everyone else is organizing. View the details page to see descriptions and book seats.
          </p>
        </div>

        {/* Filter Section */}
        <div className='bg-white rounded-3xl shadow-lg p-8 border border-gray-100'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            
            {/* Location Filter */}
            <div className='space-y-2'>
              <label className='flex items-center text-sm font-semibold text-gray-700 mb-2'>
                <svg className='w-4 h-4 mr-2 text-indigo-600' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z' />
                </svg>
                Location
              </label>
              <select 
                className='w-full border-2 border-gray-200 rounded-xl py-3 px-4 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 bg-gray-50 hover:bg-white'
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              >
                <option value="">All Locations</option>
                <option value="Colombo">Colombo</option>
                <option value="Kandy">Kandy</option>
                <option value="Galle">Galle</option>
                <option value="Jaffna">Jaffna</option>
                <option value="Negombo">Negombo</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className='space-y-2'>
              <label className='flex items-center text-sm font-semibold text-gray-700 mb-2'>
                <svg className='w-4 h-4 mr-2 text-purple-600' fill='currentColor' viewBox='0 0 20 20'>
                  <path d='M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z' />
                </svg>
                Category
              </label>
              <select 
                className='w-full border-2 border-gray-200 rounded-xl py-3 px-4 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-gray-50 hover:bg-white'
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="Sports">🏀 Sports</option>
                <option value="Education">📚 Education</option>
                <option value="Concert">🎵 Concert</option>
                <option value="Technology">💻 Technology</option>
                <option value="Workshop">🔧 Workshop</option>
                <option value="Food & Dining">🍽️ Food & Dining</option>
                <option value="Business">💼 Business</option>
                <option value="Art & Culture">🎨 Art & Culture</option>
                <option value="Health & Wellness">🧘 Health & Wellness</option>
                <option value="Others">📋 Others</option>
              </select>
            </div>

            {/* Date Filter */}
            <div className='space-y-2'>
              <label className='flex items-center text-sm font-semibold text-gray-700 mb-2'>
                <svg className='w-4 h-4 mr-2 text-pink-600' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z' />
                </svg>
                Date
              </label>
              <input 
                type="date" 
                className='w-full border-2 border-gray-200 rounded-xl py-3 px-4 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all duration-200 bg-gray-50 hover:bg-white'
                value={filters.date}
                onChange={(e) => handleFilterChange('date', e.target.value)}
              />
            </div>

            {/* Price Range Filter */}
            <div className='space-y-2'>
              <label className='flex items-center text-sm font-semibold text-gray-700 mb-2'>
                <svg className='w-4 h-4 mr-2 text-green-600' fill='currentColor' viewBox='0 0 20 20'>
                  <path d='M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z' />
                  <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.51-1.31c-.562-.649-1.413-1.076-2.353-1.253V5z' />
                </svg>
                Price Range
              </label>
              <select 
                className='w-full border-2 border-gray-200 rounded-xl py-3 px-4 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-gray-50 hover:bg-white'
                value={filters.priceRange}
                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
              >
                <option value="">Any Price</option>
                <option value="free">Free Events</option>
                <option value="0-2500">Rs. 0 - 2,500</option>
                <option value="2501-5000">Rs. 2,501 - 5,000</option>
                <option value="5001-10000">Rs. 5,001 - 10,000</option>
                <option value="10001-20000">Rs. 10,001 - 20,000</option>
                <option value="20001+">Rs. 20,001+</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex flex-col sm:flex-row gap-4 justify-center items-center mt-8 pt-6 border-t border-gray-200'>
            <button 
              onClick={clearAllFilters}
              className='border-2 border-gray-300 hover:border-red-400 text-gray-700 hover:text-red-600 font-semibold py-3 px-8 rounded-xl hover:bg-red-50 transition-all duration-200 flex items-center'
            >
              <svg className='w-5 h-5 mr-2' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z' />
              </svg>
              Clear All Filters
            </button>
            <div className='text-sm text-gray-600'>
              Showing {filteredEvents.length} of {events.length} events
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-slate-500 py-10">Loading events…</div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl">{error}</div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-10 text-center text-slate-500">
            {events.length === 0 ? "No events are published yet." : "No events match your current filters."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredEvents.map((event) => (
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
                      <button
                        type="button"
                        onClick={() => navigate(`/events/${event._id}`)}
                        className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-6 relative my-8 max-h-[90vh] overflow-y-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
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
                  <select
                    required
                    value={formValues.category}
                    onChange={(e) => {
                      setFormValues((prev) => ({ 
                        ...prev, 
                        category: e.target.value
                      }));
                    }}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  >
                    <option value="">Select a category</option>
                    <option value="Technology">Technology</option>
                    <option value="Sports">Sports</option>
                    <option value="Education">Education</option>
                    <option value="Concert">Concert</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Food & Dining">Food & Dining</option>
                    <option value="Business">Business</option>
                    <option value="Art & Culture">Art & Culture</option>
                    <option value="Health & Wellness">Health & Wellness</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Date & time</label>
                  <input
                    type="datetime-local"
                    required
                    min={new Date().toISOString().slice(0, 16)}
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
                <label className="text-xs font-semibold text-slate-600">Event Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-xl border border-gray-200"
                    />
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  Upload an image for your event (JPEG, PNG, etc.)
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Description <span className="text-gray-400">(optional)</span></label>
                <textarea
                  rows="4"
                  placeholder="Describe your event..."
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
    </div>
  );
};

export default Events;