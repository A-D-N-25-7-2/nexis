// src/components/ui/DeleteButton.jsx
import { TrashIcon } from "@heroicons/react/24/outline";

function DeleteButton({ onClick, size=14 , className=""}) {
  return (
    <button
      onClick={onClick}
      className="relative w-[38px] h-[38px] rounded-full border border-zinc-700 bg-white/[0.07] flex items-center justify-center hover:bg-[#3d1212] hover:border-red-500 hover:scale-110 active:scale-95 transition-all duration-200 group overflow-hidden"
    >
      <TrashIcon
        className={` w-4 h-4 text-white group-hover:text-red-400 group-hover:rotate-6 group-hover:scale-110 transition-all duration-200`}
      />
    </button>
  );
}

export default DeleteButton;