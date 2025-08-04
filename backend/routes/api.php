<?php

use App\Http\Controllers\RecipeController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Recipe API routes
Route::prefix('recipes')->group(function () {
    Route::get('/load', [RecipeController::class, 'load']);
    Route::get('/', [RecipeController::class, 'index']);
    Route::get('/{identifier}', [RecipeController::class, 'show']);
    Route::post('/', [RecipeController::class, 'store']);
    Route::put('/{id}', [RecipeController::class, 'update']);
    Route::delete('/{id}', [RecipeController::class, 'destroy']);
});
