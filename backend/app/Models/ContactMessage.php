<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactMessage extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'name',
        'email',
        'subject',
        'message',
        'created_at',
    ];
}
