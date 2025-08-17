<?php

use App\Http\Controllers\RecipeController;
use App\Http\Controllers\ArticlesController;
use App\Http\Controllers\UserAuth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Recipe API routes
Route::prefix('recipes')->group(function () {
    Route::get('/load', [RecipeController::class, 'load']);
    Route::post('/available', [RecipeController::class, 'fetchAvailable']);
    Route::get('/', [RecipeController::class, 'index']);
    Route::get('/{identifier}', [RecipeController::class, 'show']);
    Route::post('/', [RecipeController::class, 'store']);
    Route::put('/{id}', [RecipeController::class, 'update']);
    Route::delete('/{id}', [RecipeController::class, 'destroy']);
});

// Articles API routes
Route::prefix('articles')->group(function () {
    Route::get('/load', [ArticlesController::class, 'load']);
    Route::get('/', [ArticlesController::class, 'index']);
    Route::get('/{identifier}', [ArticlesController::class, 'show']);
    Route::post('/', [ArticlesController::class, 'store']);
    Route::put('/{id}', [ArticlesController::class, 'update']);
    Route::delete('/{id}', [ArticlesController::class, 'destroy']);
});

// Route to Login
Route::post('/login', [UserAuth::class, 'login']);

// Route to Login
Route::post('/signup', [UserAuth::class, 'signup']);
