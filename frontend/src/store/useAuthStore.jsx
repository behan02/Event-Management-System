import { createContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance, clearAccessToken, ensureFreshAccessToken, setAccessToken } from "../lib/axios";

export const AuthContext = createContext();

const USER_STORAGE_KEY = "eventix:user";

const canAccessStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const getStoredUser = () => {
    if (!canAccessStorage()) return null;
    const cachedUser = window.localStorage.getItem(USER_STORAGE_KEY);
    if (!cachedUser) return null;
    try {
        return JSON.parse(cachedUser);
    } catch {
        window.localStorage.removeItem(USER_STORAGE_KEY);
        return null;
    }
};

const setSession = (token, setTokenState) => {
    setTokenState(token);
    setAccessToken(token);
};

const persistUser = (user) => {
    if (!canAccessStorage()) return;
    if (user) {
        window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
        window.localStorage.removeItem(USER_STORAGE_KEY);
    }
};

export const AuthContextProvider = ({ children }) => {
    const navigate = useNavigate();

    const [user, setUser] = useState(() => getStoredUser());
    const [accessToken, setToken] = useState(null);
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);
    const [error, setError] = useState(null);

    const login = async (credentials) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axiosInstance.post("/auth/login", credentials);
            setUser(data.user);
            setSession(data.accessToken, setToken);
            persistUser(data.user);
            navigate("/");
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || "Unable to login";
            setError(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    const signup = async (payload) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axiosInstance.post("/auth/signup", payload);
            const userPayload = { name: payload.name, email: payload.email };
            setUser(userPayload);
            persistUser(userPayload);
            setSession(data.accessToken, setToken);
            navigate("/");
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || "Unable to sign up";
            setError(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        setError(null);
        try {
            await axiosInstance.post("/auth/logout");
        } catch (err) {
            console.error("Logout failed", err);
        } finally {
            setUser(null);
            setSession(null, setToken);
            clearAccessToken();
            persistUser(null);
            navigate("/login");
            setLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;
        const bootstrap = async () => {
            try {
                const token = await ensureFreshAccessToken();
                if (token && isMounted) {
                    setSession(token, setToken);
                }
            } catch (err) {
                console.info("No active session", err.message);
                if (isMounted) {
                    setUser(null);
                    persistUser(null);
                }
            } finally {
                if (isMounted) {
                    setInitializing(false);
                }
            }
        };
        bootstrap();
        return () => {
            isMounted = false;
        };
    }, []);

    const value = useMemo(() => ({
        user,
        accessToken,
        isAuthenticated: Boolean(accessToken),
        login,
        signup,
        logout,
        loading,
        initializing,
        error,
        setError
    }), [user, accessToken, loading, initializing, error]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
