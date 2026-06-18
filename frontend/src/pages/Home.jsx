import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import VideoGrid from "../components/video/VideoGrid";
import { getAllVideos } from "../features/video/videoApi";
import { useDebounce } from "../hooks/useDebounce";

const LIMIT = 6;

const Home = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const debouncedQuery = useDebounce(searchQuery, 500);

  const sentinelRef = useRef(null);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isError,
  } = useInfiniteQuery({
    queryKey: ["videos", debouncedQuery],
    queryFn: ({ pageParam = 1 }) =>
      getAllVideos({ page: pageParam, limit: LIMIT, query: debouncedQuery }),
    getNextPageParam: (lastPage) => lastPage.data?.nextPage ?? undefined,
    staleTime: 1000 * 60 * 5,
  });

  const videos = data?.pages.flatMap((p) => p.data?.docs || []) ?? [];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 },
    );

    const sentinel = sentinelRef.current;
    if (sentinel) observer.observe(sentinel);
    return () => {
      if (sentinel) observer.unobserve(sentinel);
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div>
      {debouncedQuery ? (
        <h2 className="text-white text-lg font-medium mb-6">
          Results for <span className="text-red-400">"{debouncedQuery}"</span>
        </h2>
      ) : (
        <h2 className="text-white text-lg font-medium mb-6">Home</h2>
      )}

      {isError && (
        <div className="text-red-400 bg-red-400/10 px-4 py-3 rounded-lg mb-6 text-sm">
          Failed to load videos. Please try again.
        </div>
      )}

      <VideoGrid videos={videos} loading={isLoading} />

      <div ref={sentinelRef} className="h-1" />

      {isFetchingNextPage && (
        <div className="flex justify-center mt-6">
          <div className="w-6 h-6 border-2 border-zinc-500 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {!isLoading && !hasNextPage && videos.length > 0 && (
        <p className="text-center text-zinc-600 text-sm mt-10">
          You've seen all the videos
        </p>
      )}
    </div>
  );
};

export default Home;
