<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class Recipes extends Model
{
    use HasFactory;

    protected $table = 'recipes';

    protected $primaryKey = 'recipe_id';

    protected $fillable = [
        'recipe_name',
        'recipe_description',
        'recipe_ingredients',
        'recipe_rating',
        'recipe_cooktime',
        'recipe_category',
        'recipe_type',
        'image_path',
        'recipe_calories',
        'recipe_slug',
        'recipe_author',
        'recipe_review_count',
        'steps',
        'nutritional_value',
        'recipe_publish_date',
    ];

    protected $casts = [
        'recipe_rating' => 'decimal:1',
        'recipe_calories' => 'integer',
        'recipe_review_count' => 'integer',
        'steps' => 'array',
        'nutritional_value' => 'array',
    ];

    protected $attributes = [
        'recipe_review_count' => 0,
        'recipe_rating' => null,
        'recipe_calories' => null,
    ];

    // Automatically generate slug when creating/updating
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($recipe) {
            if (empty($recipe->recipe_slug)) {
                $recipe->recipe_slug = self::generateUniqueSlug($recipe->recipe_name);
            }
        });

        static::updating(function ($recipe) {
            if ($recipe->isDirty('recipe_name')) {
                $recipe->recipe_slug = self::generateUniqueSlug($recipe->recipe_name);
            }
        });
    }

    // Generate unique slug
    public static function generateUniqueSlug($name)
    {
        $slug = Str::slug($name);
        $originalSlug = $slug;
        $counter = 1;

        while (self::where('recipe_slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }

    // Scope for filtering by category
    public function scopeByCategory($query, $category)
    {
        return $query->where('recipe_category', $category);
    }

    // Scope for filtering by type
    public function scopeByType($query, $type)
    {
        return $query->where('recipe_type', $type);
    }

    // Scope for filtering by rating
    public function scopeByMinRating($query, $rating)
    {
        return $query->where('recipe_rating', '>=', $rating);
    }

    // Scope for search
    public function scopeSearch($query, $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->where('recipe_name', 'LIKE', "%{$term}%")
              ->orWhere('recipe_description', 'LIKE', "%{$term}%")
              ->orWhere('recipe_ingredients', 'LIKE', "%{$term}%")
              ->orWhere('recipe_author', 'LIKE', "%{$term}%");
        });
    }

    // Get formatted cook time
    public function getFormattedCookTimeAttribute()
    {
        return $this->recipe_cooktime;
    }

    // Get recipe URL
    public function getUrlAttribute()
    {
        return route('recipes.show', $this->recipe_slug);
    }

    // Get average rating with proper formatting
    public function getFormattedRatingAttribute()
    {
        return $this->recipe_rating ? number_format($this->recipe_rating, 1) : 'Not rated';
    }

    // Check if recipe has image
    public function hasImage()
    {
        return !empty($this->image_path) && file_exists(public_path($this->image_path));
    }

    // Get image URL or default
    public function getImageUrlAttribute()
    {
        if ($this->hasImage()) {
            return asset($this->image_path);
        }
        
        return asset('images/default-recipe.jpg'); // Make sure you have a default image
    }
}