<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Review;
use App\Models\User;

class AdminController extends Controller
{
    public function stats()
    {
        return response()->json([
            'total_bookings' => Booking::count(),
            'pending'        => Booking::where('status', 'en_attente')->count(),
            'confirmed'      => Booking::where('status', 'confirme')->count(),
            'cancelled'      => Booking::where('status', 'annule')->count(),
            'users_count'    => User::count(),
            'reviews_count'  => Review::count(),
        ]);
    }

    public function users()
    {
        $users = User::select('id', 'name', 'email', 'role', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($users);
    }
}
