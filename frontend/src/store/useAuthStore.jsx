import { createContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
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
            setSession(data.accessToken, setToken);
            
            // Fetch user profile after successful login
            try {
                const { data: profileData } = await axiosInstance.get("/auth/profile");
                setUser(profileData.user);
                persistUser(profileData.user);
            } catch (profileErr) {
                console.error("Failed to fetch user profile:", profileErr);
                // Fallback user data
                const fallbackUser = {
                    name: credentials.email?.split('@')[0] || 'User',
                    email: credentials.email
                };
                setUser(fallbackUser);
                persistUser(fallbackUser);
            }
            
            toast.success('Welcome back!');
            navigate("/");
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || "Unable to login";
            setError(message);
            toast.error(message);
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
            setSession(data.accessToken, setToken);
            
            // Fetch user profile after successful signup
            try {
                const { data: profileData } = await axiosInstance.get("/auth/profile");
                setUser(profileData.user);
                persistUser(profileData.user);
            } catch (profileErr) {
                console.error("Failed to fetch user profile:", profileErr);
                // Fallback user data
                const fallbackUser = { name: payload.name, email: payload.email };
                setUser(fallbackUser);
                persistUser(fallbackUser);
            }
            
            toast.success('Account created successfully! Welcome to Eventix!');
            navigate("/");
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || "Unable to sign up";
            setError(message);
            toast.error(message);
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
            toast.success('Logged out successfully');
        } catch (err) {
            console.error("Logout failed", err);
            toast.error('Logout failed, but you have been signed out locally');
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
                    
                    // Fetch user profile if token is available
                    try {
                        const { data: profileData } = await axiosInstance.get("/auth/profile");
                        if (isMounted) {
                            setUser(profileData.user);
                            persistUser(profileData.user);
                        }
                    } catch (profileErr) {
                        console.error("Failed to fetch user profile during bootstrap:", profileErr);
                    }
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
