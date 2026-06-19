<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Campaign extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'productName',
        'productCategory',
        'productDescription',
        'productImage',
        'benefits',
        'keyPoints',
        'targetAudience',
        'problemSolved',
        'specialNotes',
        'platform',
        'totalDuration',
        'aspectRatio',
        'sceneCount',
        'visualPreset',
        'useBackgroundReference',
        'referenceAssets',
        'narrationTone',
        'language',
        'useModelReference',
        'modelReferenceImage',
        'modelType',
        'modelUsage',
        'modelReferenceNotes',
        'ctaType',
        'status',
    ];

    protected $casts = [
        'useBackgroundReference' => 'boolean',
        'referenceAssets' => 'array',
        'useModelReference' => 'boolean',
    ];
}
?>
