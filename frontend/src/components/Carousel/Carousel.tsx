// Imports...
import React, { useState, useEffect } from 'react';
import CarouselImage1 from '../../assets/carouselImage1.svg';
import CarouselImage2 from '../../assets/carouselImage2.svg';
import CarouselImage3 from '../../assets/carouselImage3.svg';
import QuoteIcon from '../../assets/quoteIcon.svg';

type CarouselProps = {
  currentPage: string;
};

export default function Carousel({ currentPage }: CarouselProps) {
  const images = [
    CarouselImage1,
    CarouselImage2,
    CarouselImage3
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000); // 4 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  // Dynamically changing title text for each carousel item values
  const titleTexts = [
    "Plat Du Jour, Today's Special!", 
    'Trusted by countless food-goers!', 
    'Endless culinary delights!'
  ];

  // Dynamically changing description text for each carousel item values
  const descriptionTexts = [
    'Explore hundreds of recipes from various categories. A myriad of flavors to satiate any craving',
    "Favorite recipe platform of users from all across the world, from various backgrounds. Anybody can find a recipe they'll be sure to like!",
    "Whether it be breakfast, lunch, dinner, dessert, or just a quick snack. You'll surely find a recipe to get your taste buds excited "
  ];

  return (

    <div className='flex portrait:flex-col sm:landscape:flex-col md:landscape:flex-row h-full w-full gap-2 portrait:gap-6 landscape:gap-6'>

      {/* Dynamic Rendering based on current page */}
      {currentPage === 'Home' && (
      
        // Home View
        <div>
      
          {/* Left Container */}
                <div className='flex flex-col gap-2 portrait:gap-4 landscape:gap-4 portrait:w-full landscape:w-1/2 sm:landscape:w-full md:landscape:min-w-1/2 md:landscape:max-w-1/2 lg:landscape:min-w-1/2 lg:landscape:max-w-1/2'>

                  <p className='text-white select-none font-semibold text-xl portrait:text-2xl landscape:text-2xl md:landscape:text-2xl lg:landscape:text-3xl'> Trusted by 10+ million users </p>

                  <div className="relative w-full portrait:h-72 sm:portrait:h-86 md:portrait:h-124 sm:landscape:h-64 md:landscape:h-86 lg:landscape:h-96 sm:landscape:w-full md:landscape:w-full lg:landscape:w-full rounded-lg bg-gray-200">

                    {images.map((src, index) => (
                      <div
                        key={index}
                        className={`absolute inset-0 transition-all h-full w-full z-5 duration-500 ease-in-out ${
                          index === currentIndex ? 'opacity-100' : 'opacity-0'
                        }`}
                      >
                        <img 
                          draggable="false"
                          src={src} 
                          alt={`Slide ${index + 1}`}
                          className="absolute z-5 object-cover select-none w-full h-full"
                        />
                      </div>
                    ))}
                    
                    {/* Optional: Add slide indicators */}
                    {/* <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {images.map((_, index) => (
                        <button
                          key={index}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                          onClick={() => setCurrentIndex(index)}
                        />
                      ))}
                    </div> */}
                    {/* Background Styling */}
                    {/* <div className='absolute portrait:h-48 landscape:h-64 portrait:w-88 z-4 bg-white left-2 top-2'></div> */}
                  </div>
                </div>

                {/* Right Container */}
                  <div className='flex flex-col portrait:gap-2 landscape:gap-2 md:landscape:justify-center portrait:py-8 relative'>

                    {/* Quote Icon */}
                    <img src={QuoteIcon} className='h-6 absolute top-0 left-0' alt="" />
                                                  
                    <p className='text-white select-none font-semibold text-lg portrait:text-2xl landscape:text-2xl transition-opacity duration-500'> 
                      {titleTexts[currentIndex]} {/* Dynamically changing title text */}
                    </p>

                    <p className='text-white select-none text-base portrait:text-xl landscape:text-xl leading-relaxed transition-opacity duration-500'> 
                      {descriptionTexts[currentIndex]} {/* Dynamically changing description text */}
                    </p>

                    {/* Quote Icon */}
                    <img src={QuoteIcon} className='h-6 absolute bottom-0 right-0 rotate-180' alt="" />
                  </div>  
              </div>
            )}
  
      {/* Recipes View */}
      {currentPage === 'Recipes' && (
        <div>
            <p className='text-white text-2xl'>Recipes Page</p>
        </div>
      )}



    </div>

  );
}