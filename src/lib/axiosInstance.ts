import axios from "axios";

// Create an Axios instance
export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

export const axiosInstanceLocal = axios.create({
  baseURL: "/",
  headers: { "Content-Type": "application/json" },
});
