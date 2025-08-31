<?php

namespace App\Http\Controllers;

use App\Models\Recipes;
use App\Models\Articles;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class CreateContentController extends Controller
{
    public function store(Request $request)
    {
        Log::info('Incoming CreateContent request inputs:', $request->except('image'));

        if ($request->hasFile('image')) {
            Log::info('Incoming file:', ['image_name' => $request->file('image')->getClientOriginalName()]);
        }

        // Validate inputs
        $validated = $request->validate([
            'contentType'    => ['required', Rule::in(['recipes', 'articles'])],
            'title'          => ['required', 'string', 'max:255'],
            'description'    => ['nullable', 'string'],
            'user_id'        => ['nullable', 'integer'],
            'username'       => ['nullable', 'string', 'max:255'],
            'email'          => ['nullable', 'email', 'max:255'],
            'content'        => ['nullable', 'string'],
            'ingredients'    => ['nullable', 'string'], // JSON string
            'steps'          => ['nullable', 'string'], // JSON string
            'nutrition'      => ['nullable', 'string'], // JSON string
            'image'          => ['nullable', 'file', 'image', 'max:5120'],
            'cook_time'      => ['nullable', 'string', 'max:50'],
            'recipe_category'=> ['nullable', 'string', 'max:255'],
            'recipe_type'    => ['nullable', 'string', 'max:255'],
        ]);

        $contentType = $validated['contentType'];

        // Parse JSON arrays safely
        $ingredients = $request->filled('ingredients') ? json_decode($request->input('ingredients'), true) : [];
        $steps       = $request->filled('steps') ? json_decode($request->input('steps'), true) : [];
        $nutrition   = $request->filled('nutrition') ? json_decode($request->input('nutrition'), true) : [];

        // Handle image upload
        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('recipes', 'public');
        }

        if ($contentType === 'recipes') {
            $recipe = Recipes::create([
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
            ]);

            return response()->json([
                'message' => 'Recipe created',
                'data' => [
                    'id'    => $recipe->recipe_id,
                    'title' => $recipe->recipe_name,
                    'type'  => 'recipe',
                    'image' => $recipe->image_path ? url('storage/'.$recipe->image_path) : null,
                ],
            ], 201);

        } else { // Articles
            $article = Articles::create([
                'article_title'      => $request->input('title'),
                'article_summary'    => $request->input('description'),
                'article_content'    => $request->input('content'),
                'article_author'     => $request->input('username') ?? 'Anonymous',
                'article_image_path' => $imagePath,
            ]);

            return response()->json([
                'message' => 'Article created',
                'data' => [
                    'id'    => $article->article_id,
                    'title' => $article->article_title,
                    'type'  => 'article',
                    'image' => $article->article_image_path ? url('storage/'.$article->article_image_path) : null,
                ],
            ], 201);
        }
    }
}
