// Imports...
import { useEffect, useState } from 'react';
import heroImage from '../../assets/heroImage.svg';
import ChoiceCarousel from '../../components/ChoiceCarousel/ChoiceCarousel';
import RecipesToInspire from '../../components/MoreContent/MoreContents';
import IngredientsInFridge from '../../components/IngredientsInFridge/IngredientsInFridge';

export default function DietsPage({ currentPage }: { currentPage: string }){

    const [parsedRecipes, setParsedRecipes] = useState('');

    useEffect(() => {
        const savedRecipes = sessionStorage.getItem('recipes');
        if (savedRecipes) {
            setParsedRecipes(JSON.parse(savedRecipes));
            // Use the data
            console.log(parsedRecipes);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return(
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