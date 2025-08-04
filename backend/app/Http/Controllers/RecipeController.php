<?php

namespace App\Http\Controllers;

use App\Models\Recipes;
use Illuminate\Http\Request;

class RecipeController extends Controller
{
    /**
     * Load all recipes
     */
    public function load()
    {
        try {
            $recipes = Recipes::all();
            
            return response()->json([
                'success' => true,
                'data' => $recipes,
                'count' => $recipes->count(),
                'message' => 'Recipes loaded successfully'
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error loading recipes: ' . $e->getMessage(),
                'data' => []
            ], 500);
        }
    }

    /**
     * Get all recipes with pagination and optional filtering
     */
    public function index(Request $request)
    {
        try {
            $query = Recipes::query();

            // Search functionality
            if ($request->has('search') && !empty($request->search)) {
                $query->search($request->search);
            }

            // Filter by category
            if ($request->has('category') && !empty($request->category)) {
                $query->byCategory($request->category);
            }

            // Filter by type
            if ($request->has('type') && !empty($request->type)) {
                $query->byType($request->type);
            }

            // Filter by minimum rating
            if ($request->has('min_rating') && !empty($request->min_rating)) {
                $query->byMinRating($request->min_rating);
            }

            // Sorting
            $sortBy = $request->get('sort_by', 'recipe_name');
            $sortOrder = $request->get('sort_order', 'asc');
            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = $request->get('per_page', 10);
            $recipes = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $recipes->items(),
                'pagination' => [
                    'current_page' => $recipes->currentPage(),
                    'total_pages' => $recipes->lastPage(),
                    'per_page' => $recipes->perPage(),
                    'total_items' => $recipes->total(),
                    'from' => $recipes->firstItem(),
                    'to' => $recipes->lastItem(),
                ],
                'message' => 'Recipes loaded successfully'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error loading recipes: ' . $e->getMessage(),
                'data' => []
            ], 500);
        }
    }

    /**
     * Get a single recipe by ID or slug
     */
    public function show($identifier)
    {
        try {
            // Try to find by ID first, then by slug
            $recipe = Recipes::where('recipe_id', $identifier)
                          ->orWhere('recipe_slug', $identifier)
                          ->first();

            if (!$recipe) {
                return response()->json([
                    'success' => false,
                    'message' => 'Recipe not found',
                    'data' => null
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $recipe,
                'message' => 'Recipe loaded successfully'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error loading recipe: ' . $e->getMessage(),
                'data' => null
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