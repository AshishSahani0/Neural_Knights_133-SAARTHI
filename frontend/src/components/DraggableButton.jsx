import React, { useState, useRef, useEffect } from 'react';

export default function DraggableButton({ children, onClick, initialPosition = { x: 24, y: 24 } }) {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const buttonRef = useRef(null);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.current.x;
    const newY = e.clientY - dragStart.current.y;
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = (e) => {
    setIsDragging(false);
    // Only call onClick if the button was not dragged significantly
    if (Math.abs(e.clientX - dragStart.current.x - initialPosition.x) < 5 && Math.abs(e.clientY - dragStart.current.y - initialPosition.y) < 5) {
      onClick();
    }
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, position]); // Re-attach listeners when dragging state changes

  return (
    <div
      ref={buttonRef}
      className="fixed z-50 cursor-move"
      style={{ bottom: position.y, right: position.x }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
      onTouchMove={handleMouseMove}
      onTouchEnd={handleMouseUp}
    >
      {children}
    </div>
  );
}