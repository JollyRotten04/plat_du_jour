import { useEffect, useState } from "react";
import { useUser } from "../../UserContext";
import { useNavigate, useLocation } from "react-router-dom";
import ImageIcon from "@mui/icons-material/Image";

// ✅ Nutrition type
interface Nutrition {
  calories: string;
  protein: string;
  fat: string;
  carbohydrates: string;

  fiber?: string | null;
  sugar?: string | null;
  saturatedFat?: string | null;
  transFat?: string | null;
  cholesterol?: string | null;
  sodium?: string | null;
  potassium?: string | null;

  vitaminA?: string | null;
  vitaminC?: string | null;
  vitaminD?: string | null;
  vitaminE?: string | null;
  vitaminK?: string | null;
  calcium?: string | null;
  iron?: string | null;
  magnesium?: string | null;
  zinc?: string | null;
}

// Updated Recipe Categories (now 'type') and Types (now 'category')
const RECIPE_TYPES = [
  'Meat-Based', 'Keto', 'Seafood', 'Kosher', 'Mediterranean', 'Paleo', 'Vegetarian'
];
const RECIPE_CATEGORIES = [
  'Breakfast', 'Snack', 'Lunch', 'Dessert', 'Dinner'
];

const ARTICLE_CATEGORIES = [
  'Cooking', 'Health and Nutrition', 'Lifestyle', 'Food Science', 'Food Sustainability'
];

export default function CreateContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();

  const [cookTime, setCookTime] = useState("");
  const [recipeCategory, setRecipeCategory] = useState("");
  const [recipeType, setRecipeType] = useState("");
  const [articleCategory, setArticleCategory] = useState("");
  const [contentType, setContentType] = useState<"recipes" | "articles">("recipes");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([""]);
  const [steps, setSteps] = useState<string[]>([""]);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) setToken(storedToken);
  }, []);

  useEffect(() => {
    const pathParts = location.pathname.split("/");
    const lastSegment = pathParts[pathParts.length - 1];
    if (lastSegment === "recipes" || lastSegment === "articles") {
      setContentType(lastSegment);
    }
  }, [location.pathname]);

  const [nutrition, setNutrition] = useState<Nutrition>({
    calories: "",
    protein: "",
    fat: "",
    carbohydrates: "",
    fiber: null,
    sugar: null,
    saturatedFat: null,
    transFat: null,
    cholesterol: null,
    sodium: null,
    potassium: null,
    vitaminA: null,
    vitaminC: null,
    vitaminD: null,
    vitaminE: null,
    vitaminK: null,
    calcium: null,
    iron: null,
    magnesium: null,
    zinc: null,
  });

  const [imagePath, setImagePath] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleIngredientChange = (i: number, value: string) => {
    const updated = [...ingredients];
    updated[i] = value;
    setIngredients(updated);
  };
  const addIngredient = () => setIngredients([...ingredients, ""]);

  const handleStepChange = (i: number, value: string) => {
    const updated = [...steps];
    updated[i] = value;
    setSteps(updated);
  };
  const addStep = () => setSteps([...steps, ""]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePath(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    try {
      if (imageFile && imageFile.size > 2 * 1024 * 1024) {
        alert(`Image file is too large (${(imageFile.size / 1024 / 1024).toFixed(1)}MB). Please choose a file smaller than 2MB.`);
        return;
      }
      
      console.log("Submitting form data:", {
        contentType,
        title,
        description,
        ingredients,
        steps,
        nutrition,
        cookTime,
        recipeCategory,
        recipeType,
        token,
      });

      const formData = new FormData();
      formData.append("contentType", contentType);
      formData.append("title", title);
      formData.append("description", description);

      if (user) {
        formData.append("user_id", user.user_id.toString());
        formData.append("username", user.username);
        formData.append("email", user.email);
      }

      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (contentType === "recipes") {
        formData.append("ingredients", JSON.stringify(ingredients));
        formData.append("steps", JSON.stringify(steps));
        formData.append("nutrition", JSON.stringify(nutrition));
        formData.append("cook_time", cookTime);
        formData.append("recipe_category", recipeCategory);
        formData.append("recipe_type", recipeType);
      } else {
        formData.append("content", content);
        formData.append("article_category", articleCategory);
      }

      const url = `https://plat-du-jour.onrender.com/api/content/${contentType}`;
      console.log("Making request to:", url);

      const res = await fetch(url, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token || ""}`,
        },
        credentials: 'include',
      });

      const responseText = await res.text();

      if (!res.ok) {
        let userMessage = "An unknown error occurred. Please try again.";
        try {
          const errorData = JSON.parse(responseText);
          if (errorData && errorData.details) {
            // Check for the specific "Duplicate entry" error
            if (errorData.details.includes("Duplicate entry")) {
              userMessage = "This title already exists. Please choose a different title.";
            } else {
              userMessage = errorData.details;
            }
          }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (parseError) {
          // Fallback if the response is not valid JSON
          userMessage = "An unexpected error occurred. Please try again.";
        }

        // Show the user-friendly message
        alert(userMessage);
        return;
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse JSON:", parseError);
        throw new Error("Invalid JSON response from server");
      }

      console.log("✅ Content submitted successfully:", data);
      alert("Content published!");

      setTimeout(() => {
        navigate('/');
      }, 1000);

    } catch (err) {
      console.error("❌ Error submitting content:", err);
      // Fallback for network errors
      alert("An unexpected error occurred. Please check your network connection.");
    }
  };

  const goBack = () => {
    navigate(`/${contentType}`);
  };

  const RequiredStar = () => <span className="text-red-500">*</span>;

  return (
    <div className="min-h-screen w-full flex justify-center">
      <div className="h-full portrait:w-full portrait:p-6 landscape:w-1/2 flex flex-col gap-4">
        <button onClick={goBack} className="h-fit w-fit py-2 px-4 mt-4 text-xl select-none cursor-pointer text-white main-background rounded-lg font-semibold shadow-lg tracking-wider">
          BACK
        </button>

        {/* Image Upload */}
        <label className="w-full cursor-pointer relative block group">
          {imagePath ? (
            <img
              src={imagePath}
              alt="Cover placeholder"
              draggable="false"
              className="w-full h-auto object-contain rounded-lg"
            />
          ) : (
            <div className="w-full min-h-[16rem] flex items-center justify-center rounded-lg bg-gray-300 relative">
              <ImageIcon className="text-white text-8xl opacity-70" />
              <span className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition duration-300 rounded-lg" />
            </div>
          )}
          <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
        </label>

        {/* Title + Author */}
        <div className="flex flex-col w-full p-6 gap-4 main-background shadow-xl overflow-hidden">
          <label className="text-white text-lg font-semibold">
            Title <RequiredStar />
          </label>
          <input
            type="text"
            placeholder="Enter title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-white text-2xl font-bold bg-transparent border-b focus:outline-none truncate"
          />

          <div draggable={false} className="flex select-none justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="h-16 w-16 rounded-full bg-gray-400"></div>
              <p className="text-white text-2xl portrait:text-lg font-bold">{user?.username}</p>
            </div>
          </div>
        </div>

        {/* Content Form */}
        <div draggable={false} className="flex flex-col py-8 gap-6">
          <div className="flex flex-col gap-8">
            {contentType === "recipes" && (
              <>
                {/* Nutrition */}
                <div>
                  <p className="text-2xl font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
                    🥗 Nutritional Information
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.keys(nutrition).map((key) => {
                      const isRequired = ["calories", "protein", "fat", "carbohydrates"].includes(key);
                      return (
                        <div key={key} className="flex flex-col">
                          <label className="text-sm font-medium text-gray-700">
                            {key} {isRequired && <RequiredStar />}
                          </label>
                          <input
                            type="text"
                            placeholder={key}
                            value={nutrition[key as keyof typeof nutrition] ?? ""}
                            onChange={(e) => setNutrition({ ...nutrition, [key]: e.target.value })}
                            className="p-2 border rounded"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Cook Time */}
                <div>
                  <label className="text-lg font-semibold text-gray-800">
                    Cook Time <RequiredStar />
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 30 min"
                    value={cookTime}
                    onChange={(e) => setCookTime(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>

                {/* Recipe Category & Type */}
                <div className="flex gap-4">
                    <div className="w-1/2">
                        <label className="text-lg font-semibold text-gray-800">
                            Category <RequiredStar />
                        </label>
                        <select
                            value={recipeCategory}
                            onChange={(e) => setRecipeCategory(e.target.value)}
                            className="w-full p-2 border rounded"
                        >
                            <option value="" disabled>Select a Category</option>
                            {RECIPE_CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-1/2">
                        <label className="text-lg font-semibold text-gray-800">
                            Type <RequiredStar />
                        </label>
                        <select
                            value={recipeType}
                            onChange={(e) => setRecipeType(e.target.value)}
                            className="w-full p-2 border rounded"
                        >
                            <option value="" disabled>Select a Type</option>
                            {RECIPE_TYPES.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Ingredients */}
                <div>
                  <p className="text-2xl font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
                    🧂 Main Ingredients <RequiredStar />
                  </p>
                  {ingredients.map((ingredient, i) => (
                    <input
                      key={i}
                      type="text"
                      value={ingredient}
                      placeholder={`Ingredient ${i + 1}`}
                      onChange={(e) => handleIngredientChange(i, e.target.value)}
                      className="w-full mb-2 p-2 border rounded"
                    />
                  ))}
                  <button type="button" onClick={addIngredient} className="text-blue-600 underline">
                    + Add Ingredient
                  </button>
                </div>

                {/* Description */}
                <div>
                  <label className="text-lg font-semibold text-gray-800">
                    Description <RequiredStar />
                  </label>
                  <textarea
                    placeholder="Enter description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>

                {/* Steps */}
                <div>
                  <p className="text-2xl font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
                    📝 Preparation Steps <RequiredStar />
                  </p>
                  {steps.map((step, i) => (
                    <input
                      key={i}
                      type="text"
                      value={step}
                      placeholder={`Step ${i + 1}`}
                      onChange={(e) => handleStepChange(i, e.target.value)}
                      className="w-full mb-2 p-2 border rounded"
                    />
                  ))}
                  <button type="button" onClick={addStep} className="text-blue-600 underline">
                    + Add Step
                  </button>
                </div>
              </>
            )}

            {/* Articles */}
            {contentType === "articles" && (
                <div className="flex flex-col gap-4">
                    {/* Article Content */}
                    <div>
                        <label className="text-lg font-semibold text-gray-800">
                            Article Content <RequiredStar />
                        </label>
                        <textarea
                            placeholder="Write your article..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full p-2 border rounded h-40"
                        />
                    </div>
                    {/* Article Category */}
                    <div>
                        <label className="text-lg font-semibold text-gray-800">
                            Category <RequiredStar />
                        </label>
                        <select
                            value={articleCategory}
                            onChange={(e) => setArticleCategory(e.target.value)}
                            className="w-full p-2 border rounded"
                        >
                            <option value="" disabled>Select a Category</option>
                            {ARTICLE_CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            <hr />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            className="py-3 px-6 bg-green-600 text-white rounded-lg font-semibold shadow-lg hover:bg-green-700"
          >
            Publish
          </button>
        </div>
      </div>
    </div>
  );
}