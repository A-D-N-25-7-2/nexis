import axiosInstance from "../../services/axiosInstance";

export const toggleSubscription = async (channelId) => {
  const response = await axiosInstance.post(`/subscriptions/toggle/${channelId}`);
  return response.data;
};

export const getSubscribedChannels = async () => {
  const response = await axiosInstance.get('/subscriptions/get-subscribed-channels');
  return response.data;
};