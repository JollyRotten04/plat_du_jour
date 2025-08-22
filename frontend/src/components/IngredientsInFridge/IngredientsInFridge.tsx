import { useState } from 'react';
import IngredientsInFridgeBg from '../../assets/ingredientsInFridgeBg.svg';
import { useNavigate } from 'react-router-dom';

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
  recipe_ingredients: string; // Assuming comma-separated string of ingredients
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

export default function IngredientsInFridge() {
  const categories = [
    {
      name: 'Meat',
      emoji: '🍖',
      items: [
        'Chicken',
        'Beef',
        'Pork',
        'Lamb',
        'Turkey',
        'Bacon',
        'Sausage',
        'Ham',
        'Duck',
        'Veal',
        'Rabbit',
      ],
    },
    {
      name: 'Fish',
      emoji: '🐟',
      items: [
        'Salmon',
        'Tuna',
        'Cod',
        'Trout',
        'Mackerel',
        'Sardines',
        'Herring',
        'Halibut',
        'Catfish',
        'Snapper',
        'Anchovies',
      ],
    },
    {
      name: 'Vegetables',
      emoji: '🥦',
      items: [
        'Carrot',
        'Spinach',
        'Broccoli',
        'Cauliflower',
        'Peppers',
        'Tomato',
        'Onion',
        'Garlic',
        'Zucchini',
        'Cucumber',
        'Eggplant',
        'Mushrooms',
        'Green Beans',
        'Kale',
      ],
    },
    {
      name: 'Fruits',
      emoji: '🍎',
      items: [
        'Apple',
        'Banana',
        'Orange',
        'Strawberry',
        'Blueberry',
        'Grapes',
        'Pineapple',
        'Mango',
        'Peach',
        'Pear',
        'Watermelon',
        'Cherry',
        'Kiwi',
        'Plum',
      ],
    },
    {
      name: 'Dairy',
      emoji: '🧀',
      items: [
        'Milk',
        'Cheese',
        'Yogurt',
        'Butter',
        'Cream',
        'Cottage Cheese',
        'Sour Cream',
        'Cream Cheese',
        'Ice Cream',
        'Ghee',
      ],
    },
    {
      name: 'Grains',
      emoji: '🌾',
      items: [
        'Rice',
        'Bread',
        'Pasta',
        'Quinoa',
        'Oats',
        'Barley',
        'Cornmeal',
        'Couscous',
        'Millet',
        'Rye',
        'Bulgar',
        'Polenta',
      ],
    },
    {
      name: 'Spices',
      emoji: '🧂',
      items: [
        'Salt',
        'Pepper',
        'Cinnamon',
        'Cumin',
        'Paprika',
        'Turmeric',
        'Ginger',
        'Nutmeg',
        'Cloves',
        'Cardamom',
        'Chili Powder',
        'Oregano',
        'Thyme',
        'Basil',
        'Bay Leaves',
      ],
    },
    {
      name: 'Beverages',
      emoji: '🥤',
      items: [
        'Juice',
        'Water',
        'Soda',
        'Tea',
        'Coffee',
        'Milkshake',
        'Smoothie',
        'Wine',
        'Beer',
        'Cocktail',
        'Lemonade',
        'Hot Chocolate',
      ],
    },
  ];

  const [selectedItems, setSelectedItems] = useState<string[]>([]); // all selected ingredient items
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // current category view
  const [poppingItem, setPoppingItem] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRecipes, setShowRecipes] = useState(false); // new state to toggle view

  // Drill into category
  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
  };

  // Select item within category
  const handleItemClick = (itemName: string) => {
    setPoppingItem(itemName);
    setTimeout(() => setPoppingItem(null), 150);

    setSelectedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((item) => item !== itemName)
        : [...prev, itemName]
    );
  };

  // Go back button handler
  const handleBack = () => {
    if (showRecipes) {
      // If viewing recipes, back goes to ingredient selection
      setShowRecipes(false);
      setRecipes([]);
      setError(null);
    } else if (selectedCategory) {
      // If inside category, back to categories
      setSelectedCategory(null);
    }
  };

  // Current category data
  const currentCategory = categories.find((c) => c.name === selectedCategory);

  // Fetch recipes from API, sending selectedItems in request body, then sort by ingredient match count
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const fetchRecipes = async () => {
  if (selectedItems.length === 0) {
    setError('Please select at least one ingredient.');
    setRecipes([]);
    return;
  }
  setLoading(true);
  setError(null);

  try {
    const response = await fetch(`${API_BASE_URL}/api/recipes/available`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ availableIngredients: selectedItems }),
      credentials: 'include', 
    });

    if (!response.ok)
      throw new Error(`HTTP error! status: ${response.status}`);

    const data: ApiResponse = await response.json();

    if (data.success) {
      const selectedLower = selectedItems.map((x) => x.toLowerCase());

      // Sort recipes by matching ingredient count descending
      const sortedRecipes = data.data.sort((a, b) => {
        const aIngredients = a.recipe_ingredients
          .toLowerCase()
          .split(',')
          .map((x) => x.trim());
        const bIngredients = b.recipe_ingredients
          .toLowerCase()
          .split(',')
          .map((x) => x.trim());

        const aMatchCount = aIngredients.filter((ing) =>
          selectedLower.includes(ing)
        ).length;
        const bMatchCount = bIngredients.filter((ing) =>
          selectedLower.includes(ing)
        ).length;

        return bMatchCount - aMatchCount;
      });

      setRecipes(sortedRecipes);
      setShowRecipes(true); // show recipes view now
    } else {
      throw new Error(data.message || 'Failed to load recipes');
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unknown error occurred';
    setError(message);
    setRecipes([]);
    setShowRecipes(false);
    console.error('Error fetching recipes:', message);
  } finally {
    setLoading(false);
  }
};


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


  return (
    <div
      draggable="false"
      className="ingredients-in-fridge select-none bg-cover portrait:h-164 sm:portrait:h-[36rem] md:portrait:h-[48rem] p-6 sm:p-12 sm:px-24 md:landscape:p-6 flex md:landscape:justify-end bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${IngredientsInFridgeBg})` }}
    >
      {/* Main Container */}
      <div
        className="flex flex-col p-4 sm:p-8 gap-4 bg-white h-full w-full md:landscape:w-1/2 xl:landscape:w-2/5 rounded-2xl overflow-y-auto overflow-x-hidden select-none"
        draggable="false"
      >
        {/* Header */}
        <div className="flex flex-col mb-4 select-none" draggable="false">
          <h2 className="text-lg sm:text-xl lg:text-3xl font-semibold lg:mb-2">
            {showRecipes
              ? 'Suggested Recipes'
              : selectedCategory
              ? selectedCategory
              : "What's in your fridge"}
          </h2>
          <p className="text-[0.8rem] sm:text-base lg:text-xl mb-2 text-gray-600">
            {showRecipes
              ? `Found ${recipes.length} recipe${recipes.length !== 1 ? 's' : ''} matching your ingredients`
              : selectedCategory
              ? 'Select what you have in this category'
              : 'Can’t think of anything to cook? Leave the decision to us and we’ll make sure to not disappoint!'}
          </p>
          <hr />
        </div>

        {/* Back Button */}
        {(selectedCategory || showRecipes) && (
          <button
            onClick={handleBack}
            draggable="false"
            className="text-lg select-none cursor-pointer sm:text-base py-2 px-4 rounded-lg text-white main-background font-bold hover:underline w-fit"
          >
            BACK
          </button>
        )}

        <div className="flex flex-col flex-grow min-h-[46rem]">
          {/* Show Ingredients Grid if NOT showing recipes */}
          {!showRecipes && (
            <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-4 sm:gap-6">
              {!selectedCategory &&
                categories.map((category) => (
                  <div
                    key={category.name}
                    onClick={() => handleCategoryClick(category.name)}
                    className={`
                      flex cursor-pointer flex-col items-center gap-3 p-6 sm:p-4 md:p-8 rounded-xl
                      transition-transform duration-150 ease-out transform
                      border-4 border-transparent hover:bg-gray-200 shadow-sm
                    `}
                  >
                    <span className="text-xl sm:text-3xl">{category.emoji}</span>
                    <span className="text-sm sm:text-lg font-medium">
                      {category.name}
                    </span>
                  </div>
                ))}

              {selectedCategory &&
                currentCategory?.items.map((item) => {
                  const isSelected = selectedItems.includes(item);
                  const isPopping = poppingItem === item;

                  return (
                    <div
                      key={item}
                      onClick={() => handleItemClick(item)}
                      className={`
                        flex cursor-pointer flex-col items-center gap-3 p-6 sm:p-4 md:p-8 rounded-xl
                        transition-transform duration-150 ease-out transform
                        border-4 
                        ${
                          isSelected
                            ? 'bg-[#e3f8e7] border-[#253829] shadow-lg'
                            : 'bg-gray-100 border-transparent hover:bg-gray-200 shadow-sm'
                        }
                        ${isPopping ? 'scale-105' : 'scale-100'}
                      `}
                    >
                      <span className="text-sm sm:text-lg font-medium">{item}</span>
                    </div>
                  );
                })}
            </div>
          )}

          {/* Footer (only show when NOT showing recipes) */}
          {!showRecipes && (
            <div className="flex flex-col items-center mt-8 gap-4">
              <p className="text-[0.8rem] sm:text-lg lg:text-xl text-gray-600">
                Items Selected: {selectedItems.length}
              </p>

              <button
                onClick={fetchRecipes}
                draggable="false"
                className="px-4 py-2 sm:px-5 sm:py-3 lg:px-8 lg:py-5 main-background text-white sm:text-xl lg:text-2xl font-semibold rounded-lg lg:rounded-xl select-none cursor-pointer"
              >
                Suggest
              </button>
            </div>
          )}

          {/* Recipes List (only show when showing recipes) */}
          {showRecipes && (
            <div className="space-y-6 mt-4">
              {loading && <p className="text-center text-gray-500">Loading recipes...</p>}
              {error && (
                <p className="text-center text-red-600 font-semibold">{error}</p>
              )}

              {!loading && !error && recipes.length > 0 && (
                <div className="flex flex-col gap-6">
                  {recipes.map((recipe) => (
                    <div
                      key={recipe.recipe_id}
                      onClick={() => viewContent('recipes', recipe.recipe_slug, recipe)}
                      className="border rounded-lg p-4 shadow hover:shadow-lg transition-shadow flex flex-col gap-4"
                    >
                      <div className="flex items-center gap-4">
                        {recipe.image_path && (
                          <img
                            src={`/recipes/${recipe.image_path}`}
                            alt={recipe.recipe_name}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        )}
                        <div>
                          <h4 className="text-xl font-semibold">{recipe.recipe_name}</h4>
                          <p className="text-gray-700">{recipe.recipe_description}</p>
                          <p className="mt-1 text-sm text-gray-500">
                            By {recipe.recipe_author} | {recipe.recipe_cooktime} | ⭐{' '}
                            {recipe.recipe_rating} ({recipe.recipe_review_count} reviews)
                          </p>
                          <p className="mt-1 text-sm text-gray-600">
                            Ingredients: {recipe.recipe_ingredients}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && !error && recipes.length === 0 && (
                <p className="text-center text-gray-500 mt-4">
                  No recipes found with the selected ingredients.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
