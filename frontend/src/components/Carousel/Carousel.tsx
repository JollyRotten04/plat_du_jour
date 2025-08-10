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
import ChoiceCarousel from '../ChoiceCarousel/ChoiceCarousel';

// Define props for the Carousel component
type CarouselProps = {
  currentPage: string;

};

export default function Carousel({ currentPage}: CarouselProps) {
  const images = [CarouselImage1, CarouselImage2, CarouselImage3];

  // useEffect(() => {
  //   console.log(data);
  // },[data]);

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

  return (
    <div className="flex flex-col gap-6 w-full h-full">
      {/* Home View */}
      {currentPage === 'Home' && (
        <div className="flex flex-col md:flex-row gap-6 w-full h-full">
          {/* Left */}
          <div className="flex flex-col gap-4 md:w-1/2">
            <p className="text-white font-semibold text-2xl lg:landscape:text-3xl xl:landscape:text-4xl">
              Trusted by 10+ million users
            </p>
            <div className="relative w-full h-72 md:landscape:h-64 lg:landscape:h-96 xl:landscape:h-124 md:h-76 lg:h-96 rounded-lg bg-gray-200 overflow-hidden">
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
          <div className="relative flex flex-col justify-center gap-4 md:w-1/2 py-8 landscape:px-16">
            <img src={QuoteIcon} className="h-6 landscape:h-10 absolute top-0 left-0 landscape:top-10" alt="" />
            <p className="text-white font-semibold text-2xl lg:landscape:text-3xl xl:landscape:text-4xl">
              {titleTexts[homeIndex]}
            </p>
            <p className="text-white text-xl lg:landscape:text-xl xl:landscape:text-2xl leading-relaxed">
              {descriptionTexts[homeIndex]}
            </p>
            <img
              src={QuoteIcon}
              className="h-6 landscape:h-10 absolute bottom-0 landscape:bottom-10 right-0 rotate-180"
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

      {/* Articles View */}
      {currentPage === 'Articles' && (
        <div>
          <p className="text-white text-2xl">Articles Page</p>
        </div>
      )}
    </div>
  );
}