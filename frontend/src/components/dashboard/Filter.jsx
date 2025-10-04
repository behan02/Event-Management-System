import React, { useState } from 'react'

const Filter = () => {
  const [filters, setFilters] = useState({
    location: '',
    category: '',
    date: '',
    priceRange: ''
  });

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

  return (
    <div className='py-12 px-4'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='text-center mb-12'>
          <h2 className='text-4xl font-bold text-gray-800 mb-3'>Discover Amazing Events</h2>
          <p className='text-lg text-gray-600'>Find the perfect event that matches your interests</p>
        </div>

        {/* Filter Container */}
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
                <option value="Conference">💼 Conference</option>
                <option value="Workshop">🔧 Workshop</option>
                <option value="Food">🍽️ Food & Drink</option>
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
            <button className='bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center'>
              <svg className='w-5 h-5 mr-2' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z' />
              </svg>
              Search Events
            </button>
            <button 
              onClick={clearAllFilters}
              className='border-2 border-gray-300 hover:border-red-400 text-gray-700 hover:text-red-600 font-semibold py-3 px-8 rounded-xl hover:bg-red-50 transition-all duration-200 flex items-center'
            >
              <svg className='w-5 h-5 mr-2' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z' />
              </svg>
              Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Filter;