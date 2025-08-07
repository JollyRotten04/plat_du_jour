<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class Articles extends Model
{
    use HasFactory;

    protected $table = 'articles';
    protected $primaryKey = 'article_id';

    protected $fillable = [
        'article_title',
        'article_summary',
        'article_content', 
        'article_author',
        'article_slug',
        'article_rating',
        'article_image_path',
        'article_category',
        'article_tags',
        'article_published_at',
        'article_read_time',      // Added this
        'article_views',          // Added this
        'review_count',
    ];

    protected $casts = [
        'article_published_at' => 'datetime',
        'article_views' => 'integer',
    ];

    // Auto-generate slug if not provided
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($article) {
            if (!$article->article_slug) {
                $article->article_slug = Str::slug($article->article_title);
            }
        });
    }
}