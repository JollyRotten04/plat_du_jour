// Imports...
import { useEffect, useState } from 'react';
import heroImage from '../../assets/heroImage.svg';
import Carousel from '../../components/Carousel/Carousel';
import RecipesToInspire from '../../components/RecipesToInspire/RecipesToInspire';
import IngredientsInFridge from '../../components/IngredientsInFridge/IngredientsInFridge';

// Types
interface Recipe {
    recipe_id: number;
    recipe_name: string;
    recipe_description: string;
    recipe_ingredients: string;
    recipe_rating: number | null;
    recipe_cooktime: string;
    recipe_category: string;
    recipe_type: string;
    image_path: string;
    recipe_calories: number | null;
    recipe_slug: string;
    recipe_author: string;
    recipe_review_count: number;
    steps: string[];
    nutritional_value: Record<string, any>;
    created_at: string;
    updated_at: string;
}

interface ApiResponse {
    success: boolean;
    data: Recipe[];
    count: number;
    message: string;
}

interface RecipesPageProps {
    currentPage: string;
}

export default function RecipesPage({ currentPage }: RecipesPageProps) {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // API call function
    const fetchRecipes = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('http://localhost/api/recipes/load', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: ApiResponse = await response.json();

            if (data.success) {
                setRecipes(data.data);
                console.log('Recipes loaded successfully:', data.data);
                console.log('Total recipes:', data.count);
            } else {
                throw new Error(data.message || 'Failed to load recipes');
            }

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setError(errorMessage);
            console.error('Error fetching recipes:', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Fetch recipes when component mounts
    useEffect(() => {
        fetchRecipes();
    }, []);

    // Optional: Retry function
    const handleRetry = () => {
        fetchRecipes();
    };

    return (
        <>
            <div className="h-full w-full">
                <div className="flex flex-col items-center min-h-screen">
                    
                    {/* Hero Image */}
                    <img src={heroImage} alt="Hero" className="w-full object-cover" />

                    {/* Loading State */}
                    {loading && (
                        <div className="flex justify-center items-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                            <span className="ml-2 text-gray-600">Loading recipes...</span>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded m-4">
                            <strong className="font-bold">Error: </strong>
                            <span className="block sm:inline">{error}</span>
                            <button 
                                onClick={handleRetry}
                                className="ml-4 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {/* Debug Info (remove in production) */}
                    {!loading && !error && (
                        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded m-4">
                            <strong>Debug: </strong>
                            Loaded {recipes.length} recipes successfully!
                        </div>
                    )}

                    {/* Other contents container */}
                    <div className='flex flex-col flex-1 w-full h-fit p-4 sm:landscape:p-6 md:landscape:p-8 gap-4 sm:gap-8 md:gap-12'>

                        {/* Green Container Container */}
                        <div className='w-full p-6 sm:portrait:p-8 md:portrait:p-10 sm:landscape:p-6 md:landscape:p-6 lg:landscape:p-8 main-background portrait:flex-col landscape:flex gap-4 shadow-xl overflow-hidden'>
                            <Carousel currentPage={currentPage}  />
                        </div>

                        {/* Recipes to Inspire Component */}
                        <RecipesToInspire />

                        {/* What's In The Fridge Component */}
                        <IngredientsInFridge />
                        
                    </div>
                </div>
            </div>
        </>
    );
}