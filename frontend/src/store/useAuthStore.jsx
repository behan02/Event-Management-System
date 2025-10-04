import { createContext, useState } from "react";
import { axiosInstance, setAccessToken } from "../lib/axios";

export const AuthContext = createContext();

export const AuthContextProvider = ({children}) => {

    const [user, setUser] = useState(null);
    const [accessToken, setToken] = useState(null);

    const login = async (data) => {
        try{
            const res = await axiosInstance.post("/auth/login", data);
            setUser(res.data);
            setToken(res.data.accessToken);
            setAccessToken(res.data.accessToken);
        }catch(error){
            console.error("Error in login context", error);
        }
    }

    return(
        <AuthContext.Provider value={{ user, accessToken }}>
            {children}
        </AuthContext.Provider>
    )
}