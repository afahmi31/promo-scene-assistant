<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Campaign;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\JsonResponse;

class AssetController extends Controller
{
    /**
     * Store a newly uploaded asset for a campaign.
     *
     * Expected request payload (multipart/form-data):
     * - file: The uploaded asset file (image/video/etc.)
     * - description: Text description of the asset
     * - campaign_id: ID of the campaign the asset belongs to
     */
    public function store(Request $request): JsonResponse
    {
        // Validate incoming data
        $validated = $request->validate([
            'file' => 'required|file|max:10240', // max 10MB, adjust as needed
            'description' => 'nullable|string|max:255',
            'campaign_id' => 'required|exists:campaigns,id',
        ]);

        // Store the file in the public storage disk (storage/app/public/assets)
        $path = $request->file('file')->store('assets', 'public');

        // Create the Asset record using the correct column names (path, description)
        $asset = Asset::create([
            'campaign_id' => $validated['campaign_id'],
            'path' => $path,
            'description' => $validated['description'] ?? null,
        ]);

        return response()->json([
            'message' => 'Asset uploaded successfully',
            'asset' => [
                'id' => $asset->id,
                'url' => Storage::url($asset->path),
                'description' => $asset->description,
            ],
        ], 201);
    }
}
?>
