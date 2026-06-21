import axiosInstance from "../../services/axiosInstance.js"; // match your actual import path

export const getHomeFeed = async ({ page = 1, limit = 12, query = "" }) => {
  const { data } = await axiosInstance.get("/home", {
    params: { page, limit, query },
  });
  return data;
};
