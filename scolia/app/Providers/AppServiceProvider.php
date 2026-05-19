<?php

namespace App\Providers;

use App\Models\Paiement;
use App\Policies\PaiementPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Enregistrement de la Policy Finance
        Gate::policy(Paiement::class, PaiementPolicy::class);
    }
}