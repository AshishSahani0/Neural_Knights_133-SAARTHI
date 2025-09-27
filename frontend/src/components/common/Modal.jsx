import { useEffect, useState } from "react";

export default function Modal({ isOpen, onClose, children, maxWidth = "max-w-lg" }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    let timer;
    if (isOpen) {
      setIsMounted(true);
    } else {
      // Delay unmounting for the exit animation
      timer = setTimeout(() => setIsMounted(false), 300);
    }
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Handle Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);
  
  if (!isMounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose} // Close on backdrop click
    >
      <div
        className={`w-full ${maxWidth} bg-white rounded-lg shadow-xl transform transition-all duration-300 ${
          isOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-10 scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        {children}
      </div>
    </div>
  );
}