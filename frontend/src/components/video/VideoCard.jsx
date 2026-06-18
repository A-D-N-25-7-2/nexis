import { Link } from "react-router-dom";
import { formatDuration } from "../../utils/formatDuration.js";
import { formatCount } from "../../utils/formatCount.js";
import { formatDate } from "../../utils/formatDate.js";

const VideoCard = ({ video, showAvatar = true, showName= true }) => {
  const { _id, title, thumbnail, duration, views, createdAt, owner } = video;

  return (
    <Link to={`/watch/${_id}`} className="group flex flex-col gap-4">
      {/* Thumbnail */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-zinc-800">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-medium">
          {formatDuration(duration)}
        </span>
      </div>

      {/* Info */}
      <div className="flex gap-3">
        {/* Channel avatar */}
        {showAvatar && 
        <div className="shrink-0 mt-0.5">
          {owner?.avatar ? (
            <img
              src={owner.avatar}
              alt={owner.username}
              className="w-9 h-9 rounded-full object-cover"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center text-white text-sm font-bold">
              {owner?.fullName?.[0]?.toUpperCase() || "U"}
            </div>
          )}
        </div>
}

        {/* Text */}
        <div className="flex flex-col gap-0.5 min-w-0">
          <p className="text-white text-sm font-medium leading-snug line-clamp-2">
            {title}
          </p>
          {showName &&
          <p className="text-zinc-400 text-xs hover:text-white transition-colors">
            {owner?.fullName || owner?.username}
          </p>
}
          <p className="text-zinc-500 text-xs">
            {formatCount(views)} views · {formatDate(createdAt)}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;
