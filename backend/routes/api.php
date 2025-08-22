<?php

use App\Http\Controllers\RecipeController;
use App\Http\Controllers\ArticlesController;
use App\Http\Controllers\UserAuth;
use App\Http\Controllers\ViewContentController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Articles API routes
Route::prefix('articles')->group(function () {
    Route::get('/load', [ArticlesController::class, 'load']);
    Route::post('/', [ArticlesController::class, 'store']);
    Route::put('/{id}', [ArticlesController::class, 'update']);
    Route::delete('/{id}', [ArticlesController::class, 'destroy']);

    // Favourites and user content MUST be defined BEFORE the catch-all {identifier}
    Route::middleware('auth:sanctum')->post('/favourite', [ViewContentController::class, 'favourite']);
    
    // For checking if already favourite
    Route::middleware('auth:sanctum')->get('/favourite/status/{type}/{id}', [ViewContentController::class, 'favouriteStatus']);
    Route::middleware('auth:sanctum')->post('/show-all', [ViewContentController::class, 'showAll']);

    // Catch-all article identifier goes LAST
    Route::get('/{identifier}', [ArticlesController::class, 'show']);
});

// Recipes API routes
Route::prefix('recipes')->group(function () {
    Route::get('/load', [RecipeController::class, 'load']);
    Route::post('/available', [RecipeController::class, 'fetchAvailable']);
    Route::post('/', [RecipeController::class, 'store']);
    Route::put('/{id}', [RecipeController::class, 'update']);
    Route::delete('/{id}', [RecipeController::class, 'destroy']);

    // Favourites and user content MUST be above {identifier}
    Route::middleware('auth:sanctum')->post('/favourite', [ViewContentController::class, 'favourite']);

    // For checking if already favourite
    Route::middleware('auth:sanctum')->get('/favourite/status/{type}/{id}', [ViewContentController::class, 'favouriteStatus']);
    Route::middleware('auth:sanctum')->post('/show-all', [ViewContentController::class, 'showAll']);

    // Catch-all recipe identifier goes LAST
    Route::get('/{identifier}', [RecipeController::class, 'show']);
});

// Route to Login
Route::post('/login', [UserAuth::class, 'login']);

// Route to Signup
Route::post('/signup', [UserAuth::class, 'signup']);