import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: "http://localhost:3000/api",
    withCredentials: true
});

export const setAccessToken = (token) => {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};