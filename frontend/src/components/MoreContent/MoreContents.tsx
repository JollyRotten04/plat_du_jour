import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DraggableCarousel() {
  type Recipe = {
    recipe_id: number;
    recipe_name: string;
    recipe_description: string;
    recipe_author: string;
    recipe_category: string;
    recipe_type: string;
    recipe_calories: number | null;
    recipe_cooktime: string;
    recipe_rating: string;
    recipe_review_count: number;
    recipe_ingredients: string;
    recipe_slug: string;
    image_path: string;
    nutritional_value: {
      fat: string;
      carbs: string;
      fiber: string;
      protein: string;
    };
    steps: string[];
  };

  type ApiResponse = {
    success: boolean;
    data: Recipe[];
    message?: string;
  };

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe] = useState<Recipe | null>(null);

  const fetchRecipes = async () => {
    try {
      const url = `http://localhost/api/recipes/load`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data: ApiResponse = await response.json();
      if (data.success) {
        setRecipes(data.data);
      } else {
        throw new Error(data.message || 'Failed to load recipes');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Error fetching recipes:', message);
    }
  };

  useEffect(() => {
    fetchRecipes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Drag state
  const containerRef = useRef(null);
  const sliderRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [actualContentWidth, setActualContentWidth] = useState(0);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragDeltaX, setDragDeltaX] = useState(0);
  const [position, setPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [transitionEnabled, setTransitionEnabled] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);

  const gapPx = 32;
  const slideCount = recipes.length;
  const dragThreshold = 5;

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

  const itemWidth = getItemWidth();
  const calculatedContentWidth = slideCount * itemWidth + (slideCount - 1) * gapPx;

  const contentWidth =
    actualContentWidth > 0 && actualContentWidth > containerWidth
      ? actualContentWidth
      : calculatedContentWidth;

  const maxScrollDistance = Math.max(0, contentWidth - containerWidth);

  const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

  const handleDragStart = (clientX: number) => {
    setDragStartX(clientX);
    setIsDragging(true);
    setTransitionEnabled(false);
    setHasDragged(false);
  };

  const handleDragMove = (clientX: number) => {
    if (dragStartX === null) return;
    const deltaX = clientX - dragStartX;
    setDragDeltaX(deltaX);
    if (Math.abs(deltaX) > dragThreshold) setHasDragged(true);
  };

  const handleDragEnd = () => {
    if (dragStartX === null) return;

    let newPosition = position + dragDeltaX;
    newPosition = clamp(newPosition, -maxScrollDistance, 0);

    const itemWidthWithGap = itemWidth + gapPx;
    const snapThreshold = itemWidthWithGap * 0.3;
    const currentItemIndex = Math.abs(newPosition) / itemWidthWithGap;
    const shouldSnapToNext =
      (Math.abs(dragDeltaX) > snapThreshold && dragDeltaX < 0) || currentItemIndex % 1 > 0.5;

    let targetIndex = shouldSnapToNext
      ? Math.ceil(currentItemIndex)
      : Math.floor(currentItemIndex);

    const lastItemMaxPosition = contentWidth - itemWidth;
    const maxIndex = Math.floor(lastItemMaxPosition / itemWidthWithGap);
    const absoluteMaxIndex = Math.floor(maxScrollDistance / itemWidthWithGap);
    const finalMaxIndex = Math.min(maxIndex, absoluteMaxIndex);

    targetIndex = Math.min(targetIndex, finalMaxIndex);

    let snappedPosition = -targetIndex * itemWidthWithGap;
    if (targetIndex === finalMaxIndex) snappedPosition = -maxScrollDistance;

    setPosition(clamp(snappedPosition, -maxScrollDistance, 0));
    setDragStartX(null);
    setDragDeltaX(0);
    setIsDragging(false);
    setTransitionEnabled(true);
  };

  useLayoutEffect(() => {
    if (!containerRef.current || !sliderRef.current) return;

    const updateMeasurements = () => {
      if (containerRef.current) {
        setContainerWidth((containerRef.current as HTMLElement).clientWidth);
      }

      if (sliderRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        (sliderRef.current as HTMLElement).offsetHeight;
        setActualContentWidth((sliderRef.current as HTMLElement).scrollWidth);
      }
    };

    const observer = new ResizeObserver(() => {
      setTimeout(updateMeasurements, 50);
    });

    if (containerRef.current) observer.observe(containerRef.current);
    updateMeasurements();
    setTimeout(updateMeasurements, 100);
    setTimeout(updateMeasurements, 300);

    return () => observer.disconnect();
  }, []);

  const clampedOffset = clamp(position + dragDeltaX, -maxScrollDistance, 0);

  // For navigating to View Content Page with Article Slug
  const navigate = useNavigate();

  // Logic to switch to View Contents Page...
  const viewContent = (
    contentType: 'recipes' | 'articles',
    slug: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any
  ) => {
    console.log('Data from Carousel:', data);
    navigate(`/view-content/${contentType}/${slug}`, { state: { data } });
  };

  const formatReviewCount = (count: number) => {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
};


  return (
    <div className="w-full p-6 bg-gray-100 overflow-hidden shadow-lg rounded-xl h-fit relative">
      {/* Header */}
      <div className="mb-6 flex items-center">

        <div className='w-full bg-black h-0.5'></div>

        <h2 className="text-3xl text-black font-semibold mb-2 select-none text-nowrap px-4">Recipes To Inspire</h2>

        <div className='w-full bg-black h-0.5'></div>
        
      </div>

      <hr className="text-black h-px mb-6" />

        <div
          ref={containerRef}
          className="relative w-full h-fit overflow-y-visible touch-pan-x"
          onMouseDown={(e) => handleDragStart(e.clientX)}
          onMouseMove={(e) => isDragging && handleDragMove(e.clientX)}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
          onTouchMove={(e) => isDragging && handleDragMove(e.touches[0].clientX)}
          onTouchEnd={handleDragEnd}
          onDragStart={(e) => e.preventDefault()}
        >
          <div
            ref={sliderRef}
            className="flex"
            draggable='false'
            style={{
              gap: `${gapPx}px`,
              transform: `translateX(${clampedOffset}px)`,
              transition: transitionEnabled ? 'transform 0.3s ease-out' : 'none',
              cursor: isDragging ? 'grabbing' : 'grab',
              width: 'fit-content',
            }}
          >
            {recipes.map((recipe) => (
              <div
                draggable='false'
                key={recipe.recipe_id}
                className="relative rounded-lg bg-white shadow-lg flex-shrink-0 transition-transform duration-200 hover:scale-105"
                onClick={(e) => {
                  if (hasDragged) {
                    e.preventDefault(); // Prevent accidental navigation
                    return; // Don't trigger navigation
                  }
                  viewContent('recipes', recipe.recipe_slug, recipe);
                }}
                style={{
                  width: itemWidth,
                  minHeight: '280px',
                  cursor: 'pointer',
                }}
              >
                <img
                  // eslint-disable-next-line no-constant-binary-expression
                  src={`/recipes/${recipe.image_path}` || '/placeholder.png'}
                  alt={recipe.recipe_name}
                  className="rounded-t-lg select-none object-cover w-full h-40"
                  draggable={false}
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold select-none">{recipe.recipe_name}</h3>
                  <p className="text-sm text-gray-700 line-clamp-3 select-none">
                    {recipe.recipe_description}
                  </p>
                </div>
                <div className="absolute bottom-2 left-2 text-sm text-gray-600 bg-white bg-opacity-80 rounded px-2 py-1 flex items-center gap-1">
                  <svg
                    className="w-4 h-4 fill-current text-yellow-500"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.49 6.91l6.572-.955L10 0l2.938 5.955 6.572.955-4.755 4.635 1.123 6.545z" />
                  </svg>
                  <span className='select-none'>{recipe.recipe_rating}</span>
                  <span className="ml-2 text-gray-500 select-none">({formatReviewCount(recipe.recipe_review_count)})</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      {!isDragging && !selectedRecipe && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none mt-20">
          <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            Drag to explore recipes
          </div>
        </div>
      )}
    </div>
  );
}
