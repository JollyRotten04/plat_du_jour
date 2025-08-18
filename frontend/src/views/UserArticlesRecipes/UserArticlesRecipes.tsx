import { useLocation } from "react-router-dom";

type Item = {
  id: number;
  title: string;
};

const mockMyRecipes: Item[] = [
  { id: 1, title: "My Recipe 1" },
  { id: 2, title: "My Recipe 2" },
  { id: 3, title: "My Recipe 3" },
];

const mockMyArticles: Item[] = [
  { id: 1, title: "My Article 1" },
  { id: 2, title: "My Article 2" },
  { id: 3, title: "My Article 3" },
];

const mockFavRecipes: Item[] = [
  { id: 1, title: "Favourite Recipe 1" },
  { id: 2, title: "Favourite Recipe 2" },
  { id: 3, title: "Favourite Recipe 3" },
];

const mockFavArticles: Item[] = [
  { id: 1, title: "Favourite Article 1" },
  { id: 2, title: "Favourite Article 2" },
  { id: 3, title: "Favourite Article 3" },
];

export default function UserArticlesRecipes() {
  const location = useLocation();
  const path = location.pathname;

  let pageTitle = "";
  let items: Item[] = [];

  if (path.includes("my-recipes")) {
    pageTitle = "My Recipes";
    items = mockMyRecipes;
  } else if (path.includes("my-articles")) {
    pageTitle = "My Articles";
    items = mockMyArticles;
  } else if (path.includes("recipes")) {
    pageTitle = "Favourite Recipes";
    items = mockFavRecipes;
  } else if (path.includes("articles")) {
    pageTitle = "Favourite Articles";
    items = mockFavArticles;
  }

  return (
    <div className="h-full w-full p-4 bg-green-500">
      <h1 className="text-white text-2xl font-bold mb-4">{pageTitle}</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-4 bg-white rounded-lg shadow hover:bg-[#2a372d] hover:text-white transition-colors duration-300"
          >
            {item.title}
          </div>
        ))}
      </div>
    </div>
  );
}
