<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Recipes;
use App\Models\Articles;
use Illuminate\Support\Facades\Log;

class ViewContentController extends Controller
{
    /**
     * Add or remove an item from user's favourites (recipe or article).
     */
    public function favourite(Request $request): JsonResponse
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        $id = $request->input('id');
        $type = strtolower($request->input('type')); // 👈 read type

        if (!$id || !$type) {
            return response()->json([
                'success' => false,
                'message' => 'ID and type are required'
            ], 400);
        }

        if ($type === 'recipe' || $type === 'recipes') {
            $recipe = Recipes::find($id);

            if (!$recipe) {
                return response()->json([
                    'success' => false,
                    'message' => 'Recipe not found'
                ], 404);
            }

            $favourites = $user->favourite_recipes ? json_decode($user->favourite_recipes, true) : [];

            // Check if already favorited
            if (in_array($id, $favourites)) {
                // Remove from favorites
                $favourites = array_values(array_filter($favourites, function($favId) use ($id) {
                    return $favId != $id;
                }));
                $user->favourite_recipes = json_encode($favourites);
                $user->save();

                return response()->json([
                    'success' => true,
                    'type' => 'recipe',
                    'favourites' => $favourites,
                    'isFavorited' => false,
                    'message' => 'Recipe removed from favourites'
                ]);
            } else {
                // Add to favorites
                $favourites[] = $id;
                $user->favourite_recipes = json_encode($favourites);
                $user->save();

                return response()->json([
                    'success' => true,
                    'type' => 'recipe',
                    'favourites' => $favourites,
                    'isFavorited' => true,
                    'message' => 'Recipe added to favourites'
                ]);
            }
        }

        if ($type === 'article' || $type === 'articles') {
            $article = Articles::find($id);

            if (!$article) {
                return response()->json([
                    'success' => false,
                    'message' => 'Article not found'
                ], 404);
            }

            $favourites = $user->favourite_articles ? json_decode($user->favourite_articles, true) : [];

            // Check if already favorited
            if (in_array($id, $favourites)) {
                // Remove from favorites
                $favourites = array_values(array_filter($favourites, function($favId) use ($id) {
                    return $favId != $id;
                }));
                $user->favourite_articles = json_encode($favourites);
                $user->save();

                return response()->json([
                    'success' => true,
                    'type' => 'article',
                    'favourites' => $favourites,
                    'isFavorited' => false,
                    'message' => 'Article removed from favourites'
                ]);
            } else {
                // Add to favorites
                $favourites[] = $id;
                $user->favourite_articles = json_encode($favourites);
                $user->save();

                return response()->json([
                    'success' => true,
                    'type' => 'article',
                    'favourites' => $favourites,
                    'isFavorited' => true,
                    'message' => 'Article added to favourites'
                ]);
            }
        }

        return response()->json([
            'success' => false,
            'message' => 'Invalid type provided'
        ], 400);
    }

    /**
     * Get favourite status for the authenticated user.
     */
    public function favouriteStatus(string $type, $id): JsonResponse
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        $type = strtolower($type);
        $id = (int) $id; // Cast to int here

        if ($type === 'recipe' || $type === 'recipes') {
            $favourites = $user->favourite_recipes ? json_decode($user->favourite_recipes, true) : [];
            return response()->json([
                'success' => true,
                'type' => 'recipe',
                'id' => $id,
                'isFavorited' => in_array($id, $favourites),
            ]);
        }

        if ($type === 'article' || $type === 'articles') {
            $favourites = $user->favourite_articles ? json_decode($user->favourite_articles, true) : [];
            return response()->json([
                'success' => true,
                'type' => 'article',
                'id' => $id,
                'isFavorited' => in_array($id, $favourites),
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Invalid type provided'
        ], 400);
    }

   public function showAll(Request $request): JsonResponse
{
    $user = Auth::user();

    if (!$user) {
        return response()->json([
            'success' => false,
            'message' => 'Unauthorized'
        ], 401);
    }

    $type = strtolower(trim($request->input('type', '')));
    $category = strtolower(trim($request->input('category', '')));
    $page = (int) $request->input('page', 1);
    $perPage = (int) $request->input('per_page', 15);

    if (!$type || !$category) {
        return response()->json([
            'success' => false,
            'message' => 'Type and category are required'
        ], 400);
    }

    $normalizedType = in_array($type, ['recipe', 'recipes']) ? 'recipe' : 'article';
    $normalizedCategory = in_array($category, ['favourite', 'favorites']) ? 'favourite' : 'authored';

    // Get IDs from the user JSON fields
    $ids = $normalizedCategory === 'authored'
        ? ($normalizedType === 'recipe' ? json_decode($user->user_recipes ?? '[]', true) : json_decode($user->user_articles ?? '[]', true))
        : ($normalizedType === 'recipe' ? json_decode($user->favourite_recipes ?? '[]', true) : json_decode($user->favourite_articles ?? '[]', true));

    $total = count($ids);

    // Manual pagination on the IDs array
    $paginated = array_slice($ids, ($page - 1) * $perPage, $perPage);

    // Determine the proper order column
    $orderByColumn = $normalizedType === 'recipe' ? 'recipe_publish_date' : 'article_published_at';

    // Fetch actual models from DB and order by publish date
    if ($normalizedType === 'recipe') {
        $items = Recipes::whereIn('recipe_id', $paginated)
                        ->orderBy($orderByColumn, 'desc')
                        ->get();
    } else {
        $items = Articles::whereIn('article_id', $paginated)
                         ->orderBy($orderByColumn, 'desc')
                         ->get();
    }

    return response()->json([
        'success' => true,
        'type' => $normalizedType,
        'category' => $normalizedCategory,
        'data' => $items,
        'pagination' => [
            'current_page' => $page,
            'per_page' => $perPage,
            'total' => $total,
            'last_page' => $total > 0 ? ceil($total / $perPage) : 0,
            'from' => $total > 0 ? (($page - 1) * $perPage + 1) : 0,
            'to' => min($page * $perPage, $total)
        ]
    ]);
}


}