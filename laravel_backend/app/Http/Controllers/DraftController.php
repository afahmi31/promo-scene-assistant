<?php

namespace App\Http\Controllers;

use App\Models\Draft;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\JsonResponse;

class DraftController extends Controller
{
    /**
     * Store a new draft or update an existing one.
     * If `id` is present in the request, the draft will be updated.
     */
    public function store(Request $request): JsonResponse
    {
        $user = Auth::user();
        $data = $request->validate([
            'id' => 'sometimes|integer',
            'title' => 'sometimes|string|nullable',
            'product_name' => 'sometimes|string|nullable',
            'model_notes' => 'sometimes|string|nullable',
            'reference_assets' => 'sometimes|array',
            'campaign_data' => 'sometimes|array',
        ]);

        if (!empty($data['id'])) {
            $draft = Draft::where('id', $data['id'])->where('user_id', $user->id)->firstOrFail();
            $draft->update($data);
        } else {
            $draft = Draft::create(array_merge($data, ['user_id' => $user->id]));
        }

        return response()->json($draft);
    }

    /**
     * Retrieve a draft by its ID.
     */
    public function show($id): JsonResponse
    {
        $user = Auth::user();
        $draft = Draft::where('id', $id)->where('user_id', $user->id)->firstOrFail();
        return response()->json($draft);
    }

    /**
     * Delete a draft.
     */
    public function destroy($id): JsonResponse
    {
        $user = Auth::user();
        $draft = Draft::where('id', $id)->where('user_id', $user->id)->firstOrFail();
        $draft->delete();
        return response()->json(['message' => 'Draft deleted']);
    }
}
?>
