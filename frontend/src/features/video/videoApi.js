import axiosInstance from "../../services/axiosInstance";

export const getAllVideos = async ({
  page = 1,
  limit = 6,
  query = "",
  sortBy = "createdAt",
  sortType = "desc",
  userId = "",
} = {}) => {
  const params = new URLSearchParams({ page, limit, sortBy, sortType });
  if (query) params.append("query", query);
  if (userId) params.append("userId", userId);
  const response = await axiosInstance.get(`/videos/get-all-videos?${params}`);
  return response.data;
};

export const getVideoById = async (videoId) => {
  const response = await axiosInstance.get(`/videos/${videoId}`);
  return response.data;
};

export const toggleVideoLike = async (videoId) => {
  const response = await axiosInstance.post(`/likes/video-toggle/${videoId}`);
  return response.data;
};

export const toggleVideoSave = async (videoId) => {
  const response = await axiosInstance.post(`/saves/toggle/${videoId}`);
  return response.data;
};

export const getSavedVideos = async () => {
  const response = await axiosInstance.get(`/saves/get-saved-videos`);
  return response.data;
};

export const increaseViewCount = async (videoId) => {
  const response = await axiosInstance.patch(
    `/videos/increase-views/${videoId}`,
  );
  return response.data;
};

export const uploadVideo = async (formData, onUploadProgress) => {
  const response = await axiosInstance.post("/videos/publish", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (progressEvent) => {
      const percent = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total,
      );
      onUploadProgress?.(percent);
    },
  });
  return response.data;
};

export const getLikedVideos = async () => {
  const response = await axiosInstance.get("/likes/get-liked-videos");
  return response.data;
};

export const getWatchHistory = async () => {
  const response = await axiosInstance.get("/users/watch-history");
  return response.data;
};

export const clearWatchHistory = async () => {
  const response = await axiosInstance.delete("/users/watch-history");
  return response.data;
};

export const addToWatchHistory = async (videoId)=> {
  const response = await axiosInstance.patch(`/videos/add-to-watch-history/${videoId}`);
  return response.data;
}

export const getNotes = async (videoId) => {
  const response = await axiosInstance.get(
    `/notes/get-notes/${videoId}`,
  );
  return response.data;
}

export const updateVideoDetails = async (videoId, formData) => {
  const res = await axiosInstance.patch(
    `/videos/update-video-details/${videoId}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return res.data;
};