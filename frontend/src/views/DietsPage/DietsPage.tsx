// Imports...
import heroImage from '../../assets/heroImage.svg';
import Carousel from '../../components/Carousel/Carousel';
import RecipesToInspire from '../../components/RecipesToInspire/RecipesToInspire';
import IngredientsInFridge from '../../components/IngredientsInFridge/IngredientsInFridge';

export default function DietsPage(currentPage:string){
    return(
        <>
            <div className="h-full w-full">
                
                <div className="flex flex-col items-center min-h-screen">
                    
                    {/* Hero Image */}
                    <img src={heroImage} alt="Hero" className="w-full object-cover" />

                    {/* Other contents container */}
                    <div className='flex flex-col flex-1 w-full h-fit p-4 sm:landscape:p-6 md:landscape:p-8 gap-4 sm:gap-8 md:gap-12'>

                        {/* Green Container Container */}
                        <div className='w-full p-6 sm:portrait:p-8 md:portrait:p-10 sm:landscape:p-6 md:landscape:p-6 lg:landscape:p-8 main-background portrait:flex-col landscape:flex gap-4 shadow-xl overflow-hidden'>

                            <Carousel currentPage={currentPage} />
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