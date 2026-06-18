// src/components/ui/EditButton.jsx
import { PencilIcon } from "@heroicons/react/24/outline";

function EditButton({ onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`relative w-[38px] h-[38px] rounded-full border border-zinc-700 flex items-center justify-center hover:bg-[#1a3a5c] hover:border-blue-500 hover:scale-110 active:scale-95 transition-all duration-200 group overflow-hidden ${className}`}
    >
      <PencilIcon className="w-4 h-4 text-zinc-400 group-hover:text-blue-300 group-hover:-rotate-12 transition-all duration-200" />
    </button>
  );
}

export default EditButton;
