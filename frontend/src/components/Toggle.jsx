// src/components/ui/Toggle.jsx
import { useState } from "react";

function Toggle({ className = "", defaultOn = false, onChange }) {
  const [on, setOn] = useState(defaultOn);

  const handleClick = () => {
    setOn(!on);
    onChange?.(!on);
  };

  return (
    <button
      onClick={handleClick}
      className={`relative w-12 h-6 rounded-full  transition-colors duration-200 ${
        on ? "bg-green-500" : "bg-zinc-600"
      } ${className}`}
    >
      <span
        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${
          on ? "left-7" : "left-1"
        }`}
      />
    </button>
  );
}

export default Toggle;
