import axiosInstance from "../../services/axiosInstance";

export const getChannelStats = async () => {
  const response = await axiosInstance.get("/dashboard/stats");
  return response.data;
};

export const getChannelVideosForDashboard = async () => {
  const response = await axiosInstance.get("/dashboard/videos");
  return response.data;
};

export const togglePublishStatus = async (videoId) => {
  const response = await axiosInstance.patch(
    `/videos/toggle-publish-status/${videoId}`,
  );
  return response.data;
};

export const deleteVideo = async (videoId) => {
  const response = await axiosInstance.delete(`/videos/delete/${videoId}`);
  return response.data;
};
