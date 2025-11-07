import { useEffect, useState } from "react";

export default function AnimatedCharacter() {
  const [isJumping, setIsJumping] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsJumping(true);
      setTimeout(() => setIsJumping(false), 600);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-20 h-20 mx-auto">
      {/* Character */}
      <div
        className={`absolute inset-0 transition-transform duration-500 ${
          isJumping ? "-translate-y-8" : ""
        }`}
        style={{
          transitionTimingFunction: isJumping
            ? "cubic-bezier(0.33, 1, 0.68, 1)"
            : "cubic-bezier(0.32, 0, 0.67, 0)",
        }}
      >
        {/* Head */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full border-2 border-yellow-300 shadow-lg">
          {/* Eyes */}
          <div className="absolute top-2 left-1.5 w-1.5 h-1.5 bg-gray-800 rounded-full"></div>
          <div className="absolute top-2 right-1.5 w-1.5 h-1.5 bg-gray-800 rounded-full"></div>
          {/* Smile */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-1.5 border-b-2 border-gray-800 rounded-full"></div>
        </div>

        {/* Body */}
        <div className="absolute top-7 left-1/2 -translate-x-1/2 w-6 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg border-2 border-cyan-400 shadow-lg"></div>

        {/* Arms */}
        <div
          className={`absolute top-8 left-2 w-4 h-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full border border-cyan-400 origin-right transition-transform ${
            isJumping ? "rotate-45" : "rotate-12"
          }`}
        ></div>
        <div
          className={`absolute top-8 right-2 w-4 h-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full border border-cyan-400 origin-left transition-transform ${
            isJumping ? "-rotate-45" : "-rotate-12"
          }`}
        ></div>

        {/* Legs */}
        <div
          className={`absolute top-14 left-4 w-1.5 h-5 bg-gradient-to-b from-purple-500 to-purple-700 rounded-full border border-purple-400 origin-top transition-transform ${
            isJumping ? "rotate-20" : "rotate-0"
          }`}
        ></div>
        <div
          className={`absolute top-14 right-4 w-1.5 h-5 bg-gradient-to-b from-purple-500 to-purple-700 rounded-full border border-purple-400 origin-top transition-transform ${
            isJumping ? "-rotate-20" : "rotate-0"
          }`}
        ></div>
      </div>

      {/* Shadow */}
      <div
        className={`absolute bottom-0 left-1/2 -translate-x-1/2 bg-black/30 rounded-full transition-all duration-500 ${
          isJumping ? "w-8 h-2" : "w-12 h-3"
        }`}
      ></div>
    </div>
  );
}
