<?php

namespace Tests\Feature;

use Tests\TestCase;

class PrototypeTest extends TestCase
{
    public function test_the_prototype_is_hidden_when_disabled(): void
    {
        config(['prototype.enabled' => false, 'prototype.password' => 'test-password']);

        $this->withBasicAuth('client', 'test-password')
            ->get('/prototype')
            ->assertNotFound();
    }

    public function test_the_prototype_asks_for_the_password(): void
    {
        config(['prototype.enabled' => true, 'prototype.password' => 'test-password']);

        $this->get('/prototype')
            ->assertUnauthorized()
            ->assertHeader('WWW-Authenticate', 'Basic realm="Prototype", charset="UTF-8"');

        $this->withBasicAuth('client', 'wrong-password')
            ->get('/prototype')
            ->assertUnauthorized();
    }

    public function test_the_prototype_opens_with_the_password(): void
    {
        config(['prototype.enabled' => true, 'prototype.password' => 'test-password']);

        $response = $this->withBasicAuth('client', 'test-password')
            ->get('/prototype')
            ->assertOk()
            ->assertHeader('X-Robots-Tag', 'noindex, nofollow');

        $this->assertSame(base_path('prototype/index.html'), $response->baseResponse->getFile()->getPathname());
    }

    public function test_the_prototype_opens_without_a_password_when_none_is_set(): void
    {
        config(['prototype.enabled' => true, 'prototype.password' => null]);

        $this->get('/prototype')->assertOk();
    }
}
