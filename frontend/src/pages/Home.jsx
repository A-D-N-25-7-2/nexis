import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import HomeFeed from "../components/feed/HomeFeed";
import { getHomeFeed } from "../features/feed/feedApi";
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
    queryKey: ["homeFeed", debouncedQuery],
    queryFn: ({ pageParam = 1 }) =>
      getHomeFeed({ page: pageParam, limit: LIMIT, query: debouncedQuery }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.message?.nextPage ?? undefined,
    staleTime: 1000 * 60 * 5,
  });

  const hasItems = (data?.pages || []).some(
    (p) => (p.message?.docs || []).length > 0,
  );

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
          Failed to load your feed. Please try again.
        </div>
      )}

      <HomeFeed pages={data?.pages} loading={isLoading} />

      <div ref={sentinelRef} className="h-1" />

      {isFetchingNextPage && (
        <div className="flex justify-center mt-6">
          <div className="w-6 h-6 border-2 border-zinc-500 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {!isLoading && !hasNextPage && hasItems && (
        <p className="text-center text-zinc-600 text-sm mt-10">
          You've seen it all
        </p>
      )}
    </div>
  );
};

export default Home;