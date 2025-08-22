import { FaStar } from 'react-icons/fa';
import { useState } from 'react';

export default function StarRating() {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState<number | null>(null);
    const [clickedStar, setClickedStar] = useState<number | null>(null);

    const handleClick = (starValue: number) => {
        setRating(starValue);
        setClickedStar(starValue);
        // Remove animation after 150ms
        setTimeout(() => setClickedStar(null), 150);
    };

    return (
        <div className="flex flex-col mt-12">
            {/* Stars Container */}
            <div className="flex gap-2 justify-center">
                {[...Array(5)].map((_, index) => {
                    const starValue = index + 1;
                    const isActive = (hover || rating) >= starValue;
                    const isClicked = clickedStar === starValue;

                    return (
                        <label key={starValue}>
                            <input
                                type="radio"
                                name="rating"
                                value={starValue}
                                onClick={() => handleClick(starValue)}
                                className="hidden"
                            />
                            <FaStar
                                className={`
                                    cursor-pointer
                                    transition-all duration-500
                                    text-[3rem]
                                    ${isActive ? 'text-yellow-400' : 'text-gray-300'}
                                    ${isClicked ? 'scale-130' : 'scale-100'}
                                `}
                                onMouseEnter={() => setHover(starValue)}
                                onMouseLeave={() => setHover(null)}
                            />
                        </label>
                    );
                })}
            </div>
        </div>
    );
}
