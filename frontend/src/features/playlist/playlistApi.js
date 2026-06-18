import axiosInstance from "../../services/axiosInstance.js";

export const createPlaylist = async ({ name, description }) => {
  const response = await axiosInstance.post("/playlists/create", {
    name,
    description,
  });
  return response.data;
};

export const deletePlaylist = async (playlistId) => {
  const response = await axiosInstance.delete(
    `/playlists/delete/${playlistId}`,
  );
  return response.data;
};

export const getPlaylistById = async (playlistId) => {
  const response = await axiosInstance.get(
    `/playlists/get-playlist/${playlistId}`,
  );
  return response.data.data;
};

export const addVideoToPlaylist  = async (playlistId, videoId) => {
  const response = await axiosInstance.patch(`/playlists/add-video/${playlistId}/${videoId}`)
  return response.data;
} 

export const removeVideoFromPlaylist = async (playlistId, videoId) => {
  const response = await axiosInstance.patch(
    `/playlists/remove-video/${playlistId}/${videoId}`,
  );
  return response.data;
}

export const updatePlaylist = async (playlistId, { name, description }) => {
  const res = await axiosInstance.patch(`/playlists/update/${playlistId}`, {
    name,
    description,
  });
  return res.data;
};