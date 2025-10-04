import sampleEventImg from "../../assets/event.jpg"

const EventGrid = () => {
  // Sample events data
  const events = [
    {
      id: 1,
      title: "Tech Conference 2025",
      date: "2025-12-15",
      time: "09:00 AM",
      location: "Colombo Convention Center",
      category: "Technology",
      price: 2500,
      attendance: 150,
      maxParticipants: 200,
      image: sampleEventImg,
    },
    {
      id: 2,
      title: "Music Festival Kandy",
      date: "2025-11-20",
      time: "06:00 PM",
      location: "Kandy Lake Club",
      category: "Concert",
      price: 1500,
      attendance: 280,
      maxParticipants: 300,
      image: sampleEventImg,
    },
    {
      id: 3,
      title: "Sports Championship",
      date: "2025-10-30",
      time: "02:00 PM",
      location: "Sugathadasa Stadium",
      category: "Sports",
      price: 0,
      attendance: 450,
      maxParticipants: 500,
      image: sampleEventImg,
    },
    {
      id: 4,
      title: "Business Workshop",
      date: "2025-11-05",
      time: "10:00 AM",
      location: "Hilton Colombo",
      category: "Workshop",
      price: 3500,
      attendance: 25,
      maxParticipants: 50,
      image: sampleEventImg,
    },
    {
      id: 5,
      title: "Food Festival Galle",
      date: "2025-12-01",
      time: "11:00 AM",
      location: "Galle Face Green",
      category: "Food",
      price: 500,
      attendance: 320,
      maxParticipants: 400,
      image: sampleEventImg,
    },
    {
      id: 6,
      title: "Educational Seminar",
      date: "2025-11-12",
      time: "09:30 AM",
      location: "University of Colombo",
      category: "Education",
      price: 0,
      attendance: 180,
      maxParticipants: 250,
      image: sampleEventImg,
    }
  ];

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      'Technology': 'bg-blue-100 text-blue-800',
      'Sports': 'bg-green-100 text-green-800',
      'Education': 'bg-purple-100 text-purple-800',
      'Concert': 'bg-pink-100 text-pink-800',
      'Workshop': 'bg-orange-100 text-orange-800',
      'Food': 'bg-red-100 text-red-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto px-20 py-12">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">All Events</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div key={event.id} className='bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 transform hover:-translate-y-1'>
            {/* Image Section */}
            <div className='relative overflow-hidden'>
              <img 
                src={event.image} 
                alt={event.title} 
                className='w-full h-48 object-cover transition-transform duration-300 hover:scale-105' 
              />
              
              {/* Category Badge */}
              <div className='absolute top-3 left-3'>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(event.category)}`}>
                  {event.category}
                </span>
              </div>

              {/* Price Tag */}
              <div className='absolute top-3 right-3 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg px-3 py-1'>
                <span className='text-sm font-bold text-gray-800'>
                  {event.price === 0 ? 'FREE' : `Rs. ${event.price.toLocaleString()}`}
                </span>
              </div>
            </div>

            {/* Content Section */}
            <div className='p-6'>
              {/* Title */}
              <h3 className='text-xl font-bold text-gray-800 mb-3 hover:text-indigo-600 transition-colors duration-200'>
                {event.title}
              </h3>

              {/* Date & Time */}
              <div className='flex items-center mb-3 text-gray-600'>
                <svg className='w-4 h-4 mr-2 text-indigo-500' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z' />
                </svg>
                <span className='text-sm font-medium'>
                  {formatDate(event.date)} • {event.time}
                </span>
              </div>

              {/* Location */}
              <div className='flex items-center mb-4 text-gray-600'>
                <svg className='w-4 h-4 mr-2 text-red-500' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z' />
                </svg>
                <span className='text-sm font-medium'>
                  {event.location}
                </span>
              </div>

              {/* Attendance Progress */}
              <div className='mb-4'>
                <div className='flex justify-between items-center mb-2'>
                  <span className='text-sm font-medium text-gray-700'>Attendance</span>
                  <span className='text-sm text-gray-600'>
                    {event.attendance}/{event.maxParticipants}
                  </span>
                </div>
                <div className='w-full bg-gray-200 rounded-full h-2'>
                  <div 
                    className='bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300'
                    style={{ width: `${Math.min((event.attendance / event.maxParticipants) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex gap-2 pt-4 border-t border-gray-100'>
                <button className='flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 text-sm'>
                  Book Now
                </button>
                <button className='border-2 border-gray-300 hover:border-indigo-400 text-gray-700 hover:text-indigo-600 font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 hover:bg-indigo-50'>
                  <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                    <path d='M10 12a2 2 0 100-4 2 2 0 000 4z' />
                    <path fillRule='evenodd' d='M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z' />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default EventGrid