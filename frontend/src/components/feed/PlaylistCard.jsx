import { Link } from "react-router-dom";
import { ListVideo } from "lucide-react";

const PlaylistCard = ({ playlist }) => {
  const { _id, name, description, thumbnail, totalVideos, owner } = playlist;

  return (
    <div className="group relative">
      <Link to={`/playlists/${_id}`}>
        <div className="relative">
          <div className="absolute border border-zinc-900 -top-1.5 left-1/2 -translate-x-1/2 w-[97%] h-full bg-zinc-600 rounded-xl z-2" />
          <div className="absolute border border-zinc-900 -top-3 left-1/2 -translate-x-1/2 w-[94%] h-full bg-zinc-700 rounded-xl z-1" />

          <div className="aspect-video border border-zinc-900 bg-zinc-800 relative overflow-hidden rounded-xl z-3">
            {thumbnail ? (
              <img
                src={thumbnail}
                alt={name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ListVideo size={32} className="text-zinc-600" />
              </div>
            )}
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1.5">
              <ListVideo size={14} />
              <span className="font-medium">{totalVideos || 0} videos</span>
            </div>
          </div>
        </div>

        <div className="pt-3 flex gap-2.5">
          {/* Owner avatar */}
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

          {/* Text */}
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{name}</p>
            <p className="text-zinc-400 text-xs mt-0.5">
              Playlist · {owner?.fullName}
            </p>
            {description && (
              <p className="text-zinc-500 text-xs mt-0.5 truncate">
                {description}
              </p>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default PlaylistCard;
