import React, { useState, useEffect, useRef } from 'react';

export default function DraggableCarousel() {
  const options = [
    {
      id: 1,
      title: "Breakfast Recipes",
      description: "Start your day with delicious morning meals",
      color: "bg-gradient-to-br from-orange-400 to-pink-400",
      icon: "🍳"
    },
    {
      id: 2,
      title: "Lunch Specials",
      description: "Quick and satisfying midday dishes",
      color: "bg-gradient-to-br from-green-400 to-blue-400",
      icon: "🥗"
    },
    {
      id: 3,
      title: "Dinner Favorites",
      description: "Hearty meals to end your day perfectly",
      color: "bg-gradient-to-br from-purple-400 to-indigo-400",
      icon: "🍽️"
    },
    {
      id: 4,
      title: "Sweet Desserts",
      description: "Indulgent treats for your sweet tooth",
      color: "bg-gradient-to-br from-pink-400 to-red-400",
      icon: "🍰"
    },
    {
      id: 5,
      title: "Healthy Options",
      description: "Nutritious recipes for a balanced lifestyle",
      color: "bg-gradient-to-br from-emerald-400 to-teal-400",
      icon: "🥬"
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentTranslateX, setCurrentTranslateX] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);

  const carouselRef = useRef(null);

  // Configuration for spacing and width
  const itemWidthPercent = 75; // Changed from 80% to 75%
  const offsetPercent = 12.5; // Changed from 10% to 12.5%

  // Auto-slide
  useEffect(() => {
    if (!isAutoPlay || isDragging) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === options.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoPlay, isDragging, options.length]);

  // Mouse events
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setStartX(e.clientX);
    setIsAutoPlay(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const diff = e.clientX - startX;
    setCurrentTranslateX(diff);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;

    const threshold = 80; // Reduced threshold for better responsiveness
    if (currentTranslateX > threshold) {
      setCurrentIndex((prevIndex) =>
        prevIndex === 0 ? options.length - 1 : prevIndex - 1
      );
    } else if (currentTranslateX < -threshold) {
      setCurrentIndex((prevIndex) =>
        prevIndex === options.length - 1 ? 0 : prevIndex + 1
      );
    }

    setIsDragging(false);
    setCurrentTranslateX(0);

    setTimeout(() => setIsAutoPlay(false), 2000);
  };

  // Touch events
  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setIsAutoPlay(false);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const diff = e.touches[0].clientX - startX;
    setCurrentTranslateX(diff);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    const threshold = 80; // Reduced threshold for better responsiveness
    if (currentTranslateX > threshold) {
      setCurrentIndex((prevIndex) =>
        prevIndex === 0 ? options.length - 1 : prevIndex - 1
      );
    } else if (currentTranslateX < -threshold) {
      setCurrentIndex((prevIndex) =>
        prevIndex === options.length - 1 ? 0 : prevIndex + 1
      );
    }

    setIsDragging(false);
    setCurrentTranslateX(0);

    setTimeout(() => setIsAutoPlay(false), 2000);
  };

  // Global drag listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, startX, currentTranslateX]);

  return (
    <div className="relative secondary-background w-full h-fit p-4 rounded-lg bg-gray-200 select-none overflow-hidden">
      <div
        ref={carouselRef}
        className="flex cursor-grab active:cursor-grabbing w-full transition-transform ease-out"
        style={{
          transform: `translateX(calc(-${currentIndex * itemWidthPercent}% + ${currentTranslateX}px + ${offsetPercent}%))`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {options.map((option, index) => (
          <div 
            key={option.id} 
            className={`flex-shrink-0 px-4 py-2 transition-all duration-300 flex items-center justify-center ${
              index === currentIndex 
                ? `w-[${itemWidthPercent}%] opacity-100 scale-100` 
                : `w-[${itemWidthPercent}%] opacity-60 scale-95`
            }`}
          >
            <div className={`${option.color} rounded-xl p-6 h-full aspect-square flex flex-col items-center justify-center text-white shadow-lg transition-all duration-300 ${
              index === currentIndex ? 'shadow-xl' : 'shadow-md'
            }`}>
              <div className={`mb-4 transition-all duration-300 ${
                index === currentIndex ? 'text-4xl' : 'text-3xl'
              }`}>
                {option.icon}
              </div>
              <h3 className={`font-bold mb-2 text-center transition-all duration-300 ${
                index === currentIndex ? 'text-xl' : 'text-lg'
              }`}>
                {option.title}
              </h3>
              <p className={`text-center text-white/90 leading-relaxed transition-all duration-300 ${
                index === currentIndex ? 'text-sm' : 'text-xs'
              }`}>
                {option.description}
              </p>
              {index === currentIndex && (
                <button className="mt-4 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium">
                  Explore Recipes
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {options.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? 'bg-white' : 'bg-white/50'
            }`}
            onClick={() => {
              setCurrentIndex(index);
              setIsAutoPlay(false);
              setTimeout(() => setIsAutoPlay(true), 2000);
            }}
          />
        ))}
      </div>

      {/* Drag hint */}
      {!isDragging && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            Drag to explore options
          </div>
        </div>
      )}
    </div>
  );
}