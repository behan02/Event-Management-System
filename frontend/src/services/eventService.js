import { axiosInstance } from "../lib/axios";

const mapResponseData = (response) => response?.data ?? [];

export const fetchEvents = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/events", { params });
    return mapResponseData(response);
  } catch (error) {
    if (error.response?.status === 404) {
      return [];
    }
    throw error;
  }
};

export const fetchEventById = async (eventId) => {
  const { data } = await axiosInstance.get(`/events/${eventId}`);
  return data;
};

export const fetchMyEvents = async () => {
  try {
    const response = await axiosInstance.get("/events/myEvents");
    return mapResponseData(response);
  } catch (error) {
    if (error.response?.status === 404) {
      return [];
    }
    throw error;
  }
};

export const createEvent = async (payload) => {
  const { data } = await axiosInstance.post("/events/create", payload);
  return data;
};

export const updateEvent = async (eventId, payload) => {
  const { data } = await axiosInstance.put(`/events/update/${eventId}`, payload);
  return data;
};

export const deleteEvent = async (eventId) => {
  await axiosInstance.delete(`/events/delete/${eventId}`);
};

