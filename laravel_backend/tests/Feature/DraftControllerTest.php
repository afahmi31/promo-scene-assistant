<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\Draft;
use Laravel\Sanctum\Sanctum;

class DraftControllerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Prepare an authenticated user for the tests.
     */
    protected function authenticateUser(): User
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        return $user;
    }

    /** @test */
    public function it_can_store_a_draft()
    {
        $this->authenticateUser();

        $payload = [
            'title' => 'Test Draft',
            'product_name' => 'Demo Product',
            'model_notes' => 'Some notes',
            'reference_assets' => ['asset1.png'],
            'campaign_data' => ['key' => 'value'],
        ];

        $response = $this->postJson('/api/draft', $payload);
        $response->assertStatus(200);
        $response->assertJsonFragment(['title' => 'Test Draft']);
        $this->assertDatabaseHas('drafts', ['title' => 'Test Draft']);
    }

    /** @test */
    public function it_can_retrieve_a_draft()
    {
        $user = $this->authenticateUser();
        $draft = Draft::create(array_merge([
            'title' => 'Existing Draft',
            'product_name' => 'Prod',
            'model_notes' => 'Notes',
            'reference_assets' => ['asset.png'],
            'campaign_data' => ['foo' => 'bar'],
        ], ['user_id' => $user->id]));

        $response = $this->getJson('/api/draft/' . $draft->id);
        $response->assertStatus(200);
        $response->assertJsonFragment(['title' => 'Existing Draft']);
    }

    /** @test */
    public function it_can_delete_a_draft()
    {
        $user = $this->authenticateUser();
        $draft = Draft::create(array_merge([
            'title' => 'To Delete',
            'product_name' => 'Prod',
            'model_notes' => 'Notes',
            'reference_assets' => [],
            'campaign_data' => [],
        ], ['user_id' => $user->id]));

        $response = $this->deleteJson('/api/draft/' . $draft->id);
        $response->assertStatus(200);
        $this->assertDatabaseMissing('drafts', ['id' => $draft->id]);
    }
}
