<?php

namespace Tests\Feature;

use Tests\TestCase;

class PrototypeTest extends TestCase
{
    public function test_the_prototype_is_hidden_when_disabled(): void
    {
        config(['prototype.enabled' => false, 'prototype.password' => 'test-password']);

        $this->get('/prototype')->assertNotFound();
        $this->post('/prototype', ['name' => 'Aroha', 'password' => 'test-password'])->assertNotFound();
    }

    public function test_the_prototype_opens_without_a_password_when_none_is_set(): void
    {
        config(['prototype.enabled' => true, 'prototype.password' => null]);

        $this->get('/prototype')
            ->assertOk()
            ->assertHeader('X-Robots-Tag', 'noindex, nofollow')
            ->assertSee('window.PROTOTYPE_VIEWER = null;', false);
    }

    public function test_a_password_shows_the_sign_in_page(): void
    {
        config(['prototype.enabled' => true, 'prototype.password' => 'test-password']);

        $this->get('/prototype')
            ->assertOk()
            ->assertHeader('X-Robots-Tag', 'noindex, nofollow')
            ->assertSee('Your name')
            ->assertDontSee('window.PROTOTYPE_VIEWER', false);
    }

    public function test_the_wrong_password_keeps_the_name_and_says_so(): void
    {
        config(['prototype.enabled' => true, 'prototype.password' => 'test-password']);

        $this->from('/prototype')
            ->post('/prototype', ['name' => 'Aroha', 'password' => 'wrong-password'])
            ->assertRedirect('/prototype')
            ->assertSessionHasErrors('password')
            ->assertSessionHasInput('name', 'Aroha')
            ->assertCookieMissing('prototype');
    }

    public function test_a_name_is_required(): void
    {
        config(['prototype.enabled' => true, 'prototype.password' => 'test-password']);

        $this->from('/prototype')
            ->post('/prototype', ['name' => '', 'password' => 'test-password'])
            ->assertSessionHasErrors('name')
            ->assertCookieMissing('prototype');
    }

    public function test_signing_in_opens_the_prototype_with_the_name(): void
    {
        config(['prototype.enabled' => true, 'prototype.password' => 'test-password']);

        $cookie = $this->signIn('Aroha');

        $this->withCookie('prototype', $cookie)
            ->get('/prototype')
            ->assertOk()
            ->assertSee('window.PROTOTYPE_VIEWER = {"name":"Aroha"};', false);
    }

    public function test_a_new_password_signs_everyone_out(): void
    {
        config(['prototype.enabled' => true, 'prototype.password' => 'test-password']);

        $cookie = $this->signIn('Aroha');

        config(['prototype.password' => 'new-password']);

        $this->withCookie('prototype', $cookie)
            ->get('/prototype')
            ->assertSee('Your name')
            ->assertDontSee('window.PROTOTYPE_VIEWER', false);
    }

    public function test_each_version_has_its_own_address_and_the_page_lists_them(): void
    {
        config(['prototype.enabled' => true, 'prototype.password' => null]);

        $this->get('/prototype/1')
            ->assertOk()
            ->assertSee('window.PROTOTYPE_VERSIONS = [{"id":"1"', false);

        $this->get('/prototype/no-such-version')->assertNotFound();
    }

    public function test_signing_in_returns_to_the_version_asked_for(): void
    {
        config(['prototype.enabled' => true, 'prototype.password' => 'test-password']);

        $this->get('/prototype/1')->assertSee('name="version" value="1"', false);

        $this->post('/prototype', ['name' => 'Aroha', 'password' => 'test-password', 'version' => '1'])
            ->assertRedirect('/prototype/1');

        $this->post('/prototype', ['name' => 'Aroha', 'password' => 'test-password', 'version' => '../etc'])
            ->assertRedirect('/prototype');
    }

    public function test_signing_out_forgets_the_browser(): void
    {
        config(['prototype.enabled' => true, 'prototype.password' => 'test-password']);

        $response = $this->get('/prototype/sign-out')->assertRedirect('/prototype');

        $this->assertTrue($response->getCookie('prototype', false)->isCleared());
    }

    private function signIn(string $name): string
    {
        return $this->post('/prototype', ['name' => $name, 'password' => 'test-password'])
            ->assertRedirect('/prototype')
            ->assertCookie('prototype')
            ->getCookie('prototype')
            ->getValue();
    }
}
