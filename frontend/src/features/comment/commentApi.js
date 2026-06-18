import axiosInstance from "../../services/axiosInstance";

export const getVideoComments = async (videoId, page = 1, limit = 10) => {
  const response = await axiosInstance.get(
    `/comments/get-all-comments/${videoId}?page=${page}&limit=${limit}`,
  );
  return response.data;
};

export const addComment = async (videoId, content) => {
  const response = await axiosInstance.post(`/comments/add/${videoId}`, {
    content,
  });
  return response.data;
};

export const updateComment = async (commentId, content) => {
  const response = await axiosInstance.patch(`/comments/update/${commentId}`, {
    content,
  });
  return response.data;
};

export const deleteComment = async (commentId) => {
  const response = await axiosInstance.delete(`/comments/delete/${commentId}`);
  return response.data;
};

export const toggleCommentLike = async (commentId) => {
  const response = await axiosInstance.post(`/likes/comment-toggle/${commentId}`);
  return response.data;
};
