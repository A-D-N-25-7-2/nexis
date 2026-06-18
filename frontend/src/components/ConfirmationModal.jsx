import { useEffect } from 'react'
import { X } from "lucide-react";

const ConfirmationModal = ({isOpen, onClose, onConfirm, content , heading}) => {

     useEffect(() => {
        if (isOpen) {
          document.body.style.overflow = "hidden";
          return () => {
            document.body.style.overflow = "unset";
          };
        }
      }, [isOpen]);

      if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h1 className="text-lg font-semibold text-white">
            {heading}
          </h1>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-8">
          <p className="text-center text-zinc-400 leading-relaxed">
            {content}
          </p>

          <div className="flex gap-3 mt-8">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={onConfirm}
              className="flex-1 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal