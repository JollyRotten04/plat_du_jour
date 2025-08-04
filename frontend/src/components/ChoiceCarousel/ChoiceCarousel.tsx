import React, {
  useState,
  useRef,
  useLayoutEffect,
  useEffect,
} from 'react';

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

type DataProps = {
  currentPage: string;
};

export default function ChoiceCarousel({ currentPage }: DataProps) {
  const [selectedDiet, setSelectedDiet] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleDietClick = (dietName: string) => {
    console.log(`Diet already selected. You clicked again on: ${dietName}`);
    // Optional: re-fetch, show info, etc.
  };

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Selected diet:', selectedDiet);

      const params = new URLSearchParams();
      if (selectedDiet) {
        params.append('diet', selectedDiet);
      }

      const url = `http://localhost/api/recipes/load?${params.toString()}`;
      console.log('Fetch URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      if (data.success) {
        setRecipes(data.data);
      } else {
        throw new Error(data.message || 'Failed to load recipes');
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'An unknown error occurred';
      setError(message);
      console.error('Error fetching recipes:', message);
    } finally {
      setLoading(false);
    }
  };

  // If Selected Diet Changes, Call the function...
  useEffect(() => {
    fetchRecipes();
  }, [selectedDiet]);

  useEffect(() => {
    console.log(recipes);
  }, [recipes]);

  const dietsText = [
    'Carnivore',
    'Keto',
    'Kosher',
    'Mediterranean',
    'Paleo',
    'Vegetarian',
  ];

  // Diets carousel refs & state for drag
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
        setContainerWidth(dietsContainerRef.current.clientWidth);
      }

      if (dietsSliderRef.current) {
        dietsSliderRef.current.offsetHeight;
        setActualContentWidth(dietsSliderRef.current.scrollWidth);
      }
    };

    const observer = new ResizeObserver(() => {
      setTimeout(updateMeasurements, 50);
    });

    if (dietsContainerRef.current) {
      observer.observe(dietsContainerRef.current);
    }

    updateMeasurements();
    setTimeout(updateMeasurements, 100);
    setTimeout(updateMeasurements, 300);

    return () => observer.disconnect();
  }, [currentPage]);

  const itemWidth = getItemWidth();
  const calculatedContentWidth =
    slideCount * itemWidth + (slideCount - 1) * gapPx;

  const contentWidth =
    actualContentWidth > 0 && actualContentWidth > containerWidth
      ? actualContentWidth
      : calculatedContentWidth;

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
    setDragDeltaX(clientX - dragStartX);
  };

  const handleDietDragEnd = () => {
    if (dragStartX === null) return;

    let newPosition = position + dragDeltaX;
    newPosition = clamp(newPosition, -maxScrollDistance, 0);

    const itemWidthWithGap = itemWidth + gapPx;
    const snapThreshold = itemWidthWithGap * 0.3;

    const currentItemIndex = Math.abs(newPosition) / itemWidthWithGap;
    const shouldSnapToNext =
      (Math.abs(dragDeltaX) > snapThreshold && dragDeltaX < 0) ||
      currentItemIndex % 1 > 0.5;

    let targetIndex = shouldSnapToNext
      ? Math.ceil(currentItemIndex)
      : Math.floor(currentItemIndex);

    const lastItemMaxPosition = contentWidth - itemWidth;
    const maxIndex = Math.floor(lastItemMaxPosition / itemWidthWithGap);
    const absoluteMaxIndex = Math.floor(maxScrollDistance / itemWidthWithGap);
    const finalMaxIndex = Math.min(maxIndex, absoluteMaxIndex);

    targetIndex = Math.min(targetIndex, finalMaxIndex);

    let snappedPosition = -targetIndex * itemWidthWithGap;
    if (targetIndex === finalMaxIndex) {
      snappedPosition = -maxScrollDistance;
    }

    snappedPosition = clamp(snappedPosition, -maxScrollDistance, 0);

    setPosition(snappedPosition);
    setDragStartX(null);
    setDragDeltaX(0);
    setIsDragging(false);
    setTransitionEnabled(true);
  };

  const clampedOffset = clamp(position + dragDeltaX, -maxScrollDistance, 0);

  // --- Recipes container drag logic ---

  const recipesContainerRef = useRef<HTMLDivElement>(null);
  const recipesSliderRef = useRef<HTMLDivElement>(null);

  const [recipesContainerWidth, setRecipesContainerWidth] = useState(0);
  const [recipesContentWidth, setRecipesContentWidth] = useState(0);
  const [recipesDragStartX, setRecipesDragStartX] = useState<number | null>(null);
  const [recipesDragDeltaX, setRecipesDragDeltaX] = useState(0);
  const [recipesPosition, setRecipesPosition] = useState(0);
  const [recipesIsDragging, setRecipesIsDragging] = useState(false);
  const [recipesTransitionEnabled, setRecipesTransitionEnabled] = useState(false);

  useLayoutEffect(() => {
    if (!recipesContainerRef.current || !recipesSliderRef.current) return;

    const updateMeasurements = () => {
      if (recipesContainerRef.current) {
        setRecipesContainerWidth(recipesContainerRef.current.clientWidth);
      }

      if (recipesSliderRef.current) {
        setRecipesContentWidth(recipesSliderRef.current.scrollWidth);
      }
    };

    const observer = new ResizeObserver(() => {
      setTimeout(updateMeasurements, 50);
    });

    if (recipesContainerRef.current) {
      observer.observe(recipesContainerRef.current);
    }

    updateMeasurements();
    setTimeout(updateMeasurements, 100);
    setTimeout(updateMeasurements, 300);

    return () => observer.disconnect();
  }, [recipes]);

  const maxRecipesScrollDistance = Math.max(
    0,
    recipesContentWidth - recipesContainerWidth
  );

  const clampRecipes = (val: number, min: number, max: number) =>
    Math.min(Math.max(val, min), max);

  const handleRecipesDragStart = (clientX: number) => {
    setRecipesDragStartX(clientX);
    setRecipesIsDragging(true);
    setRecipesTransitionEnabled(false);
  };

  const handleRecipesDragMove = (clientX: number) => {
    if (recipesDragStartX === null) return;
    setRecipesDragDeltaX(clientX - recipesDragStartX);
  };

  const handleRecipesDragEnd = () => {
    if (recipesDragStartX === null) return;

    let newPosition = recipesPosition + recipesDragDeltaX;
    newPosition = clampRecipes(newPosition, -maxRecipesScrollDistance, 0);

    // For recipes, snapping is less critical, so we just clamp without snapping

    setRecipesPosition(newPosition);
    setRecipesDragStartX(null);
    setRecipesDragDeltaX(0);
    setRecipesIsDragging(false);
    setRecipesTransitionEnabled(true);
  };

  const clampedRecipesOffset = clampRecipes(
    recipesPosition + recipesDragDeltaX,
    -maxRecipesScrollDistance,
    0
  );

  function formatReviewCount(count: number) {
    if (count >= 1000) {
      return (count / 1000).toFixed(count % 1000 === 0 ? 0 : 1) + 'k';
    }
    return count.toString();
  }

  return (
    <>
      {currentPage === 'Diets' && (
        <>
          {/* Header Text Container */}
          <div className="flex flex-col">
            <p className="text-3xl text-white font-semibold">
              Plat Du Jou Today's Specialty!
            </p>

            <p className="text-2xl text-white font-normal">Please select a diet:</p>
          </div>

          {/* Search Container */}
          <div className="flex w-full justify-end gap-2">
            <input
              type="text"
              placeholder="Enter a recipe's name"
              className="text-xl w-3/4 landscape:w-2/5 font-semibold rounded-lg"
            />

            <button className="font-semibold text-xl px-4 py-2 rounded-lg bg-white">
              Search
            </button>
          </div>

          <hr className="text-white h-px" />

          {selectedDiet === null && (
            /* Diets carousel */
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
                ref={dietsSliderRef}
                className="flex"
                style={{
                  gap: `${gapPx}px`,
                  transform: `translateX(${clampedOffset}px)`,
                  transition: transitionEnabled ? 'transform 0.3s ease-out' : 'none',
                  cursor: isDragging ? 'grabbing' : 'grab',
                  width: 'fit-content',
                }}
              >
                {diets.map((src, index) => {
                  const dietName = dietsText[index];

                  const handleClick = () => {
                    if (!selectedDiet) {
                      setSelectedDiet(dietName);
                    } else {
                      handleDietClick(dietName);
                    }
                  };

                  return (
                    <div
                      key={index}
                      onClick={handleClick}
                      className={`relative cursor-pointer select-none flex-shrink-0 rounded-lg 
                        ${selectedDiet === dietName ? 'border-4 border-white' : ''}`}
                      style={{
                        width: itemWidth,
                        height: '180px',
                      }}
                    >
                      <img
                        src={src}
                        alt={dietName}
                        className="w-full h-full object-cover rounded-lg"
                        draggable={false}
                      />

                      <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-50 text-white text-center py-2 rounded-b-lg text-xl font-semibold">
                        {dietName}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {selectedDiet && (
            <>
              <button
                onClick={() => setSelectedDiet(null)}
                className="mb-4 bg-white text-back font-semibold w-fit px-4 py-2 rounded"
              >
                Back to Diets
              </button>

              <p className="mb-2 text-white font-semibold">
                Showing recipes for: {selectedDiet}
              </p>

              {loading && <p className="text-white">Loading recipes...</p>}
              {error && <p className="text-red-400">{error}</p>}

              {/* Recipes Container */}
              <div
                ref={recipesContainerRef}
                className="relative w-full overflow-hidden touch-pan-x"
                onMouseDown={(e) => handleRecipesDragStart(e.clientX)}
                onMouseMove={(e) => recipesIsDragging && handleRecipesDragMove(e.clientX)}
                onMouseUp={handleRecipesDragEnd}
                onMouseLeave={handleRecipesDragEnd}
                onTouchStart={(e) => handleRecipesDragStart(e.touches[0].clientX)}
                onTouchMove={(e) =>
                  recipesIsDragging && handleRecipesDragMove(e.touches[0].clientX)
                }
                onTouchEnd={handleRecipesDragEnd}
                onDragStart={(e) => e.preventDefault()}
              >
                <div
                  ref={recipesSliderRef}
                  className="flex gap-4"
                  style={{
                    transform: `translateX(${clampedRecipesOffset}px)`,
                    transition: recipesTransitionEnabled ? 'transform 0.3s ease-out' : 'none',
                    cursor: recipesIsDragging ? 'grabbing' : 'grab',
                    width: 'fit-content',
                  }}
                >
                  {recipes.map((recipe) => (
                    <div
                      key={recipe.recipe_id}
                      className="relative rounded-lg bg-white shadow-lg flex-shrink-0"
                      style={{
                        width: '320px',
                        minHeight: '280px',
                        cursor: 'pointer',
                      }}
                    >
                      <img
                        src={`/recipes/${recipe.image_path}`}
                        alt={recipe.recipe_name}
                        className="rounded-t-lg object-cover w-full h-40"
                        draggable={false}
                      />
                      <div className="p-4">
                        <h3 className="text-lg font-semibold">{recipe.recipe_name}</h3>
                        <p className="text-sm text-gray-700 line-clamp-3">
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
                        <span>{recipe.recipe_rating}</span>
                        <span className="ml-2 text-gray-500">({formatReviewCount(recipe.recipe_review_count)})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
