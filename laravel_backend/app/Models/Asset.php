<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Asset extends Model
{
    use HasFactory;

    protected $fillable = [
        'campaign_id',
        'type', // e.g., uploaded_product, generated_image
        'path', // storage path
        'size',
        'description',
    ];
}
?>
