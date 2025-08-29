import { useState, useRef, useLayoutEffect, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import LoadingIcon from "../../components/LoadingIcon/LoadingIcon";

export default function MoreContents({ currentPage }: { currentPage: string }) {
  // ------------------ Types ------------------
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

  type Article = {
    article_id: number;
    article_title: string;
    article_excerpt: string;
    article_author: string;
    article_slug: string;
    image_path: string;
    article_publish_date: string;
  };

  type RecipeResponse = {
    success: boolean;
    data: Recipe[];
    message?: string;
  };

  type ArticleResponse = {
    success: boolean;
    data: Article[];
    message?: string;
  };

  // ------------------ State ------------------
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedItem] = useState<Recipe | Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const location = useLocation();

  // ------------------ Fetch Logic ------------------
  const fetchRecipes = async () => {
    try {
      setIsLoading(true);
      const url = `${API_BASE_URL}/api/recipes/load`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data: RecipeResponse = await response.json();
      if (data.success) setRecipes(data.data);
    } catch (err) {
      console.error("Error fetching recipes:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      const url = `${API_BASE_URL}/api/articles/load`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data: ArticleResponse = await response.json();
      if (data.success) setArticles(data.data);
    } catch (err) {
      console.error("Error fetching articles:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // ------------------ Determine what to fetch ------------------
  const urlForcesArticles = location.pathname.startsWith("/view-content/articles/");

  useEffect(() => {
    if (urlForcesArticles) {
      fetchArticles();
    } else {
      fetchRecipes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, urlForcesArticles]);

  // ------------------ Drag State ------------------
  const containerRef = useRef(null);
  const sliderRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [actualContentWidth, setActualContentWidth] = useState(0);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragDeltaX, setDragDeltaX] = useState(0);
  const [position, setPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [transitionEnabled, setTransitionEnabled] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);

  const showingArticles = urlForcesArticles;
  const items = showingArticles ? articles : recipes;
  const gapPx = 32;
  const slideCount = items.length;
  const dragThreshold = 5;

  const getItemWidth = () => {
    if (typeof window !== "undefined") {
      const isPortrait = window.innerHeight > window.innerWidth;
      const isSmall = window.innerWidth < 640;
      if (isPortrait) return 350;
      if (isSmall) return 280;
      return 320;
    }
    return 320;
  };

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

  const handleDragStart = (clientX: number) => {
    setDragStartX(clientX);
    setIsDragging(true);
    setTransitionEnabled(false);
    setHasDragged(false);
  };

  const handleDragMove = (clientX: number) => {
    if (dragStartX === null) return;
    const deltaX = clientX - dragStartX;
    setDragDeltaX(deltaX);
    if (Math.abs(deltaX) > dragThreshold) setHasDragged(true);
  };

  const handleDragEnd = () => {
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
    if (targetIndex === finalMaxIndex) snappedPosition = -maxScrollDistance;

    setPosition(clamp(snappedPosition, -maxScrollDistance, 0));
    setDragStartX(null);
    setDragDeltaX(0);
    setIsDragging(false);
    setTransitionEnabled(true);
  };

  useLayoutEffect(() => {
    if (!containerRef.current || !sliderRef.current) return;
    const updateMeasurements = () => {
      if (containerRef.current) setContainerWidth((containerRef.current as HTMLElement).clientWidth);
      if (sliderRef.current) setActualContentWidth((sliderRef.current as HTMLElement).scrollWidth);
    };

    const observer = new ResizeObserver(() => setTimeout(updateMeasurements, 50));
    if (containerRef.current) observer.observe(containerRef.current);
    updateMeasurements();
    setTimeout(updateMeasurements, 100);
    setTimeout(updateMeasurements, 300);
    return () => observer.disconnect();
  }, []);

  const clampedOffset = clamp(position + dragDeltaX, -maxScrollDistance, 0);

  // ------------------ Navigation ------------------
  const navigate = useNavigate();
  const viewContent = (
    contentType: "recipes" | "articles",
    slug: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any
  ) => {
    navigate(`/view-content/${contentType}/${slug}`, { state: { data, currentPage } });
    window.scrollTo({ top: 0, behavior: "smooth" }); // <-- force scroll to top
  };

  const formatReviewCount = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  // ------------------ UI ------------------
  return (
    <div className="w-full p-6 bg-gray-100 overflow-hidden shadow-lg rounded-xl h-fit relative min-h-[300px]">
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10">
          <LoadingIcon size="w-12 h-12" color="text-blue-600" />
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="mb-6 flex items-center">
            <div className="w-full bg-black h-0.5"></div>
            <h2 className="text-3xl text-black font-semibold mb-2 select-none text-nowrap px-4">
              {showingArticles ? "Articles To Explore" : "Recipes To Inspire"}
            </h2>
            <div className="w-full bg-black h-0.5"></div>
          </div>

          <hr className="text-black h-px mb-6" />

          <div
            ref={containerRef}
            className="relative w-full h-fit overflow-y-visible overflow-x-auto scrollbar-hidden touch-pan-x"
            onMouseDown={(e) => handleDragStart(e.clientX)}
            onMouseMove={(e) => isDragging && handleDragMove(e.clientX)}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
            onTouchMove={(e) => isDragging && handleDragMove(e.touches[0].clientX)}
            onTouchEnd={handleDragEnd}
            onDragStart={(e) => e.preventDefault()}
          >
            <div
              ref={sliderRef}
              className="flex"
              draggable={false}
              style={{
                gap: `${gapPx}px`,
                transform: `translateX(${clampedOffset}px)`,
                transition: transitionEnabled ? "transform 0.3s ease-out" : "none",
                cursor: isDragging ? "grabbing" : "grab",
                width: "fit-content",
              }}
            >
              {showingArticles
                ? articles.map((article) => (
                    <div
                      key={article.article_id}
                      className="relative rounded-lg bg-white shadow-lg flex-shrink-0 transition-transform duration-200 hover:scale-105"
                      onClick={(e) => {
                        if (hasDragged) {
                          e.preventDefault();
                          return;
                        }
                        viewContent("articles", article.article_slug, article);
                      }}
                      style={{
                        width: itemWidth,
                        minHeight: "280px",
                        cursor: "pointer",
                      }}
                    >
                      <img
                        src={`/articleImages/${article.image_path}` || "/placeholder.png"}
                        alt={article.article_title}
                        className="rounded-t-lg select-none object-cover w-full h-40"
                        draggable={false}
                      />
                      <div className="relative w-full p-4">
                        <h3
                          className={`text-lg font-semibold select-none truncate ${
                            article.article_title.length > 20 ? "animate-marquee" : ""
                          }`}
                          title={article.article_title}
                        >
                          {article.article_title}
                        </h3>
                        <p className="text-sm text-gray-700 line-clamp-3 select-none">
                          {article.article_excerpt}
                        </p>
                      </div>
                    </div>
                  ))
                : recipes.map((recipe) => (
                    <div
                      key={recipe.recipe_id}
                      className="relative rounded-lg bg-white shadow-lg flex-shrink-0 transition-transform duration-200 hover:scale-105"
                      onClick={(e) => {
                        if (hasDragged) {
                          e.preventDefault();
                          return;
                        }
                        viewContent("recipes", recipe.recipe_slug, recipe);
                      }}
                      style={{
                        width: itemWidth,
                        minHeight: "280px",
                        cursor: "pointer",
                      }}
                    >
                      <img
                        src={`/recipes/${recipe.image_path}` || "/placeholder.png"}
                        alt={recipe.recipe_name}
                        className="rounded-t-lg select-none object-cover w-full h-40"
                        draggable={false}
                      />
                      <div className="p-4">
                        <h3 className="text-lg font-semibold select-none">{recipe.recipe_name}</h3>
                        <p className="text-sm text-gray-700 line-clamp-3 select-none">
                          {recipe.recipe_description}
                        </p>
                      </div>
                      <div className="absolute bottom-2 left-2 text-sm text-gray-600 bg-white bg-opacity-80 rounded px-2 py-1 flex items-center gap-1">
                        <svg className="w-4 h-4 fill-current text-yellow-500" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.49 6.91l6.572-.955L10 0l2.938 5.955 6.572.955-4.755 4.635 1.123 6.545z" />
                        </svg>
                        <span className="select-none">{recipe.recipe_rating}</span>
                        <span className="ml-2 text-gray-500 select-none">
                          ({formatReviewCount(recipe.recipe_review_count)})
                        </span>
                      </div>
                    </div>
                  ))}
            </div>
          </div>
        </>
      )}

      {!isDragging && !selectedItem && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none mt-20">
          <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            Drag to explore {showingArticles ? "articles" : "recipes"}
          </div>
        </div>
      )}
    </div>
  );
}
