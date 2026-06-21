import VideoCard from "../video/VideoCard";
import TweetCard from "./TweetCard";
import PlaylistCard from "./PlaylistCard";

const HomeFeed = ({ pages, loading }) => {
  const items = (pages || []).flatMap((p) => p.message?.docs || []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3 animate-pulse">
            <div className="aspect-video bg-zinc-800 rounded-xl" />
            <div className="h-3 bg-zinc-800 rounded w-3/4" />
            <div className="h-3 bg-zinc-800 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 space-y-2 grid-flow-row-dense">
      {items.map((item) => {
        switch (item.type) {
          case "video":
            return <VideoCard key={item._id} video={item} />;
          case "playlist":
            return <PlaylistCard key={item._id} playlist={item} />;
          case "tweet":
            return (
              <div key={item._id} className="col-span-full">
                <TweetCard tweet={item} />
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
};

export default HomeFeed;
