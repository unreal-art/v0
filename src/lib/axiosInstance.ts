import axios from "axios";
import https from "https";

export const axiosInstance = axios.create({
  baseURL: "https://darts.decenterai.com:8080", // Base URL
  headers: {
    "Content-Type": "application/json",
  },
  httpsAgent: new https.Agent({ rejectUnauthorized: false }), // Allow self-signed SSL
});

export const axiosInstanceLocal = axios.create({
  baseURL: "/",
  headers: { "Content-Type": "application/json" },
});
