<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CampaignController;
use App\Http\Controllers\AssetController;
use App\Http\Controllers\DraftController;

Route::middleware('auth:sanctum')->group(function () {
    // Campaign CRUD
    Route::apiResource('campaigns', CampaignController::class);
    // Draft handling (single endpoint without ID)
    // Retrieve a specific draft
    Route::get('draft/{id}', [DraftController::class, 'show']);
    // Delete a specific draft
    Route::delete('draft/{id}', [DraftController::class, 'destroy']);
    Route::post('draft', [DraftController::class, 'store']);
    // Draft retrieve and update for existing campaign
    Route::get('campaigns/{campaign}/draft', [CampaignController::class, 'showDraft']);
    Route::put('campaigns/{campaign}/draft', [CampaignController::class, 'updateDraft']);
    // Asset upload for a campaign
    Route::post('campaigns/{campaign}/assets', [AssetController::class, 'store']);
});
?>
