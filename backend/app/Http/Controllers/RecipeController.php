<?php

namespace App\Http\Controllers;

use App\Models\Recipes;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class RecipeController extends Controller
{
    /**
     * Load all recipes
     */
    public function load(Request $request)
    {
        try {

            $recipes = collect();
            $filtersApplied = [];

            // Normalize and extract parameters
            $searchTerm = strtolower(trim($request->get('search', '')));
            $diet = strtolower(trim($request->get('diet', '')));
            $mealType = strtolower(trim($request->get('meal_type', '')));

            // Apply only one filter based on presence (search > diet > meal_type)
            if (!empty($searchTerm)) {
                \Log::info("Applying search filter: {$searchTerm}");
                $filtersApplied['search'] = $searchTerm;

                $recipes = Recipes::search($searchTerm)->get();
            } elseif (!empty($diet)) {
                \Log::info("Applying diet filter (as recipe_type): {$diet}");
                $filtersApplied['diet'] = $diet;

                $recipes = Recipes::where('recipe_type', 'LIKE', "%{$diet}%")->get();
            } elseif (!empty($mealType)) {
                \Log::info("Applying meal_type filter (as recipe_category): {$mealType}");
                $filtersApplied['meal_type'] = $mealType;

                $recipes = Recipes::where('recipe_category', 'LIKE', "%{$mealType}%")->get();
            } else {
                \Log::info('No filters applied, returning all recipes');
                $recipes = Recipes::all();
            }

            // Deduplicate by recipe_id
            $originalCount = $recipes->count();
            $recipes = $recipes->unique('recipe_id')->values();
            $finalCount = $recipes->count();

            \Log::info("Recipes before deduplication: {$originalCount}");
            \Log::info("Recipes after deduplication: {$finalCount}");
            \Log::info("Final recipe IDs: " . json_encode($recipes->pluck('recipe_id')));

            \Log::info('Filters applied: ' . json_encode($filtersApplied));
            \Log::info('=== RECIPE FILTER REQUEST END ===');

            return response()->json([
                'success' => true,
                'data' => $recipes,
                'count' => $finalCount,
                'filters_applied' => $filtersApplied,
                'debug_info' => [
                    'original_count' => $originalCount,
                    'final_count' => $finalCount,
                    'duplicates_removed' => $originalCount - $finalCount,
                    'request_data' => $request->all()
                ],
                'message' => 'Recipes loaded successfully'
            ], 200);
        } catch (\Exception $e) {
            \Log::error('Recipe filter error: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => 'Error loading recipes: ' . $e->getMessage(),
                'data' => [],
                'debug_info' => [
                    'request_data' => $request->all(),
                    'error_line' => $e->getLine(),
                    'error_file' => $e->getFile()
                ]
            ], 500);
        }
    }

    public function fetchAvailable(Request $request)
{
    try {
        $availableIngredients = $request->input('availableIngredients', []);

        if (!is_array($availableIngredients) || empty($availableIngredients)) {
            return response()->json([
                'success' => false,
                'message' => 'availableIngredients must be a non-empty array',
                'data' => []
            ], 400);
        }

        // Normalize input ingredients
        $availableIngredients = array_map(fn($item) => strtolower(trim($item)), $availableIngredients);

        $recipes = Recipes::all();

        // Helper function: check if $needle is substring of any $haystacks
        $ingredientMatchesAvailable = function(string $ingredient, array $availableIngredients): bool {
            foreach ($availableIngredients as $avail) {
                if (str_contains($ingredient, $avail)) {
                    return true;
                }
            }
            return false;
        };

        // Strict matches: every recipe ingredient matches at least one available ingredient substring
        $strictMatches = $recipes->filter(function ($recipe) use ($availableIngredients, $ingredientMatchesAvailable) {
            $recipeIngredients = array_map(fn($i) => strtolower(trim($i)), explode(',', $recipe->recipe_ingredients));
            foreach ($recipeIngredients as $ingredient) {
                if (!$ingredientMatchesAvailable($ingredient, $availableIngredients)) {
                    return false;
                }
            }
            return true;
        });

        // Partial matches: at least one recipe ingredient matches available ingredient substrings, excluding strict matches
        $partialMatches = $recipes->filter(function ($recipe) use ($availableIngredients, $ingredientMatchesAvailable, $strictMatches) {
            if ($strictMatches->contains($recipe)) {
                return false;
            }
            $recipeIngredients = array_map(fn($i) => strtolower(trim($i)), explode(',', $recipe->recipe_ingredients));
            foreach ($recipeIngredients as $ingredient) {
                if ($ingredientMatchesAvailable($ingredient, $availableIngredients)) {
                    return true;
                }
            }
            return false;
        });

        $combined = $strictMatches->merge($partialMatches)->values();

        return response()->json([
            'success' => true,
            'count' => $combined->count(),
            'data' => $combined,
            'message' => 'Filtered recipes loaded successfully',
            'request_data' => $request->all()
        ], 200);

    } catch (\Exception $e) {
        \Log::error('Error in fetchAvailable: ' . $e->getMessage());
        \Log::error($e->getTraceAsString());

        return response()->json([
            'success' => false,
            'message' => 'Error fetching available recipes: ' . $e->getMessage(),
            'data' => []
        ], 500);
    }
}

    /**
     * Store a new recipe
     */
    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'recipe_name' => 'required|string|max:100|unique:recipes,recipe_name',
                'recipe_description' => 'nullable|string|max:255',
                'recipe_ingredients' => 'required|string',
                'recipe_rating' => 'nullable|numeric|between:0,5',
                'recipe_cooktime' => 'required|string|max:50',
                'recipe_category' => 'required|string|max:50',
                'recipe_type' => 'required|string|max:50',
                'image_path' => 'required|string|max:255',
                'recipe_calories' => 'nullable|integer|min:0',
                'recipe_author' => 'required|string|max:100',
                'steps' => 'required|array',
                'nutritional_value' => 'nullable|array',
            ]);

            $recipe = Recipes::create($validatedData);

            return response()->json([
                'success' => true,
                'data' => $recipe,
                'message' => 'Recipe created successfully'
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating recipe: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update an existing recipe
     */
    public function update(Request $request, $id)
    {
        try {
            $recipe = Recipes::findOrFail($id);

            $validatedData = $request->validate([
                'recipe_name' => 'sometimes|required|string|max:100|unique:recipes,recipe_name,' . $id . ',recipe_id',
                'recipe_description' => 'nullable|string|max:255',
                'recipe_ingredients' => 'sometimes|required|string',
                'recipe_rating' => 'nullable|numeric|between:0,5',
                'recipe_cooktime' => 'sometimes|required|string|max:50',
                'recipe_category' => 'sometimes|required|string|max:50',
                'recipe_type' => 'sometimes|required|string|max:50',
                'image_path' => 'sometimes|required|string|max:255',
                'recipe_calories' => 'nullable|integer|min:0',
                'recipe_author' => 'sometimes|required|string|max:100',
                'steps' => 'sometimes|required|array',
                'nutritional_value' => 'nullable|array',
            ]);

            $recipe->update($validatedData);

            return response()->json([
                'success' => true,
                'data' => $recipe->fresh(),
                'message' => 'Recipe updated successfully'
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Recipe not found'
            ], 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating recipe: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a recipe
     */
    public function destroy($id)
    {
        try {
            $recipe = Recipes::findOrFail($id);
            $recipe->delete();

            return response()->json([
                'success' => true,
                'message' => 'Recipe deleted successfully'
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Recipe not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting recipe: ' . $e->getMessage()
            ], 500);
        }
    }
}