// Imports...
import heroImage from '../../assets/heroImage.svg';
import ChoiceCarousel from '../../components/ChoiceCarousel/ChoiceCarousel';
import RecipesToInspire from '../../components/MoreContent/MoreContents';
import IngredientsInFridge from '../../components/IngredientsInFridge/IngredientsInFridge';

// Types
// interface Recipe {
//     recipe_id: number;
//     recipe_name: string;
//     recipe_description: string;
//     recipe_ingredients: string;
//     recipe_rating: number | null;
//     recipe_cooktime: string;
//     recipe_category: string;
//     recipe_type: string;
//     image_path: string;
//     recipe_calories: number | null;
//     recipe_slug: string;
//     recipe_author: string;
//     recipe_review_count: number;
//     steps: string[];
//     nutritional_value: Record<string, any>;
//     created_at: string;
//     updated_at: string;
// }

// interface ApiResponse {
//     success: boolean;
//     data: Recipe[];
//     count: number;
//     message: string;
// }

export default function RecipesPage({ currentPage }: { currentPage: string }) {


    // API call function
    // const fetchRecipes = async () => {
    //     try {
    //         setLoading(true);
    //         setError(null);

    //         const response = await fetch('http://localhost/api/recipes/load', {
    //             method: 'GET',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Accept': 'application/json',
    //             },
    //         });

    //         if (!response.ok) {
    //             throw new Error(`HTTP error! status: ${response.status}`);
    //         }

    //         const data: ApiResponse = await response.json();

    //         if (data.success) {
    //             setRecipes(data.data);
    //         } else {
    //             throw new Error(data.message || 'Failed to load recipes');
    //         }

    //     } catch (err) {
    //         const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    //         setError(errorMessage);
    //         console.error('Error fetching recipes:', errorMessage);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // // Fetch recipes when component mounts
    // useEffect(() => {
    //     fetchRecipes();
    // }, []);

    // // Optional: Retry function
    // const handleRetry = () => {
    //     fetchRecipes();
    // };

    // useEffect(() => {
    //     if (recipes.length > 0) {
    //         sessionStorage.setItem('recipes', JSON.stringify(recipes));
    //     }
    // }, [recipes]);

    return (
        <>
            <div className="h-full w-full">
                <div className="flex flex-col items-center min-h-screen">
                    
                    {/* Hero Image */}
                    <img src={heroImage} alt="Hero" className="w-full object-cover" />

                    {/* Other contents container */}
                    <div className='flex flex-col flex-1 w-full h-fit p-4 sm:landscape:p-6 md:landscape:p-8 gap-4 sm:gap-8 md:gap-12'>

                        {/* Green Container Container */}
                        <div className='flex flex-col w-full min-h-fit p-6 sm:portrait:p-8 md:portrait:p-10 sm:landscape:p-6 md:landscape:p-6 lg:landscape:p-8 main-background portrait:flex-col landscape:flex gap-4 shadow-xl overflow-hidden'>
                            <ChoiceCarousel currentPage={currentPage}></ChoiceCarousel>
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