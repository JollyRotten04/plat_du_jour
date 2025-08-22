import React, {
  useState,
  useRef,
  useLayoutEffect,
  useEffect,
} from 'react';

import { useNavigate } from 'react-router-dom';

import CarnivoreDiet from '../../assets/diets/carnivore.svg';
import KetoDiet from '../../assets/diets/keto.svg';
import SeafoodDiet from '../../assets/diets/seafood.svg';
import KosherDiet from '../../assets/diets/kosher.svg';
import MediterraneanDiet from '../../assets/diets/mediterranean.svg';
import PaleoDiet from '../../assets/diets/paleo.svg';
import VegetarianDiet from '../../assets/diets/vegetarian.svg';
import PlusIcon from '../../assets/plus.svg';

// For Meals...
import Breakfast from '../../assets/mealCategories/breakfast.svg';
import Snack from '../../assets/mealCategories/snacks.svg';
import Lunch from '../../assets/mealCategories/lunch.svg';
import Dessert from '../../assets/mealCategories/dessert.svg';
import Dinner from '../../assets/mealCategories/dinner.svg';

// For Articles...
import CookingCategory from '../../assets/articleCategories/cooking.svg';
import FoodScienceCategory from '../../assets/articleCategories/food-science.svg';
import LifestyleCategory from '../../assets/articleCategories/lifestyle.svg';
import FoodSustainabilityCategory from '../../assets/articleCategories/food-sustainability.svg';
import HealthNutritionCategory from '../../assets/articleCategories/health-and-nutrition.svg';


const diets = [
  CarnivoreDiet,
  KetoDiet,
  SeafoodDiet,
  KosherDiet,
  MediterraneanDiet,
  PaleoDiet,
  VegetarianDiet,
];

// For meals
const meals = [
  Breakfast,
  Snack,
  Lunch,
  Dessert,
  Dinner,
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
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form submission/page reload
    fetchRecipes(); // Trigger search
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedDiet(null);
    setSelectedMeal(null);
  };

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Fetch recipes with priority-based filtering (only one filter at a time)
const fetchRecipes = async () => {
  try {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();

    if (searchQuery.trim()) {
      params.append('search', searchQuery.trim());
    } else if (currentPage === 'Diets' && selectedDiet) {
      params.append('diet', selectedDiet);
    } else if (currentPage === 'Recipes' && selectedMeal) {
      params.append('meal_type', selectedMeal);
    }

    const url = `${API_BASE_URL}/api/recipes/load?${params.toString()}`;
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
    setError(message);
    console.error('Error fetching recipes:', message);
  } finally {
    setLoading(false);
  }
};



  // Only fetch recipes when a diet is actually selected or when searching
  useEffect(() => {
  if (searchQuery.trim()) {
    fetchRecipes();
    return;
  }

  if (currentPage === 'Diets' && selectedDiet) {
    fetchRecipes();
  } else if (currentPage === 'Recipes' && selectedMeal) {
    fetchRecipes();
  } else {
    setRecipes([]);
  }
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [selectedDiet, selectedMeal, searchQuery, currentPage]);


  // useEffect(() => {
  //   console.log(recipes);
  // }, [recipes]);

  const dietsText = [
    'Meat-Based',
    'Keto',
    'Seafood',
    'Kosher',
    'Mediterranean',
    'Paleo',
    'Vegetarian',
  ];

  // For Recipes
  const mealsText = [
    'Breakfast',
    'Snack',
    'Lunch',
    'Dessert',
    'Dinner',
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
  
  // Add drag detection state
  const [hasDragged, setHasDragged] = useState(false);
  const dragThreshold = 5; // pixels - minimum movement to consider it a drag

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
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
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
    setHasDragged(false); // Reset drag detection
  };

  const handleDietDragMove = (clientX: number) => {
    if (dragStartX === null) return;
    const deltaX = clientX - dragStartX;
    setDragDeltaX(deltaX);
    
    // Check if we've moved enough to consider it a drag
    if (Math.abs(deltaX) > dragThreshold) {
      setHasDragged(true);
    }
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

  // Add these state variables with your other useState declarations
  const [selectedArticleCategory, setSelectedArticleCategory] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);

  // Add Article type definition with your other types
  type Article = {
    article_id: number;
    article_title: string;
    article_excerpt: string;
    article_author: string;
    article_content: string;
    article_category: string;
    article_publish_date: string;
    article_read_time: string;
    article_tags: string;
    article_slug: string;
    image_path: string;
    article_views: number;
  };

  type ArticleApiResponse = {
    success: boolean;
    data: Article[];
    message?: string;
  };

  // Add this to your fetchRecipes function to handle articles
  const fetchArticles = async () => {

    console.log('Fetching articles');
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();

      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      } else if (currentPage === 'Articles' && selectedArticleCategory) {
        params.append('category', selectedArticleCategory);
      }

      const url = `http://localhost/api/articles/load?${params.toString()}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data: ArticleApiResponse = await response.json();
      if (data.success) {
        setArticles(data.data);
      } else {
        throw new Error(data.message || 'Failed to load articles');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(message);
      console.error('Error fetching articles:', message);
    } finally {
      setLoading(false);
    }
  };

  // To add recipe or articles, only works if the user is logged in...
  // const addContent = async () => {

  //   console.log('Fetching articles');
  //   try {
  //     setLoading(true);
  //     setError(null);

  //     const params = new URLSearchParams();

  //     if (searchQuery.trim()) {
  //       params.append('search', searchQuery.trim());
  //     } else if (currentPage === 'Articles' && selectedArticleCategory) {
  //       params.append('category', selectedArticleCategory);
  //     }

  //     const url = `http://localhost/api/articles/load?${params.toString()}`;
  //     const response = await fetch(url, {
  //       method: 'GET',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Accept: 'application/json',
  //       },
  //     });

  //     if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
  //     const data: ArticleApiResponse = await response.json();
  //     if (data.success) {
  //       setArticles(data.data);
  //     } else {
  //       throw new Error(data.message || 'Failed to load articles');
  //     }
  //   } catch (err) {
  //     const message = err instanceof Error ? err.message : 'An unknown error occurred';
  //     setError(message);
  //     console.error('Error fetching articles:', message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Update your useEffect to handle articles
  useEffect(() => {
    if (searchQuery.trim()) {
      if (currentPage === 'Articles') {
        fetchArticles();
      } else {
        fetchRecipes();
      }
      return;
    }

    if (currentPage === 'Diets' && selectedDiet) {
      fetchRecipes();
    } else if (currentPage === 'Recipes' && selectedMeal) {
      fetchRecipes();
    } else if (currentPage === 'Articles' && selectedArticleCategory) {
      fetchArticles();
    } else {
      setRecipes([]);
      setArticles([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDiet, selectedMeal, selectedArticleCategory, searchQuery, currentPage]);

  // Add this array with your other arrays (diets, meals)
  const articleCategories = [
    CookingCategory,
    HealthNutritionCategory,
    LifestyleCategory,
    FoodScienceCategory,
    FoodSustainabilityCategory,
  ];

  const articleCategoriesText = [
    'Cooking',
    'Health and Nutrition',
    'Lifestyle',
    'Food Science',
    'Food Sustainability',
  ];

  // For navigating to View Content Page with Article Slug
  const navigate = useNavigate();

  // Logic to switch to View Contents Page...
  const viewContent = (
    contentType: 'recipes' | 'articles',
    slug: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any
  ) => {
    navigate(`/view-content/${contentType}/${slug}`, { state: { data } });
  };

  return (
    <>

      {/* If in Recipes Page */}
      {currentPage === 'Recipes' && (
        <>
          {/* Header Text Container */}
          <div className="flex flex-col">
            <p className="text-3xl text-white font-semibold select-none">
              Plat Du Jou Today's Specialty!
            </p>

            <p className="text-2xl text-white font-normal select-none">Please select a meal:</p>
          </div>

          {/* Search Container */}
          <div className="flex w-full justify-end gap-2">
            <form onSubmit={handleSearch} className="flex w-full justify-end gap-2">
              <input
                type="text"
                placeholder="Enter a recipe's name"
                value={searchQuery}
                onChange={handleSearchInputChange}
                className="text-xl w-3/4 landscape:w-2/5 font-semibold rounded-lg px-3 py-2"
              />
              <button
                type='button'
                onClick={clearSearch}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold px-3 py-1 rounded text-sm transition-colors"
              >
                Clear
              </button>
            </form>
          </div>

          {/* Show clear button when searching */}
          {(searchQuery.trim() || (selectedMeal && recipes.length > 0)) && (
            <div className="flex justify-between items-center">
              <p className="text-white">
                {searchQuery.trim() && selectedMeal
                  ? `Showing ${selectedMeal} recipes matching "${searchQuery}"`
                  : searchQuery.trim() 
                  ? `Showing recipes matching "${searchQuery}"`
                  : `Showing recipes for: ${selectedMeal}`
                }
              </p>
            </div>
          )}

          <hr className="text-white h-px" />

          {selectedMeal === null && !searchQuery.trim() && (
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
                {meals.map((src, index) => {
                  const mealName = mealsText[index];

                  const handleClick = () => {
                    // Only allow selection if we haven't dragged
                    if (!hasDragged) {
                      if (!selectedMeal) {
                        setSelectedMeal(mealName);
                      } else {
                        // 
                      }
                    }
                  };

                  return (
                    <div
                      key={index}
                      onClick={handleClick}
                      className={`relative cursor-pointer select-none flex-shrink-0 rounded-lg 
                        ${selectedMeal === mealName ? 'border-4 border-white' : ''}`}
                      style={{
                        width: itemWidth,
                        height: '180px',
                      }}
                    >
                      <img
                        src={src}
                        alt={mealName}
                        className="w-full h-full object-cover rounded-lg"
                        draggable={false}
                      />

                      <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-50 text-white text-center py-2 rounded-b-lg text-xl font-semibold">
                        {mealName}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {(selectedMeal || searchQuery.trim()) && recipes.length > 0 && (
            <>
              {selectedMeal && (
                <button
                  onClick={() => setSelectedMeal(null)}
                  className="mb-4 bg-white select-none cursor-pointer text-black font-semibold w-fit px-4 py-2 rounded hover:bg-gray-100 transition-colors"
                >
                  Back to Meals
                </button>
              )}

              {loading && <p className="text-white select-none">Loading recipes...</p>}
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
                      onClick={() => viewContent('recipes', recipe.recipe_slug, recipe)}
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

                  {/* Renders Add New Recipe */}
                  <div draggable='false' className='select-none cursor-pointer w-[320px] min-h-[280px] p-4 border-4 border-white rounded-xl flex flex-col justify-center items-center'>

                    <img draggable='false' src={PlusIcon} className='h-10 w-12' alt="" />

                    <p className='select-none text-white text-xl font-semibold'>Add New Recipe</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* If in Diets Page */}
      {currentPage === 'Diets' && (
        <>
          {/* Header Text Container */}
          <div className="flex flex-col">
            <p className="text-3xl text-white font-semibold select-none">
              Plat Du Jou Today's Specialty!
            </p>

            <p className="text-2xl text-white font-normal select-none">Please select a diet:</p>
          </div>

          {/* Search Container */}
          <div className="flex w-full justify-end gap-2">
            <form onSubmit={handleSearch} className="flex w-full justify-end gap-2">
              <input
                type="text"
                placeholder="Enter a recipe's name"
                value={searchQuery}
                onChange={handleSearchInputChange}
                className="text-xl w-3/4 landscape:w-2/5 font-semibold rounded-lg px-3 py-2"
              />
              <button
                type='button'
                onClick={clearSearch}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold px-3 py-1 rounded text-sm transition-colors"
              >
                Clear
              </button>
            </form>
          </div>

          {/* Show clear button when searching */}
          {(searchQuery.trim() || (selectedDiet && recipes.length > 0)) && (
            <div className="flex justify-between items-center">
              <p className="text-white">
                {searchQuery.trim() && selectedDiet 
                  ? `Showing ${selectedDiet} recipes matching "${searchQuery}"`
                  : searchQuery.trim() 
                  ? `Showing recipes matching "${searchQuery}"`
                  : `Showing recipes for: ${selectedDiet}`
                }
              </p>
            </div>
          )}

          <hr className="text-white h-px" />

          {selectedDiet === null && !searchQuery.trim() && (
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
                    // Only allow selection if we haven't dragged
                    if (!hasDragged) {
                      if (!selectedDiet) {
                        setSelectedDiet(dietName);
                      } else {
                        // 
                      }
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

          {(selectedDiet || searchQuery.trim()) && recipes.length > 0 && (
            <>
              {selectedDiet && (
                <button
                  onClick={() => setSelectedDiet(null)}
                  className="mb-4 bg-white text-black font-semibold w-fit px-4 py-2 rounded hover:bg-gray-100 transition-colors"
                >
                  Back to Diets
                </button>
              )}

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
                      onClick={() => viewContent('recipes', recipe.recipe_slug, recipe)}
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

                  {/* Renders Add New Recipe */}
                  <div draggable='false' className='select-none cursor-pointer w-[320px] min-h-[280px] p-4 border-4 border-white rounded-xl flex flex-col justify-center items-center'>

                    <img draggable='false' src={PlusIcon} className='h-10 w-12' alt="" />

                    <p className='select-none text-white text-xl font-semibold'>Add New Recipe</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* If in Articles Page */}
      {currentPage === 'Articles' && (
        <>
          {/* Header Text Container */}
          <div className="flex flex-col">
            <p className="text-3xl text-white font-semibold select-none">
              Plat Du Jou Knowledge Hub!
            </p>
            <p className="text-2xl text-white font-normal select-none">
              Please select an article category:
            </p>
          </div>

          {/* Search Container */}
          <div className="flex w-full justify-end gap-2">
            <form onSubmit={handleSearch} className="flex w-full justify-end gap-2">
              <input
                type="text"
                placeholder="Enter an article title"
                value={searchQuery}
                onChange={handleSearchInputChange}
                className="text-xl w-3/4 landscape:w-2/5 font-semibold rounded-lg px-3 py-2"
              />
              <button
                type='button'
                onClick={clearSearch}
                className="bg-red-500 select-none hover:bg-red-600 text-white font-semibold px-3 py-1 rounded text-sm transition-colors"
              >
                Clear
              </button>
            </form>
          </div>

          {/* Show status when searching or category selected */}
          {(searchQuery.trim() || (selectedArticleCategory && articles.length > 0)) && (
            <div draggable='false' className="flex justify-between items-center">
              <p className="text-white select-none">
                {searchQuery.trim() && selectedArticleCategory
                  ? `Showing ${selectedArticleCategory} articles matching "${searchQuery}"`
                  : searchQuery.trim() 
                  ? `Showing articles matching "${searchQuery}"`
                  : `Showing articles for: ${selectedArticleCategory}`
                }
              </p>
            </div>
          )}

          <hr className="text-white h-px" />

          {selectedArticleCategory === null && !searchQuery.trim() && (
            /* Article Categories carousel */
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
                {articleCategories.map((src, index) => {
                  const categoryName = articleCategoriesText[index];

                  const handleClick = () => {
                    // Only allow selection if we haven't dragged
                    if (!hasDragged) {
                      if (!selectedArticleCategory) {
                        // console.log(categoryName);
                        setSelectedArticleCategory(categoryName);
                      }
                    }
                  };

                  return (
                    <div
                      key={index}
                      onClick={handleClick}
                      className={`relative cursor-pointer select-none flex-shrink-0 rounded-lg 
                        ${selectedArticleCategory === categoryName ? 'border-4 border-white' : ''}`}
                      style={{
                        width: itemWidth,
                        height: '180px',
                      }}
                    >
                      <img
                        src={src}
                        alt={categoryName}
                        className="w-full h-full object-cover rounded-lg"
                        draggable={false}
                      />

                      <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-50 text-white text-center py-2 rounded-b-lg text-xl font-semibold">
                        {categoryName}
                      </div>
                    </div>
                  );
                })}

                {/* Renders Add New Recipe */}
                <div draggable='false' className='select-none cursor-pointer w-[320px] min-h-[280px] p-4 border-4 border-white rounded-xl flex flex-col justify-center items-center'>

                  <img draggable='false' src={PlusIcon} className='h-10 w-12' alt="" />

                  <p className='select-none text-white text-xl font-semibold'>Add New Recipe</p>
                </div>
              </div>
            </div>
          )}

          {(selectedArticleCategory || searchQuery.trim()) && articles.length > 0 && (
            <div>
              {selectedArticleCategory && (
                <button
                  onClick={() => setSelectedArticleCategory(null)}
                  className="mb-4 bg-white select-none cursor-pointer text-black font-semibold w-fit px-4 py-2 rounded hover:bg-gray-100 transition-colors"
                >
                  Back to Categories
                </button>
              )}

              {loading && <p className="text-white select-none">Loading articles...</p>}
              {error && <p className="text-red-400">{error}</p>}

              {/* Articles Container */}
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
                  draggable={false}
                  style={{
                    transform: `translateX(${clampedRecipesOffset}px)`,
                    transition: recipesTransitionEnabled ? 'transform 0.3s ease-out' : 'none',
                    cursor: recipesIsDragging ? 'grabbing' : 'grab',
                    width: 'fit-content',
                  }}
                >
                  {articles.map((article) => (
                    <div
                      onClick={() => viewContent('articles', article.article_slug, article)}
                      key={article.article_id}
                      className="relative rounded-lg bg-white shadow-lg flex-shrink-0"
                      draggable={false}
                      style={{
                        width: '320px',
                        minHeight: '280px',
                        cursor: 'pointer',
                      }}
                    >
                      <img
                        src={`/articleImages/${article.image_path}`}
                        alt={article.article_title}
                        className="rounded-t-lg object-cover w-full h-40 select-none"
                        draggable={false}
                      />
                      <div className="p-4">
                        <h3 className="text-lg font-semibold select-none">{article.article_title}</h3>
                        <p className="text-sm select-none text-gray-700 line-clamp-3">
                          {article.article_excerpt}
                        </p>
                        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                          <span className='select-none'>{article.article_author}</span>
                          <span className='select-none'>{article.article_read_time}</span>
                        </div>
                      </div>
                      <div className="absolute bottom-2 left-2 text-sm text-gray-600 bg-white bg-opacity-80 rounded px-2 py-1 flex items-center gap-1">
                        <svg
                          className="w-4 h-4 select-none fill-current text-blue-500"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                        </svg>
                        <span className='select-none'>{article.article_views.toLocaleString()} views</span>
                      </div>
                    </div>
                  ))}

                  {/* Renders Add New Article */}
                  <div draggable='false' className='select-none cursor-pointer w-[320px] min-h-[280px] p-4 border-4 border-white rounded-xl flex flex-col justify-center items-center'>

                    <img draggable='false' src={PlusIcon} className='h-10 w-12' alt="" />

                    <p className='select-none text-white text-xl font-semibold'>Add New Article</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}