import { useRef } from "react";
import { ThumbsUp } from "lucide-react";

export default function LikeButton({ comment, onLike, formatCount }) {
  const iconRef = useRef(null);
  const ringRef = useRef(null);
  const partRef = useRef(null);

  const spawnParticles = () => {
    const el = partRef.current;
    el.innerHTML = "";
    const angles = [0, 45, 90, 135, 180, 225, 270, 315];
    angles.forEach((a) => {
      const s = document.createElement("span");
      const rad = (a * Math.PI) / 180;
      const d = 14 + Math.random() * 10;
      s.style.setProperty("--dx", Math.cos(rad) * d + "px");
      s.style.setProperty("--dy", Math.sin(rad) * d + "px");
      s.style.animationDelay = Math.random() * 0.06 + "s";
      el.appendChild(s);
    });
    el.classList.remove("like-particles-fire");
    void el.offsetWidth;
    el.classList.add("like-particles-fire");
    setTimeout(() => el.classList.remove("like-particles-fire"), 600);
  };

  const handleClick = () => {
    const icon = iconRef.current;
    const ring = ringRef.current;

    icon.classList.remove("like-pop");
    void icon.offsetWidth;
    icon.classList.add("like-pop");
    setTimeout(() => icon.classList.remove("like-pop"), 450);

    if (!comment.isLiked) {
      ring.classList.remove("like-ring-fire");
      void ring.offsetWidth;
      ring.classList.add("like-ring-fire");
      setTimeout(() => ring.classList.remove("like-ring-fire"), 500);
      spawnParticles();
    }

    onLike(comment._id);
  };

  return (
    <button
      onClick={handleClick}
      className={`group relative flex items-center gap-1.5 px-2.5 py-2.5 rounded-full text-xs font-medium
        border transition-all duration-200 select-none cursor-pointer
        ${
          comment.isLiked
            ? "text-red-400 border-red-400/40 bg-red-400/10 hover:bg-red-400/15"
            : "text-zinc-500 border-zinc-700 hover:border-white hover:scale-105 hover:text-zinc-300 hover:bg-white/[0.07]"
        }`}
    >
      <div ref={ringRef} className="like-ring" />
      <div ref={partRef} className="like-particles" />

      <ThumbsUp
        ref={iconRef}
        size={17}
        className={`transition-all duration-200 group-hover:-rotate-12 ${
          comment.isLiked ? "fill-red-400 stroke-red-400" : "stroke-current"
        }`}
      />

      {comment.likesCount > 0 && (
        <span className="tabular-nums like-count">
          {formatCount(comment.likesCount)}
        </span>
      )}
    </button>
  );
}
