import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api";

export const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true
});

let accessTokenRef = null;

export const setAccessToken = (token) => {
    accessTokenRef = token;
    if(token){
        axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
        delete axiosInstance.defaults.headers.common.Authorization;
    }
};

export const clearAccessToken = () => {
    accessTokenRef = null;
    delete axiosInstance.defaults.headers.common.Authorization;
};

const refreshClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true
});

let refreshPromise = null;

const requestNewAccessToken = async () => {
    if(!refreshPromise){
        refreshPromise = refreshClient.post("/auth/refresh")
            .then(({ data }) => {
                if(data?.accessToken){
                    setAccessToken(data.accessToken);
                }
                return data?.accessToken || null;
            })
            .finally(() => {
                refreshPromise = null;
            });
    }
    return refreshPromise;
};

export const ensureFreshAccessToken = async () => {
    try{
        const token = await requestNewAccessToken();
        return token;
    } catch(error){
        clearAccessToken();
        throw error;
    }
};

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        const isAuthEndpoint = originalRequest?.url?.includes("/auth/login")
            || originalRequest?.url?.includes("/auth/signup")
            || originalRequest?.url?.includes("/auth/refresh");

        if (error.response?.status === 401 && !originalRequest?._retry && !isAuthEndpoint) {
            originalRequest._retry = true;
            try {
                const newToken = await requestNewAccessToken();
                if(newToken){
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return axiosInstance(originalRequest);
                }
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);