<?php

namespace App\Http\Controllers;

use App\Models\Recipes;
use App\Models\Articles;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class CreateContentController extends Controller
{
    public function store(Request $request)
    {
        // Test database connection first
        try {
            DB::connection()->getPdo();
            Log::info('Database connection successful');
        } catch (\Exception $e) {
            Log::error('Database connection failed: ' . $e->getMessage());
            return response()->json(['error' => 'Database connection failed'], 500);
        }

        // Log incoming request except the image
        Log::info('Incoming CreateContent request inputs:', $request->except('image'));

        // Log image if present
        if ($request->hasFile('image')) {
            Log::info('Incoming file:', ['image_name' => $request->file('image')->getClientOriginalName()]);
        }

        // Validate inputs
        try {
            $validated = $request->validate([
                'contentType'     => ['required', Rule::in(['recipes', 'articles'])],
                'title'           => ['required', 'string', 'max:255'],
                'description'     => ['nullable', 'string'],
                'user_id'         => ['nullable', 'integer'],
                'username'        => ['nullable', 'string', 'max:255'],
                'email'           => ['nullable', 'email', 'max:255'],
                'content'         => ['nullable', 'string'],
                'ingredients'     => ['nullable', 'string'], // JSON string
                'steps'           => ['nullable', 'string'], // JSON string
                'nutrition'       => ['nullable', 'string'], // JSON string
                'image'           => ['nullable', 'file', 'image', 'max:5120'],
                'cook_time'       => ['nullable', 'string', 'max:50'],
                'recipe_category' => ['nullable', 'string', 'max:255'],
                'recipe_type'     => ['nullable', 'string', 'max:255'],
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation failed:', $e->errors());
            return response()->json(['error' => 'Validation failed', 'details' => $e->errors()], 422);
        }

        $contentType = $validated['contentType'];

        // Parse JSON arrays safely with error handling
        try {
            $ingredients = [];
            $steps = [];
            $nutrition = [];

            if ($request->filled('ingredients')) {
                $ingredients = json_decode($request->input('ingredients'), true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    throw new \Exception('Invalid ingredients JSON: ' . json_last_error_msg());
                }
            }

            if ($request->filled('steps')) {
                $steps = json_decode($request->input('steps'), true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    throw new \Exception('Invalid steps JSON: ' . json_last_error_msg());
                }
            }

            if ($request->filled('nutrition')) {
                $nutrition = json_decode($request->input('nutrition'), true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    throw new \Exception('Invalid nutrition JSON: ' . json_last_error_msg());
                }
            }

            Log::info('JSON parsing successful', [
                'ingredients_count' => count($ingredients),
                'steps_count' => count($steps),
                'nutrition_keys' => array_keys($nutrition)
            ]);

        } catch (\Exception $e) {
            Log::error('JSON parsing error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to parse JSON data', 'details' => $e->getMessage()], 400);
        }

        // Handle image upload to specific folders with error handling
        $imagePath = null;
        if ($request->hasFile('image')) {
            try {
                Log::info('Processing image upload...');
                
                if ($contentType === 'recipes') {
                    $imagePath = $request->file('image')->store('recipes', 'public');
                } else { // articles
                    $imagePath = $request->file('image')->store('articlesImage', 'public');
                }
                
                Log::info('Image uploaded successfully: ' . $imagePath);
                
            } catch (\Exception $e) {
                Log::error('Image upload failed: ' . $e->getMessage());
                return response()->json(['error' => 'Image upload failed', 'details' => $e->getMessage()], 500);
            }
        }

        if ($contentType === 'recipes') {
            try {
                // Prepare the recipe data
                $recipeData = [
                    'recipe_name'        => $request->input('title'),
                    'recipe_description' => $request->input('description'),
                    'recipe_ingredients' => $ingredients,
                    'steps'              => $steps,
                    'nutritional_value'  => $nutrition,
                    'recipe_author'      => $request->input('username') ?? 'Anonymous',
                    'image_path'         => $imagePath,
                    'recipe_cooktime'    => $request->input('cook_time'),
                    'recipe_category'    => $request->input('recipe_category') ?? '',
                    'recipe_type'        => $request->input('recipe_type') ?? '',
                    'recipe_slug'        => Str::slug($request->input('title') . '-' . uniqid()),
                    'recipe_rating'      => 0,
                    'recipe_review_count'=> 0,
                    'recipe_publish_date'=> now(),
                ];

                Log::info('Creating recipe with data:', $recipeData);

                // Create the recipe
                $recipe = Recipes::create($recipeData);

                Log::info('Recipe created successfully with ID: ' . $recipe->recipe_id);

                return response()->json([
                    'message' => 'Recipe created successfully',
                    'data' => [
                        'id'    => $recipe->recipe_id,
                        'title' => $recipe->recipe_name,
                        'type'  => 'recipe',
                        'slug'  => $recipe->recipe_slug,
                        'image' => $recipe->image_path ? url('storage/'.$recipe->image_path) : null,
                    ],
                ], 201);

            } catch (\Illuminate\Database\QueryException $e) {
                Log::error('Database error creating recipe: ' . $e->getMessage());
                Log::error('SQL Error Code: ' . $e->getCode());
                Log::error('SQL Error Info: ', $e->errorInfo ?? []);
                
                return response()->json([
                    'error' => 'Database error while creating recipe',
                    'details' => $e->getMessage(),
                    'code' => $e->getCode()
                ], 500);
                
            } catch (\Exception $e) {
                Log::error('General error creating recipe: ' . $e->getMessage());
                Log::error('Stack trace: ' . $e->getTraceAsString());
                
                return response()->json([
                    'error' => 'Failed to create recipe',
                    'details' => $e->getMessage()
                ], 500);
            }

        } else {
            // Create an article
            try {
                $articleData = [
                    'article_title'      => $request->input('title'),
                    'article_summary'    => $request->input('description'),
                    'article_content'    => $request->input('content'),
                    'article_author'     => $request->input('username') ?? 'Anonymous',
                    'article_image_path' => $imagePath,
                    'article_slug'       => Str::slug($request->input('title') . '-' . uniqid()),
                    'article_published_at' => now(),
                ];

                Log::info('Creating article with data:', $articleData);

                $article = Articles::create($articleData);

                Log::info('Article created successfully with ID: ' . $article->article_id);

                return response()->json([
                    'message' => 'Article created successfully',
                    'data' => [
                        'id'    => $article->article_id,
                        'title' => $article->article_title,
                        'type'  => 'article',
                        'slug'  => $article->article_slug,
                        'image' => $article->article_image_path ? url('storage/'.$article->article_image_path) : null,
                    ],
                ], 201);

            } catch (\Illuminate\Database\QueryException $e) {
                Log::error('Database error creating article: ' . $e->getMessage());
                Log::error('SQL Error Code: ' . $e->getCode());
                
                return response()->json([
                    'error' => 'Database error while creating article',
                    'details' => $e->getMessage(),
                    'code' => $e->getCode()
                ], 500);
                
            } catch (\Exception $e) {
                Log::error('General error creating article: ' . $e->getMessage());
                Log::error('Stack trace: ' . $e->getTraceAsString());
                
                return response()->json([
                    'error' => 'Failed to create article',
                    'details' => $e->getMessage()
                ], 500);
            }
        }
    }
}