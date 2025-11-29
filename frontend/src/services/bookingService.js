import { axiosInstance } from "../lib/axios";

export const bookEvent = async (eventId, payload) => {
  const { data } = await axiosInstance.post(`/bookings/createBooking/${eventId}`, payload);
  return data;
};

export const fetchMyBookings = async () => {
  try {
    const { data } = await axiosInstance.get("/bookings/myBookedEvents");
    return data?.bookings ?? [];
  } catch (error) {
    if (error.response?.status === 404) {
      return [];
    }
    throw error;
  }
};

export const cancelBooking = async (bookingId) => {
  await axiosInstance.get(`/bookings/cancelBookedEvent/${bookingId}`);
};

