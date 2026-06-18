import { useState } from 'react'
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  getSubscribedChannels,
  toggleSubscription,
} from "../features/subscription/subscriptionApi";
import { formatCount } from '../utils/formatCount';
import { Users } from 'lucide-react';

const Subscriptions = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['subscribedChannels'],
    queryFn: getSubscribedChannels,
    staleTime: 1000 * 60 * 5,
  });

  const channels = data?.data || [];

  if (isLoading) return <SubscriptionsSkeleton />;

  if (isError) return (
    <div className="text-red-400 bg-red-400/10 px-4 py-3 rounded-lg">
      Failed to load subscriptions.
    </div>
  );

  return (
    <div className="max-w-screen-xl">
      <h1 className="text-white text-2xl font-bold mb-6">Subscriptions</h1>

      {channels.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <Users size={48} className="text-zinc-700" />
          <p className="text-zinc-400 font-medium">No subscriptions yet</p>
          <p className="text-zinc-600 text-sm">
            Channels you subscribe to will appear here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {channels.map((channel) => (
            <ChannelCard key={channel._id} channel={channel} />
          ))}
        </div>
      )}
    </div>
  );
};

const ChannelCard = ({ channel }) => {

    const [isSubscribed, setIsSubscribed] = useState(
      channel.isSubscribed ?? true,
    );
    const [subscribersCount, setSubscribersCount] = useState(channel.subscriberCount);

    const handleSubscribe = async () => {
        const originalSubscribed = isSubscribed;
        const originalCount = subscribersCount;
        setIsSubscribed(!originalSubscribed);
        setSubscribersCount(
          originalSubscribed ? originalCount - 1 : originalCount + 1,
        );
        try {
          await toggleSubscription(channel.channel_id);
        } catch {
          setIsSubscribed(originalSubscribed);
          setSubscribersCount(originalCount);
        }
      };

    return (
      <div className="flex flex-col items-center gap-3 p-4 bg-zinc-900 rounded-2xl transition-colors text-center group">
        <Link
        to={`/channel/${channel.username}`}
        >
          {channel.avatar ? (
            <img
              src={channel.avatar}
              alt={channel.username}
              className="w-16 h-16 rounded-full object-cover hover:ring-2 ring-red-500/70 transition-all"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-white text-2xl font-bold">
              {channel.fullName?.[0]?.toUpperCase()}
            </div>
          )}
        </Link>
        <div className="min-w-0 w-full">
          <p className="text-white text-sm font-medium truncate">
            {channel.fullName}
          </p>
          <p className="text-zinc-500 text-xs">@{channel.username}</p>
          <p className="text-zinc-600 text-xs mt-0.5">
            {formatCount(subscribersCount || 0)} subscribers
          </p>
        </div>
        <button
          onClick={(e) => {
            handleSubscribe();
          }}
          className={`px-6 py-2.5 z-50 rounded-full text-sm font-medium transition-colors shrink-0
              ${
                isSubscribed
                  ? "bg-zinc-700 hover:bg-zinc-600 text-white"
                  : "bg-white hover:bg-zinc-200 text-black"
              }`}
        >
          {isSubscribed ? "Subscribed" : "Subscribe"}
        </button>
      </div>
    );
};

const SubscriptionsSkeleton = () => (
  <div className="max-w-screen-xl">
    <div className="h-8 bg-zinc-800 rounded w-48 mb-6 animate-pulse" />
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col items-center gap-3 p-4 bg-zinc-900 rounded-2xl animate-pulse"
        >
          <div className="w-16 h-16 rounded-full bg-zinc-800" />
          <div className="w-full flex flex-col gap-1.5 items-center">
            <div className="h-3 bg-zinc-800 rounded w-3/4" />
            <div className="h-3 bg-zinc-800 rounded w-1/2" />
            <div className="h-3 bg-zinc-800 rounded w-2/3" />
          </div>
          <div className="w-4/5  bg-zinc-800 mt-1 h-10 rounded-full" />
        </div>
      ))}
    </div>
  </div>
);

export default Subscriptions;