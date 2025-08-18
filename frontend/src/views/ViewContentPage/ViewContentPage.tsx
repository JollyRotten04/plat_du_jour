import { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import HeartUnfilled from "../../assets/unfilled-heart.svg";
import HeartFilled from "../../assets/filled-heart.svg";
import ReportIcon from "../../assets/report.svg";
import StarRating from "../../components/StarRating/StarRating";
import MoreContents from "../../components/MoreContent/MoreContents";

export default function ViewContentPage({ currentPage }: { currentPage: string }) {
    const { contentType, slug } = useParams();
    const location = useLocation();
    const data = location.state?.data;

    const validContentTypes = ["recipes", "articles"];
    if (!contentType || !validContentTypes.includes(contentType)) {
        return <p>Invalid content type.</p>;
    }

    const fieldMap = {
        articles: {
            id: "article_id",
            title: "article_title",
            image: "image_path",
            slug: "article_slug",
            author: "article_author",
            content: "article_content",
            published: "article_publish_date",
            rating: "article_rating",
            review_count: "review_count",
            description: "", // 👈 prevents destructure error
        },
        recipes: {
            id: "recipe_id",
            title: "recipe_name",
            image: "image_path",
            slug: "recipe_slug",
            author: "recipe_author",
            content: "steps",
            published: "recipe_publish_date",
            rating: "recipe_rating",
            review_count: "recipe_review_count",
            description: "recipe_description",
        },
    };

    const fields = fieldMap[contentType];
    const contentId = data?.[fields.id];
    const title = data?.[fields.title];
    const imageFilename = data?.[fields.image];
    const author = data?.[fields.author];
    const content = data?.[fields.content];
    const published = data?.[fields.published];
    const rating = data?.[fields.rating];
    const review_count = data?.[fields.review_count];
    const description = data?.[fields.description];

    const imageDirectories: Record<string, string> = {
        articles: "/articleImages",
        recipes: "/recipes",
    };

    const imagePath = imageFilename ? `${imageDirectories[contentType]}/${imageFilename}` : undefined;

    const [isFavorited, setIsFavorited] = useState(false);

    // 👇 Login state + modal handling
    const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("token"));
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    const navigate = useNavigate();
    const goBack = () => {
        navigate(`/${contentType}`);
    };

    // Keep login state in sync with localStorage
    useEffect(() => {
        const handleStorageChange = () => {
            setIsLoggedIn(!!localStorage.getItem("token"));
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    // ⭐ On page load → check if this item is already favourited
    useEffect(() => {
        const fetchFavouriteStatus = async () => {
            if (!isLoggedIn || !contentId) return;

            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`http://localhost/api/${contentType}/favourite/status/${contentType}/${contentId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                });

                const result = await response.json();
                if (response.ok && result.success) {
                    setIsFavorited(result.isFavorited);
                }
            } catch (error) {
                console.error("Error checking favourite status:", error);
            }
        };

        fetchFavouriteStatus();
    }, [isLoggedIn, contentId, contentType]);

    // ⭐ Send favourite request to backend
    const handleFavouriteClick = async () => {
        if (!isLoggedIn) {
            setShowLoginPrompt(true);
            return;
        }

        if (!contentId) return;

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(`http://localhost/api/${contentType}/favourite`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    id: contentId,
                    type: contentType,
                }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // 👇 Toggle instead of always true
                setIsFavorited((prev) => !prev);
            } else {
                console.error(result.message || "Failed to update favourite");
            }
        } catch (error) {
            console.error("Error while sending favourite request:", error);
        }
    };

    function renderStars(rating: number) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        const stars = [];
        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <svg key={`full-${i}`} className="w-4 h-4 lg:h-8 lg:w-8 fill-current text-yellow-500" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.49 6.91l6.572-.955L10 0l2.938 5.955 6.572.955-4.755 4.635 1.123 6.545z" />
                </svg>
            );
        }

        if (hasHalfStar) {
            stars.push(
                <svg key="half" className="w-4 h-4 lg:h-8 lg:w-8 fill-current text-yellow-500" viewBox="0 0 20 20">
                    <defs>
                        <linearGradient id="half">
                            <stop offset="50%" stopColor="currentColor" />
                            <stop offset="50%" stopColor="transparent" stopOpacity="1" />
                        </linearGradient>
                    </defs>
                    <path
                        fill="url(#half)"
                        d="M10 15l-5.878 3.09 1.123-6.545L.49 6.91l6.572-.955L10 0l2.938 5.955 6.572.955-4.755 4.635 1.123 6.545z"
                    />
                </svg>
            );
        }

        for (let i = 0; i < emptyStars; i++) {
            stars.push(
                <svg key={`empty-${i}`} className="w-4 h-4 lg:h-8 lg:w-8 fill-current text-gray-300" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.49 6.91l6.572-.955L10 0l2.938 5.955 6.572.955-4.755 4.635 1.123 6.545z" />
                </svg>
            );
        }

        return stars;
    }

    function formatReviewCount(count: number) {
        if (count >= 1000) {
            return (count / 1000).toFixed(count % 1000 === 0 ? 0 : 1) + "k";
        }
        return count.toString();
    }

    const formattedDate = published ? format(new Date(published), "MMMM dd, yyyy") : "";

    return (
        <>
            <div className="min-h-screen w-full flex justify-center">
                <div className="h-full portrait:w-full portrait:p-6 landscape:w-1/2 flex flex-col gap-4">
                    <button
                        className="h-fit w-fit py-2 px-4 mt-4 text-xl select-none cursor-pointer text-white main-background rounded-lg font-semibold shadow-lg tracking-wider"
                        onClick={goBack}
                    >
                        BACK
                    </button>

                    {imagePath ? (
                        <img src={imagePath} alt={`${contentType} cover`} draggable="false" className="w-full select-none object-cover" />
                    ) : (
                        <p>No image available</p>
                    )}

                    <div className="flex flex-col w-full p-6 sm:portrait:p-8 md:portrait:p-10 sm:landscape:p-6 md:landscape:p-6 lg:landscape:p-8 main-background portrait:flex-col landscape:flex shadow-xl overflow-hidden">
                        <p className="text-white text-2xl select-none font-bold">{title}</p>

                        <div className="flex justify-between">
                            <div className="flex">
                                <p className="text-white text-base select-none font-normal">
                                    Date Published: <span className="font-semibold">{formattedDate}</span>
                                </p>
                            </div>
                            <div className="flex flex-col justify-center items-end gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="flex lg:gap-1">{rating && renderStars(parseFloat(rating))}</div>
                                    <span className="text-white font-bold select-none text-2xl">
                                        {rating ? parseFloat(rating).toFixed(1) : "-"}
                                    </span>
                                </div>
                                <p className="text-white text-xl font-normal select-none">
                                    {review_count !== undefined ? formatReviewCount(review_count) : "-"} reviews
                                </p>
                            </div>
                        </div>

                        <div draggable="false" className="flex select-none justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="h-16 w-16 rounded-full bg-gray-400"></div>
                                <p className="text-white text-2xl portrait:text-lg font-bold select-none">{author}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    className={`p-1.5 rounded-lg select-none cursor-pointer ${isFavorited ? "bg-green-100" : "bg-gray-300"}`}
                                    onClick={handleFavouriteClick}
                                >
                                    <img
                                        draggable="false"
                                        src={isFavorited ? HeartFilled : HeartUnfilled}
                                        className="h-10 w-10 select-none cursor-pointer transition-transform duration-150 active:scale-110"
                                        alt="Favourite"
                                    />
                                </button>
                                <button className="bg-gray-300 p-1.5 select-none cursor-pointer rounded-lg">
                                    <img draggable="false" src={ReportIcon} className="h-10 w-10 select-none cursor-pointer" alt="" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 👇 Rest of your content unchanged */}
                    <div draggable="false" className="flex flex-col py-8 gap-6 select-none">
                        {/* Recipe / Article body */}
                        <div className="flex select-none flex-col gap-8">
                            {contentType === "recipes" && (
                                <>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
                                            🥗 Nutritional Information
                                        </p>
                                        {data?.nutritional_value && typeof data.nutritional_value === "object" ? (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                                {Object.entries(data.nutritional_value).map(([key, value]) => (
                                                    <div
                                                        key={key}
                                                        className="flex flex-col items-center justify-center rounded-xl py-3 px-4 shadow-md hover:shadow-lg bg-[#253829] transition-shadow"
                                                    >
                                                        <p className="text-sm text-white uppercase tracking-wide">{key}</p>
                                                        <p className="text-xl font-semibold text-white">{value}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-base italic">No nutritional data available for this recipe.</p>
                                        )}
                                    </div>

                                    {data?.recipe_ingredients && (
                                        <div>
                                            <p className="text-2xl font-bold text-gray-800 mb-4 pb-2">🧂 Main Ingredients</p>
                                            <ul className="list-disc list-inside space-y-2 text-lg text-gray-800">
                                                {data.recipe_ingredients.split(",").map((ingredient: string, index: number) => (
                                                    <li key={index} className="capitalize">
                                                        {ingredient.trim()}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <p className="text-black text-xl font-normal">{description}</p>
                                    <p className="text-black text-xl font-semibold">Procedure: </p>

                                    {Array.isArray(data?.steps) && data.steps.length > 0 && (
                                        <div>
                                            <p className="text-2xl font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
                                                📝 Preparation Steps
                                            </p>
                                            <ol className="list-decimal list-inside space-y-3 text-lg text-gray-800">
                                                {data.steps.map((step: string, index: number) => (
                                                    <li key={index}>{step}</li>
                                                ))}
                                            </ol>
                                        </div>
                                    )}
                                </>
                            )}

                            {contentType === "articles" && (
                                <>
                                    {typeof content === "string" && content.length > 0 ? (
                                        content
                                            .split(".")
                                            .reduce((acc, sentence, index) => {
                                                const trimmed = sentence.trim();
                                                if (!trimmed) return acc;
                                                if (index % 2 === 0) {
                                                    acc.push(trimmed);
                                                } else {
                                                    acc[acc.length - 1] += ". " + trimmed;
                                                }
                                                return acc;
                                            }, [] as string[])
                                            .map((para, idx) => (
                                                <p key={idx} className="text-black text-xl font-normal mb-4">
                                                    {para}.
                                                </p>
                                            ))
                                    ) : (
                                        <p>No content available.</p>
                                    )}
                                </>
                            )}

                            <hr />
                        </div>

                        {/* ⭐ Rating block */}
                        <div className="flex flex-col mt-12">
                            <p className="text-black select-none font-normal text-xl text-center">Rate this {contentType}:</p>
                            <div className="flex justify-center">
                                {isLoggedIn ? (
                                    <StarRating contentType={contentType} disabled={false} className="w-8 h-8" />
                                ) : (
                                    <div onClick={() => setShowLoginPrompt(true)} className="flex gap-1 cursor-pointer">
                                        {[...Array(5)].map((_, i) => (
                                            <svg key={i} className="w-8 h-8 fill-current text-gray-300" viewBox="0 0 20 20">
                                                <path d="M10 15l-5.878 3.09 1.123-6.545L.49 6.91l6.572-.955L10 0l2.938 5.955 6.572.955-4.755 4.635 1.123 6.545z" />
                                            </svg>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <MoreContents />
                        </div>
                    </div>
                </div>
            </div>

            {/* Login Prompt Modal */}
            {showLoginPrompt && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-80">
                        <h2 className="text-lg font-semibold mb-4">Login Required</h2>
                        <p className="mb-4">You must log in to perform this action.</p>
                        <div className="flex justify-end gap-4">
                            <button
                                className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
                                onClick={() => setShowLoginPrompt(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                                onClick={() => navigate("/login")}
                            >
                                Login
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}