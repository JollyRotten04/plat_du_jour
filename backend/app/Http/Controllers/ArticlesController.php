<?php

namespace App\Http\Controllers;

use App\Models\Articles;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ArticlesController extends Controller
{
    /**
     * Load all articles with optional filtering
     */
    public function load(Request $request)
    {
        try {
            // Start with base query
            $query = Articles::query();
            
            // Handle search parameter (searches both title and author)
            if ($request->has('search') && !empty($request->search)) {
                $searchTerm = $request->search;
                $query->where(function ($q) use ($searchTerm) {
                    $q->where('article_title', 'LIKE', '%' . $searchTerm . '%')
                    ->orWhere('article_author', 'LIKE', '%' . $searchTerm . '%');
                });
            }
            
            // Handle category filter
            if ($request->has('category') && !empty($request->category)) {
                $query->where('article_category', $request->category);
            }
            
            // Order by most recent articles first (using correct field name)
            $query->orderBy('article_published_at', 'desc');
            
            // Execute query and get results
            $articles = $query->get();

            // Transform data to match frontend expectations
            $transformedArticles = $articles->map(function ($article) {
                return [
                    'article_id' => $article->article_id,
                    'article_title' => $article->article_title,
                    'article_excerpt' => $article->article_summary, // Map summary to excerpt
                    'article_author' => $article->article_author,
                    'article_content' => $article->article_content,
                    'article_category' => $article->article_category,
                    'article_publish_date' => $article->article_published_at,
                    'article_read_time' => $article->article_read_time ?? '5 min read', // Default if not in DB
                    'article_tags' => $article->article_tags,
                    'article_slug' => $article->article_slug,
                    'image_path' => $article->article_image_path, // Map correct field name
                    'article_views' => $article->article_views ?? 0, // Default if not in DB
                    'article_rating' => $article->article_rating ?? 0, // Default if not in DB
                    'review_count' => $article->review_count ?? 0,
                ];
            });
            
            return response()->json([
                'success' => true,
                'data' => $transformedArticles,
                'count' => $articles->count(),
                'message' => 'Articles loaded successfully'
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error loading articles: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'data' => [],
                'message' => 'Error loading articles: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all articles with pagination and optional filtering
     */
    public function index(Request $request)
    {
        try {
            $query = Articles::query();

            // Search functionality
            if ($request->has('search') && !empty($request->search)) {
                $searchTerm = $request->search;
                $query->where(function ($q) use ($searchTerm) {
                    $q->where('article_title', 'LIKE', '%' . $searchTerm . '%')
                    ->orWhere('article_author', 'LIKE', '%' . $searchTerm . '%');
                });
            }

            // Filter by category
            if ($request->has('category') && !empty($request->category)) {
                $query->where('article_category', $request->category);
            }

            // Sorting (using correct field name)
            $sortBy = $request->get('sort_by', 'article_published_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = $request->get('per_page', 10);
            $articles = $query->paginate($perPage);

            // Transform paginated data
            $transformedData = $articles->getCollection()->map(function ($article) {
                return [
                    'article_id' => $article->article_id,
                    'article_title' => $article->article_title,
                    'article_excerpt' => $article->article_summary,
                    'article_content' => $article->article_content,
                    'article_author' => $article->article_author,
                    'article_category' => $article->article_category,
                    'article_publish_date' => $article->article_published_at,
                    'article_read_time' => $article->article_read_time ?? '5 min read',
                    'article_tags' => $article->article_tags,
                    'article_slug' => $article->article_slug,
                    'image_path' => $article->article_image_path,
                    'article_views' => $article->article_views ?? 0,
                    'review_count' => $article->review_count ?? 0,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $transformedData,
                'pagination' => [
                    'current_page' => $articles->currentPage(),
                    'total_pages' => $articles->lastPage(),
                    'per_page' => $articles->perPage(),
                    'total_items' => $articles->total(),
                    'from' => $articles->firstItem(),
                    'to' => $articles->lastItem(),
                ],
                'message' => 'Articles loaded successfully'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error loading articles: ' . $e->getMessage(),
                'data' => []
            ], 500);
        }
    }

    /**
     * Get a single article by ID or slug
     */
    public function show($identifier)
    {
        try {
            // Try to find by ID first, then by slug
            $article = Articles::where('article_id', $identifier)
                          ->orWhere('article_slug', $identifier)
                          ->first();

            if (!$article) {
                return response()->json([
                    'success' => false,
                    'message' => 'Article not found',
                    'data' => null
                ], 404);
            }

            // Transform single article
            $transformedArticle = [
                'article_id' => $article->article_id,
                'article_title' => $article->article_title,
                'article_excerpt' => $article->article_summary,
                'article_content' => $article->article_content,
                'article_author' => $article->article_author,
                'article_category' => $article->article_category,
                'article_publish_date' => $article->article_published_at,
                'article_read_time' => $article->article_read_time ?? '5 min read',
                'article_tags' => $article->article_tags,
                'article_slug' => $article->article_slug,
                'image_path' => $article->article_image_path,
                'article_views' => $article->article_views ?? 0,
                'review_count' => $article->review_count ?? 0,
            ];

            return response()->json([
                'success' => true,
                'data' => $transformedArticle,
                'message' => 'Article loaded successfully'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error loading article: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Store a new article
     */
    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'article_title' => 'required|string|max:200',
                'article_summary' => 'nullable|string|max:500',
                'article_content' => 'required|string',
                'article_author' => 'required|string|max:100',
                'article_category' => 'required|string|max:50',
                'article_published_at' => 'required|date',
                'article_read_time' => 'nullable|string|max:20',
                'article_tags' => 'nullable|string',
                'article_slug' => 'required|string|max:255|unique:articles,article_slug',
                'article_image_path' => 'required|string|max:255',
                'article_views' => 'nullable|integer|min:0',
                'review_count' => 'integer|min:0',
            ]);

            $article = Articles::create($validatedData);

            return response()->json([
                'success' => true,
                'data' => $article,
                'message' => 'Article created successfully'
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
                'message' => 'Error creating article: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update an existing article
     */
    public function update(Request $request, $id)
    {
        try {
            $article = Articles::findOrFail($id);

            $validatedData = $request->validate([
                'article_title' => 'sometimes|required|string|max:200',
                'article_summary' => 'nullable|string|max:500',
                'article_content' => 'sometimes|required|string',
                'article_author' => 'sometimes|required|string|max:100',
                'article_category' => 'sometimes|required|string|max:50',
                'article_published_at' => 'sometimes|required|date',
                'article_read_time' => 'nullable|string|max:20',
                'article_tags' => 'nullable|string',
                'article_slug' => 'sometimes|required|string|max:255|unique:articles,article_slug,' . $id . ',article_id',
                'article_image_path' => 'sometimes|required|string|max:255',
                'article_views' => 'nullable|integer|min:0',
                'article_rating' => 'decimal|min:0',
                'review_count' => 'integer|min:0',
            ]);

            $article->update($validatedData);

            return response()->json([
                'success' => true,
                'data' => $article->fresh(),
                'message' => 'Article updated successfully'
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Article not found'
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
                'message' => 'Error updating article: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete an article
     */
    public function destroy($id)
    {
        try {
            $article = Articles::findOrFail($id);
            $article->delete();

            return response()->json([
                'success' => true,
                'message' => 'Article deleted successfully'
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Article not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting article: ' . $e->getMessage()
            ], 500);
        }
    }
}