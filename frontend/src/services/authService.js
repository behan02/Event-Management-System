import { axiosInstance } from "../lib/axios";

export const fetchUserProfile = async () => {
  const { data } = await axiosInstance.get("/auth/profile");
  return data.user;
};