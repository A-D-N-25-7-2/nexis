import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWatchHistory, clearWatchHistory } from "../features/video/videoApi";
import VideoGrid from "../components/video/VideoGrid";
import { History as HistoryIcon, Trash2 } from "lucide-react";
import { TrashIcon } from "@heroicons/react/24/outline";
import ConfirmationModal from "../components/ConfirmationModal";
import { useState } from "react";
import toast from "react-hot-toast";

const History = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["watchHistory"],
    queryFn: getWatchHistory,
    staleTime: 1000 * 60 * 5,
  });

  const clearMutation = useMutation({
    mutationFn: clearWatchHistory,
    onSuccess: () => {
      queryClient.invalidateQueries(["watchHistory"]);
      toast.success("Watch history cleared.")
    },
  });

  const videos = data?.data || [];

  const handleClear = () => {
    clearMutation.mutate();

    setIsOpen(false);
  };

  if (isError)
    return (
      <div className="text-red-400 bg-red-400/10 px-4 py-3 rounded-lg">
        Failed to load watch history.
      </div>
    );

  return (
    <div className="max-w-screen-xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-white text-2xl font-bold">Watch History</h1>
        {videos.length > 0 && (
          <button
            onClick={() => {
              setIsOpen(true);
            }}
            disabled={clearMutation.isPending}
            className="relative gap-2 p-2 rounded-full border border-zinc-700 flex items-center justify-center hover:bg-[#3d1212] hover:border-red-500 hover:scale-110 active:scale-95 transition-all duration-200 group overflow-hidden"
          >
            <TrashIcon className="w-4 h-4 text-zinc-400 group-hover:text-red-400 group-hover:rotate-6 group-hover:scale-110 transition-all duration-200" />
            <span className="text-sm text-zinc-400 group-hover:text-red-400">
              {clearMutation.isPending ? "Clearing..." : "Clear history"}
            </span>
          </button>
        )}
      </div>

      {!isLoading && videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <HistoryIcon size={48} className="text-zinc-700" />
          <p className="text-zinc-400 font-medium">No watch history</p>
          <p className="text-zinc-600 text-sm">
            Videos you watch will appear here
          </p>
        </div>
      ) : (
        <VideoGrid videos={videos} loading={isLoading} />
      )}
      <ConfirmationModal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
        onConfirm={handleClear}
        heading="Clear Watch History"
        content="Are you sure you want to clear your entire watch history? This
            action cannot be undone."
      />
    </div>
  );
};

export default History;
