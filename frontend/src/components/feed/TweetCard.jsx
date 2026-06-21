import { Link } from "react-router-dom";
import { useState } from "react";
import { formatDate } from "../../utils/formatDate";
import { formatCount } from "../../utils/formatCount";
import { toggleTweetLike } from "../../features/tweet/tweetApi";
import { useMutation } from "@tanstack/react-query";
import LikeButton from "../LikeButton";

const TweetCard = ({ tweet }) => {
  const { _id, content, createdAt, owner } = tweet;

  const [isLiked, setIsLiked] = useState(tweet.isLiked);
  const [likesCount, setLikesCount] = useState(tweet.likesCount ?? 0);

  const likeMutation = useMutation({
    mutationFn: () => toggleTweetLike(_id),
    onMutate: () => {
      setIsLiked((prev) => !prev);
      setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
    },
    onError: () => {
      // rollback
      setIsLiked((prev) => !prev);
      setLikesCount((prev) => (isLiked ? prev + 1 : prev - 1));
    },
  });

  return (
    <div className="bg-zinc-900 rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex gap-3">
        <Link to={`/channel/${owner?.username}`} className="shrink-0">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            {owner?.avatar ? (
              <img
                src={owner.avatar}
                alt={owner.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-red-600 flex items-center justify-center text-white font-bold">
                {owner?.fullName?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="mb-2">
            <Link
              to={`/channel/${owner?.username}`}
              className="text-white text-sm font-medium"
            >
              {owner?.fullName}
            </Link>
            <span className="text-zinc-500 text-xs ml-2">
              {formatDate(createdAt)}
            </span>
          </div>

          <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap line-clamp-4 mb-4">
            {content}
          </p>
          <div className="flex justify-end">
            <LikeButton
              element={{ ...tweet, isLiked, likesCount }}
              onLike={() => likeMutation.mutate()}
              formatCount={formatCount}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TweetCard;
