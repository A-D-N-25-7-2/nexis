import axiosInstance from "../../services/axiosInstance";

export const getUserChannel = async (username) => {
  const response = await axiosInstance.get(`/users/channel/${username}`);
  return response.data;
};

export const getChannelVideos = async (userId, page = 1, limit = 10) => {
  const response = await axiosInstance.get(
    `/videos/get-all-videos?userId=${userId}&page=${page}&limit=${limit}`,
  );
  return response.data;
};

export const changeChannelAvatar = async (formData) => {
  const response = await axiosInstance.patch("/users/update-avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const changeChannelCoverImage = async (formData) => {
  const response = await axiosInstance.patch(
    "/users/update-cover-image",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    });

  return response.data;
};

export const changeChannelFullName = async (fullName) => {
  const response = await axiosInstance.patch("/users/update-account", { fullName });
  return response.data;
};

export const changePassword = async (oldPassword, newPassword) => {
  const response = await axiosInstance.patch("/users/change-password", {
    oldPassword,
    newPassword,
  });
  return response.data;
};

export const getChannelTweets = async (channelId, page = 1) => {
  const response = await axiosInstance.get(
    `/tweets/get/${channelId}?page=${page}`,
  );
  return response.data;
};

export const getChannelPlaylists = async (channelId) => {
  const response = await axiosInstance.get(
    `/playlists/get-user-playlists/${channelId}`,
  );
  return response.data;
};
