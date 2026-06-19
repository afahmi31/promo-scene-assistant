<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Draft extends Model
{
    use HasFactory;

    // Allow mass assignment for all attributes
    protected $guarded = [];

    protected $casts = [
        'reference_assets' => 'array',
        'campaign_data' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
?>
