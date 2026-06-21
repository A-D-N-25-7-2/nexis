import axiosInstance from "../../services/axiosInstance.js";

export const getUserTweets = async (userId) => {
  const response = await axiosInstance.get(`/tweets/get/${userId}`);
  return response.data;
};

export const createTweet = async (content) => {
  const response = await axiosInstance.post("/tweets/create", { content });
  return response.data;
};

export const updateTweet = async ({ tweetId, content }) => {
  const response = await axiosInstance.patch(`/tweets/update/${tweetId}`, {
    content,
  });
  return response.data;
};

export const deleteTweet = async (tweetId) => {
  const response = await axiosInstance.delete(`/tweets/delete/${tweetId}`);
  return response.data;
};

export const toggleTweetLike = async (tweetId) => {
  const response = await axiosInstance.post(`/likes/tweet-toggle/${tweetId}`);
  return response.data;
};

