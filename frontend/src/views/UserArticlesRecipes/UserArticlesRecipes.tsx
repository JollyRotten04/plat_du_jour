import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaStar, FaRegStar } from "react-icons/fa";

type Item = {
  recipe_id?: number;
  recipe_name?: string;
  recipe_description?: string;
  recipe_author?: string;
  recipe_publish_date?: string;
  recipe_rating?: number;
  image_path?: string;
  recipe_slug?: string;

  article_id?: number;
  article_title?: string;
  article_summary?: string;
  article_author?: string;
  article_published_at?: string;
  article_rating?: number;
  article_image_path?: string;
  article_slug?: string;

  id?: number;
  title?: string;
  author?: string;
  created_at?: string;
  rating?: number;
};

type PaginationData = {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
};

export default function UserArticlesRecipes() {
  const location = useLocation();
  const navigate = useNavigate();

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageTitle, setPageTitle] = useState("");
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const getPageConfig = () => {
    const path = location.pathname.toLowerCase();
    const type: "recipe" | "article" = path.includes("recipe") ? "recipe" : "article";

    let category: "authored" | "favourite" = "authored";
    if ((path.includes("/user/recipes") || path.includes("/user/articles")) && !path.includes("/my-"))
      category = "favourite";
    if (path.includes("/my-")) category = "authored";

    const title =
      category === "favourite"
        ? `Favourite ${type === "recipe" ? "Recipes" : "Articles"}`
        : `My ${type === "recipe" ? "Recipes" : "Articles"}`;

    const endpoint = `${type === "recipe" ? "recipes" : "articles"}/show-all`;
    return { type, category, title, endpoint };
  };

  const fetchData = async (page: number = 1) => {
    const config = getPageConfig();
    setPageTitle(config.title);
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to view this content");
        setLoading(false);
        return;
      }

      const response = await fetch(`http://localhost/api/${config.endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: config.type,
          category: config.category,
          page: page,
          per_page: 12,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setItems(result.data || []);
        setPagination(result.pagination || null);
        setCurrentPage(page);
        setError(null);
      } else {
        setError(result.message || "Failed to fetch data");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (pagination && newPage >= 1 && newPage <= pagination.last_page) {
      fetchData(newPage);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, [location.pathname]);

  const fetchContent = (contentType: "recipes" | "articles", slug: string, data: any) => {
    console.log("Navigating to content:", { contentType, slug, data }); // <-- Log object
    navigate(`/view-content/${contentType}/${slug}`, { state: { data } });
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-black text-xl animate-pulse">Loading...</div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-black text-xl">{error}</div>
      </div>
    );

  return (
    <div className="min-h-screen w-full p-6 bg-white">
      <h1 className="text-black text-3xl font-bold mb-6">{pageTitle}</h1>

      {pagination && pagination.total > 0 && (
        <div className="text-black text-sm mb-6">
          Showing {pagination.from} to {pagination.to} of {pagination.total} results
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-black text-lg text-center mt-8">
          No {pageTitle.toLowerCase()} found.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item) => {
              const isRecipe = !!item.recipe_id;
              const id = item.recipe_id || item.article_id || item.id;
              const title = item.recipe_name || item.article_title || item.title;
              const author = item.recipe_author || item.article_author || item.author;
              const rating = item.recipe_rating || item.article_rating || item.rating;
              const publishDate = item.recipe_publish_date || item.article_published_at || item.created_at;
              const slug = isRecipe ? item.recipe_slug : item.article_slug;

              let image = "";
              if (isRecipe && item.image_path) image = `/recipes/${item.image_path}`;
              else if (!isRecipe && item.article_image_path) image = `/articleImages/${item.article_image_path}`;

              console.log("Item object:", item, "Resolved image path:", image); // <-- Log image path

              return (
                <div
                  key={id}
                  className="relative group rounded-lg overflow-hidden shadow-lg cursor-pointer bg-[#2a372d] transition transform hover:scale-105"
                  onClick={() => slug && fetchContent(isRecipe ? "recipes" : "articles", slug, item)}
                >
                  {image && (
                    <img
                      src={image}
                      alt={title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-white mb-1">{title}</h3>
                    {author && <p className="text-sm text-white mb-1">By: {author}</p>}
                    {rating !== undefined && (
                      <div className="flex items-center mb-1">
                        {Array.from({ length: 5 }, (_, i) =>
                          i < rating ? (
                            <FaStar key={i} className="text-yellow-400 mr-1" />
                          ) : (
                            <FaRegStar key={i} className="text-gray-300 mr-1" />
                          )
                        )}
                      </div>
                    )}
                    {publishDate && <p className="text-xs text-gray-400">Published: {new Date(publishDate).toLocaleDateString()}</p>}
                  </div>
                </div>
              );
            })}
          </div>

          {pagination && pagination.last_page > 1 && (
            <div className="flex justify-center items-center mt-10 space-x-3">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white text-green-600 rounded shadow disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
              >
                Previous
              </button>

              <div className="flex space-x-2">
                {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 rounded shadow ${
                        currentPage === pageNum
                          ? "bg-white text-green-600 font-bold"
                          : "bg-green-400 text-white hover:bg-green-300 transition"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.last_page}
                className="px-4 py-2 bg-white text-green-600 rounded shadow disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
