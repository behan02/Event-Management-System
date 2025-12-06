import { axiosInstance } from "../lib/axios";

export const createCheckoutSession = async (eventId, quantity) => {
    const response = await axiosInstance.post(`/payment/create-checkout-session/${eventId}`, { quantity });
    return response.data;
};

export const verifyPayment = async (sessionId) => {
    const response = await axiosInstance.post('/payment/verify-payment', { sessionId });
    return response.data;
};
