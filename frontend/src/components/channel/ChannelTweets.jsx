import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getChannelTweets } from "../../features/channel/channelApi";
import {
  createTweet,
  updateTweet,
  deleteTweet,
  toggleTweetLike,
} from "../../features/tweet/tweetApi";
import { formatDate } from "../../utils/formatDate";
import { formatCount } from "../../utils/formatCount";
import { ThumbsUp, Pencil, Trash2, Send } from "lucide-react";
import DeleteButton from "../DeleteButton";
import EditButton from "../EditButton";
import LikeButton from "../LikeButton";
import toast from "react-hot-toast";

const ChannelTweets = ({ channelId, isOwner, currentUser, channel }) => {
  const queryClient = useQueryClient();
  const [newTweet, setNewTweet] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["channelTweets", channelId],
    queryFn: () => getChannelTweets(channelId),
    staleTime: 1000 * 60 * 5,
    enabled: !!channelId,
  });

  const tweets = data?.data?.docs || [];

  const createMutation = useMutation({
    mutationFn: createTweet,
    onSuccess: () => {
      queryClient.invalidateQueries(["channelTweets", channelId]);
      setNewTweet("");
      toast.success("Tweet posted.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateTweet,
    onSuccess: () => {
      queryClient.invalidateQueries(["channelTweets", channelId]);
      setEditingId(null);
      toast.success("Tweet updated.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTweet,
    onSuccess: () => {
      queryClient.invalidateQueries(["channelTweets", channelId]);
      toast.success("Tweet deleted.");
    },
  });

  const likeMutation = useMutation({
    mutationFn: toggleTweetLike,
    onMutate: async (tweetId) => {
      await queryClient.cancelQueries(["channelTweets", channelId]);
      const previous = queryClient.getQueryData(["channelTweets", channelId]);
      queryClient.setQueryData(["channelTweets", channelId], (old) => ({
        ...old,
        data: {
          ...old.data,
          docs: old.data.docs.map((t) =>
            t._id === tweetId
              ? {
                  ...t,
                  isLiked: !t.isLiked,
                  likesCount: t.isLiked ? t.likesCount - 1 : t.likesCount + 1,
                }
              : t,
          ),
        },
      }));
      return { previous };
    },
    onError: (err, tweetId, context) => {
      queryClient.setQueryData(["channelTweets", channelId], context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["channelTweets", channelId]);
    },
  });

  return (
    <div className="max-w-2xl mx-auto">
      {/* Create tweet — owner only */}
      {isOwner && (
        <div className="flex gap-3 mb-8">
          <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-red-600 flex items-center justify-center text-white font-bold">
                {currentUser?.fullName?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <textarea
              value={newTweet}
              onChange={(e) => setNewTweet(e.target.value)}
              placeholder="What's on your mind?"
              rows={3}
              className="w-full bg-zinc-900 border border-zinc-700 focus:border-zinc-500 text-white rounded-xl px-4 py-3 text-sm outline-none transition-colors placeholder:text-zinc-600 resize-none"
            />
            {newTweet && (
              <div className="flex justify-end">
                <button
                  onClick={() => createMutation.mutate(newTweet.trim())}
                  disabled={createMutation.isPending}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-full transition-colors"
                >
                  <Send size={14} />
                  {createMutation.isPending ? "Posting..." : "Tweet"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tweets list */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-zinc-900 rounded-2xl p-5 animate-pulse">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-800 shrink-0" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-3 bg-zinc-800 rounded w-32" />
                  <div className="h-3 bg-zinc-800 rounded w-full" />
                  <div className="h-3 bg-zinc-800 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : tweets.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-zinc-400 font-medium">No tweets yet</p>
          {isOwner && (
            <p className="text-zinc-600 text-sm mt-1">
              Share what's on your mind
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {tweets.map((tweet) => (
            <div key={tweet._id} className="bg-zinc-900 rounded-2xl p-5">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                  {tweet.owner?.avatar ? (
                    <img
                      src={tweet.owner.avatar}
                      alt={tweet.owner.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-red-600 flex items-center justify-center text-white font-bold">
                      {tweet.owner?.fullName?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div>
                      <span className="text-white text-sm font-medium">
                        {tweet.owner?.fullName}
                      </span>
                      <span className="text-zinc-500 text-xs ml-2">
                        {formatDate(tweet.createdAt)}
                      </span>
                    </div>

                    {/* Edit/Delete — owner only */}
                    {isOwner && (
                      <div className="flex items-center gap-3 shrink-0">
                        <EditButton
                          onClick={() => {
                            setEditingId(tweet._id);
                            setEditContent(tweet.content);
                          }}
                        />
                        <DeleteButton
                          onClick={() => deleteMutation.mutate(tweet._id)}
                          disabled={deleteMutation.isPending}
                        />
                      </div>
                    )}
                  </div>

                  {editingId === tweet._id ? (
                    <div className="flex flex-col gap-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={3}
                        className="w-full bg-zinc-800 border border-zinc-700 focus:border-zinc-500 text-white rounded-xl px-3 py-2 text-sm outline-none resize-none"
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-zinc-400 hover:text-white text-xs px-3 py-1.5 rounded-full"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() =>
                            updateMutation.mutate({
                              tweetId: editingId,
                              content: editContent.trim(),
                            })
                          }
                          disabled={updateMutation.isPending}
                          className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded-full"
                        >
                          {updateMutation.isPending ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap mb-4">
                      {tweet.content}
                    </p>
                  )}

                  <LikeButton
                    element={tweet}
                    onLike={(id) => likeMutation.mutate(id)}
                    formatCount={formatCount}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChannelTweets;
