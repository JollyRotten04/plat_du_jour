import React, {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
} from 'react';
import CarouselImage1 from '../../assets/carouselImage1.svg';
import CarouselImage2 from '../../assets/carouselImage2.svg';
import CarouselImage3 from '../../assets/carouselImage3.svg';
import QuoteIcon from '../../assets/quoteIcon.svg';

import CarnivoreDiet from '../../assets/diets/carnivore.svg';
import KetoDiet from '../../assets/diets/keto.svg';
import KosherDiet from '../../assets/diets/kosher.svg';
import MediterraneanDiet from '../../assets/diets/mediterranean.svg';
import PaleoDiet from '../../assets/diets/paleo.svg';
import VegetarianDiet from '../../assets/diets/vegetarian.svg';

const diets = [
  CarnivoreDiet,
  KetoDiet,
  KosherDiet,
  MediterraneanDiet,
  PaleoDiet,
  VegetarianDiet,
];

type CarouselProps = {
  currentPage: string;
};

export default function Carousel({ currentPage }: CarouselProps) {
  const images = [CarouselImage1, CarouselImage2, CarouselImage3];

  // Home View carousel
  const titleTexts = [
    "Plat Du Jour, Today's Special!",
    'Trusted by countless food-goers!',
    'Endless culinary delights!',
  ];
  const descriptionTexts = [
    'Explore hundreds of recipes from various categories. A myriad of flavors to satiate any craving',
    "Favorite recipe platform of users from all across the world, from various backgrounds. Anybody can find a recipe they'll be sure to like!",
    "Whether it be breakfast, lunch, dinner, dessert, or just a quick snack. You'll surely find a recipe to get your taste buds excited ",
  ];
  const [homeIndex, setHomeIndex] = useState(0);

  useEffect(() => {
    if (currentPage !== 'Home') return;
    const interval = setInterval(() => {
      setHomeIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [currentPage]);

  // Diets carousel
  const dietsContainerRef = useRef<HTMLDivElement>(null);
  const dietsSliderRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [actualContentWidth, setActualContentWidth] = useState(0);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragDeltaX, setDragDeltaX] = useState(0);
  const [position, setPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [transitionEnabled, setTransitionEnabled] = useState(false);

  const gapPx = 32;
  const slideCount = diets.length;

  // Get item width based on screen size
  const getItemWidth = () => {
    if (typeof window !== 'undefined') {
      const isPortrait = window.innerHeight > window.innerWidth;
      const isSmall = window.innerWidth < 640;
      
      if (isPortrait) return 350;
      if (isSmall) return 280;
      return 320;
    }
    return 320;
  };

  useLayoutEffect(() => {
    if (!dietsContainerRef.current || !dietsSliderRef.current) return;

    const updateMeasurements = () => {
      if (dietsContainerRef.current) {
        const newContainerWidth = dietsContainerRef.current.clientWidth;
        setContainerWidth(newContainerWidth);
      }
      
      if (dietsSliderRef.current) {
        // Force a reflow to ensure accurate measurements
        dietsSliderRef.current.offsetHeight;
        const newContentWidth = dietsSliderRef.current.scrollWidth;
        setActualContentWidth(newContentWidth);
      }
    };

    const observer = new ResizeObserver(() => {
      // Debounce the measurements
      setTimeout(updateMeasurements, 50);
    });

    if (dietsContainerRef.current) {
      observer.observe(dietsContainerRef.current);
    }
    
    // Initial measurement with multiple attempts
    updateMeasurements();
    setTimeout(updateMeasurements, 100);
    setTimeout(updateMeasurements, 300);
    
    return () => observer.disconnect();
  }, [currentPage]);

  // Calculate content width more reliably
  const itemWidth = getItemWidth();
  const calculatedContentWidth = slideCount * itemWidth + (slideCount - 1) * gapPx;
  
  // Use actual width if available and reasonable, otherwise use calculated
  const contentWidth = actualContentWidth > 0 && actualContentWidth > containerWidth 
    ? actualContentWidth 
    : calculatedContentWidth;
    
  // Adjust maxScrollDistance to ensure the last item is fully visible
  // We need to account for the last item being completely within the container
  const maxScrollDistance = Math.max(0, contentWidth - containerWidth);

  const clamp = (val: number, min: number, max: number) =>
    Math.min(Math.max(val, min), max);

  const handleDietDragStart = (clientX: number) => {
    setDragStartX(clientX);
    setIsDragging(true);
    setTransitionEnabled(false);
  };

  const handleDietDragMove = (clientX: number) => {
    if (dragStartX === null) return;
    const delta = clientX - dragStartX;
    setDragDeltaX(delta);
  };

  const handleDietDragEnd = () => {
    if (dragStartX === null) return;

    let newPosition = position + dragDeltaX;
    
    // Clamp to boundaries first
    newPosition = clamp(newPosition, -maxScrollDistance, 0);
    
    // Enhanced snapping logic
    const itemWidthWithGap = itemWidth + gapPx;
    const snapThreshold = itemWidthWithGap * 0.3; // 30% of item width
    
    // Calculate which item we should snap to
    const currentItemIndex = Math.abs(newPosition) / itemWidthWithGap;
    const shouldSnapToNext = (Math.abs(dragDeltaX) > snapThreshold && dragDeltaX < 0) || 
                            (currentItemIndex % 1 > 0.5);
    
    let targetIndex = shouldSnapToNext ? Math.ceil(currentItemIndex) : Math.floor(currentItemIndex);
    
    // Calculate max index based on ensuring last item is fully visible
    // The last item should be positioned so its right edge aligns with container's right edge
    const lastItemMaxPosition = contentWidth - itemWidth;
    const maxIndex = Math.floor(lastItemMaxPosition / itemWidthWithGap);
    
    // But also ensure we don't exceed the total scroll distance
    const absoluteMaxIndex = Math.floor(maxScrollDistance / itemWidthWithGap);
    const finalMaxIndex = Math.min(maxIndex, absoluteMaxIndex);
    
    targetIndex = Math.min(targetIndex, finalMaxIndex);
    
    let snappedPosition = -targetIndex * itemWidthWithGap;
    
    // Special case: if we're at the last possible position, align the last item properly
    if (targetIndex === finalMaxIndex) {
      snappedPosition = -maxScrollDistance;
    }
    
    // Final boundary check to ensure we don't overshoot
    snappedPosition = clamp(snappedPosition, -maxScrollDistance, 0);

    setPosition(snappedPosition);
    setDragStartX(null);
    setDragDeltaX(0);
    setIsDragging(false);
    setTransitionEnabled(true);
  };

  const minOffset = -maxScrollDistance;
  const maxOffset = 0;
  const clampedOffset = clamp(position + dragDeltaX, minOffset, maxOffset);

  return (
    <div className="flex flex-col gap-6 w-full h-full">
      {/* Home View */}
      {currentPage === 'Home' && (
        <div className="flex flex-col md:flex-row gap-6 w-full h-full">
          {/* Left */}
          <div className="flex flex-col gap-4 md:w-1/2">
            <p className="text-white font-semibold text-2xl">
              Trusted by 10+ million users
            </p>
            <div className="relative w-full h-72 md:h-96 rounded-lg bg-gray-200 overflow-hidden">
              {images.map((src, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    index === homeIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <img
                    draggable="false"
                    src={src}
                    alt={`Slide ${index + 1}`}
                    className="object-cover w-full h-full"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right */}
          <div className="relative flex flex-col gap-4 md:w-1/2 py-8">
            <img src={QuoteIcon} className="h-6 absolute top-0 left-0" alt="" />
            <p className="text-white font-semibold text-2xl">
              {titleTexts[homeIndex]}
            </p>
            <p className="text-white text-xl leading-relaxed">
              {descriptionTexts[homeIndex]}
            </p>
            <img
              src={QuoteIcon}
              className="h-6 absolute bottom-0 right-0 rotate-180"
              alt=""
            />
          </div>
        </div>
      )}

      {/* Recipes View */}
      {currentPage === 'Recipes' && (
        <div>
          <p className="text-white text-2xl">Recipes Page</p>
        </div>
      )}

      {/* Diets View */}
      {currentPage === 'Diets' && (
        <div
          ref={dietsContainerRef}
          className="relative w-full overflow-hidden touch-pan-x"
          onMouseDown={(e) => handleDietDragStart(e.clientX)}
          onMouseMove={(e) => isDragging && handleDietDragMove(e.clientX)}
          onMouseUp={handleDietDragEnd}
          onMouseLeave={handleDietDragEnd}
          onTouchStart={(e) => handleDietDragStart(e.touches[0].clientX)}
          onTouchMove={(e) => isDragging && handleDietDragMove(e.touches[0].clientX)}
          onTouchEnd={handleDietDragEnd}
          onDragStart={(e) => e.preventDefault()}
        >
          <div
            className="flex"
            ref={dietsSliderRef}
            style={{
              gap: `${gapPx}px`,
              transform: `translateX(${clampedOffset}px)`,
              transition: transitionEnabled ? 'transform 0.3s ease-out' : 'none',
              cursor: isDragging ? 'grabbing' : 'grab',
              width: 'fit-content',
            }}
          >
            {diets.map((src, index) => (
              <div
                key={index}
                className="
                  bg-white rounded-lg shadow p-4 text-center select-none cursor-pointer flex-shrink-0
                  min-h-[280px] min-w-[280px]
                  sm:min-h-[320px] sm:min-w-[320px]
                  portrait:min-h-[350px] portrait:min-w-[350px]
                  landscape:min-h-[240px] landscape:min-w-[240px]
                "
              >
                <img
                  src={src}
                  alt={`Diet ${index + 1}`}
                  draggable="false"
                  className="mx-auto mb-4 max-h-32 w-full object-contain"
                />
                <h2 className="text-xl font-semibold mb-2">Diet {index + 1}</h2>
                <p className="text-sm text-gray-600">This is the diet carousel item number {index + 1}.</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Articles View */}
      {currentPage === 'Articles' && (
        <div>
          <p className="text-white text-2xl">Articles Page</p>
        </div>
      )}
    </div>
  );
}