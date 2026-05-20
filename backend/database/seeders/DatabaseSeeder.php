<?php

namespace Database\Seeders;

use App\Models\SiteConfig;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@casamancetour.sn'],
            [
                'name'     => 'Administrateur',
                'password' => 'Admin@2025!',
                'role'     => 'admin',
            ]
        );

        $configs = [
            'hero_video'    => 'https://www.youtube.com/embed/_Hto2CaAQIQ',
            'video_basse'   => 'https://www.youtube.com/embed/_Hto2CaAQIQ',
            'video_moyenne' => 'https://www.youtube.com/embed/MJtyZDnzY7c',
            'video_haute'   => 'https://www.youtube.com/embed/drHP4EvpFEk',
        ];

        foreach ($configs as $key => $value) {
            SiteConfig::firstOrCreate(
                ['config_key' => $key],
                ['config_value' => $value, 'updated_at' => now()]
            );
        }
    }
}
