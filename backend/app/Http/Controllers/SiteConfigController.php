<?php

namespace App\Http\Controllers;

use App\Models\SiteConfig;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SiteConfigController extends Controller
{
    public function index()
    {
        $configs = SiteConfig::all()->pluck('config_value', 'config_key');

        return response()->json($configs);
    }

    public function update(Request $request, string $key)
    {
        $request->validate([
            'value' => 'required|string',
        ]);

        SiteConfig::updateOrCreate(
            ['config_key' => $key],
            ['config_value' => $request->value, 'updated_at' => now()]
        );

        return response()->json(['message' => 'Configuration mise à jour.']);
    }

    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:mp4,webm,ogg,mov|max:102400',
            'key'  => 'required|string',
        ]);

        $path = $request->file('file')->store('videos', 'public');
        $url  = Storage::disk('public')->url($path);

        SiteConfig::updateOrCreate(
            ['config_key' => $request->key],
            ['config_value' => $url, 'updated_at' => now()]
        );

        return response()->json(['url' => $url]);
    }
}
