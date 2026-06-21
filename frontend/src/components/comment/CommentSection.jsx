import { useState, useEffect } from "react";
import {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
  toggleCommentLike,
} from "../../features/comment/commentApi";
import { formatDate } from "../../utils/formatDate";
import { formatCount } from "../../utils/formatCount";
import { ThumbsUp } from "lucide-react";
import EditButton from "../EditButton";
import DeleteButton from "../DeleteButton"
import LikeButton from "../LikeButton"

const CommentSection = ({ videoId, currentUser }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [popping, setPopping] = useState(false);

  useEffect(() => {
    fetchComments(1, true);
  }, [videoId]);

  const fetchComments = async (pageNum = 1, reset = false) => {
    try {
      setLoading(pageNum === 1);
      const res = await getVideoComments(videoId, pageNum);
      // getVideoComments returns response.data → { statusCode, message, data }
      // data contains { docs, totalPages, ... }
      const fetched = res.data?.docs || [];
      const totalPages = res.data?.totalPages || 1;
      setComments((prev) => (reset ? fetched : [...prev, ...fetched]));
      setHasMore(pageNum < totalPages);
      setPage(pageNum);
    } catch (err) {
      console.log("fetch comments error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      setSubmitting(true);
      const res = await addComment(videoId, newComment.trim());
      const created = res.data;

      const commentWithOwner = {
        ...created,
        owner: {
          _id: currentUser._id,
          fullName: currentUser.fullName,
          username: currentUser.username,
          avatar: currentUser.avatar,
        },
        likesCount: 0,
        isLiked: false,
      };


      setComments((prev) => [commentWithOwner, ...prev]);
      setNewComment("");
    } catch (err) {
      console.log("add comment error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (commentId) => {
    if (!editContent.trim()) return;
    try {
      await updateComment(commentId, editContent.trim());
      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId ? { ...c, content: editContent.trim() } : c,
        ),
      );
      setEditingId(null);
    } catch (err) {
      console.log("update comment error:", err);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      console.log("delete comment error:", err);
    }
  };

  const handleLikeComment = async (commentId) => {
    setPopping(true);
    setTimeout(() => setPopping(false), 400);
    const original = comments.find((c) => c._id === commentId);
    setComments((prev) =>
      prev.map((c) =>
        c._id === commentId
          ? {
              ...c,
              isLiked: !c.isLiked,
              likesCount: c.isLiked ? c.likesCount - 1 : c.likesCount + 1,
            }
          : c,
      ),
    );
    try {
      await toggleCommentLike(commentId);
    } catch {
      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId
            ? {
                ...c,
                isLiked: original.isLiked,
                likesCount: original.likesCount,
              }
            : c,
        ),
      );
    }
  };

  return (
    <div>
      <h3 className="text-white font-semibold text-lg mb-4">Comments</h3>

      {/* Add comment */}
      <div className="flex gap-3 mb-6">
        <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
          {currentUser?.avatar ? (
            <img
              src={currentUser.avatar}
              alt={currentUser.username}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-red-600 flex items-center justify-center text-white text-sm font-bold">
              {currentUser?.fullName?.[0]?.toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
            placeholder="Add a comment..."
            className="w-full bg-transparent border-b border-zinc-700 focus:border-white text-white text-sm py-2 outline-none transition-colors placeholder:text-zinc-600"
          />
          {newComment && (
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setNewComment("")}
                className="text-zinc-400 hover:text-white text-sm px-4 py-1.5 rounded-full transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddComment}
                disabled={submitting}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm px-4 py-1.5 rounded-full transition-colors"
              >
                {submitting ? "Posting..." : "Comment"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Comment list */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-9 h-9 rounded-full bg-zinc-800 shrink-0" />
              <div className="flex-1 flex flex-col gap-2">
                <div className="h-3 bg-zinc-800 rounded w-32" />
                <div className="h-3 bg-zinc-800 rounded w-full" />
                <div className="h-3 bg-zinc-800 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-zinc-500 text-sm">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-5">
          {comments.map((comment) => (
            <div key={comment._id} className="flex gap-3">
              <div className="shrink-0">
                {comment.owner?.avatar ? (
                  <img
                    src={comment.owner.avatar}
                    alt={comment.owner.username}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center text-white text-sm font-bold">
                    {comment.owner?.fullName?.toUpperCase()}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white text-sm font-medium">
                    {comment.owner?.fullName}
                  </span>
                  <span className="text-zinc-500 text-xs">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>

                {editingId === comment._id ? (
                  <div className="flex flex-col gap-2">
                    <input
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full bg-transparent border-b border-zinc-700 focus:border-white text-white text-sm py-1 outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-zinc-400 hover:text-white text-xs px-3 py-1 rounded-full"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdate(comment._id)}
                        className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded-full"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-zinc-300 text-sm leading-relaxed">
                    {comment.content}
                  </p>
                )}

                <div className="flex items-center gap-3 mt-4">
                  <LikeButton
                    element={comment}
                    onLike={handleLikeComment}
                    formatCount={formatCount}
                  />
                  {comment.owner?._id === currentUser?._id && (
                    <>
                      <EditButton
                        onClick={() => {
                          if (editingId === comment._id) {
                            setEditingId(null);
                            setEditContent("");
                          } else {
                            setEditingId(comment._id);
                            setEditContent(comment.content);
                          }
                        }}
                        className="text-zinc-500 hover:text-white transition-colors"
                      />
                      <DeleteButton
                        onClick={() => handleDelete(comment._id)}
                        className="text-zinc-500 hover:text-red-400 transition-colors"
                        size={8}
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          {hasMore && (
            <button
              onClick={() => fetchComments(page + 1)}
              className="text-zinc-400 hover:text-white text-sm transition-colors"
            >
              Load more comments
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
