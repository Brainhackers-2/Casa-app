<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteConfig extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'config_key',
        'config_value',
    ];

    protected $primaryKey = 'id';
}
