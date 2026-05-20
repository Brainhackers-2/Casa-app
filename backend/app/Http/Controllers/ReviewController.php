<?php

namespace App\Http\Controllers;

use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index()
    {
        $reviews = Review::orderBy('created_at', 'desc')->get();

        return response()->json($reviews);
    }

    public function store(Request $request)
    {
        $request->validate([
            'content' => 'required|string|min:10',
            'rating'  => 'required|integer|between:1,5',
        ]);

        $user = $request->user();

        $review = Review::create([
            'user_id'      => $user->id,
            'author_name'  => $user->name,
            'author_avatar' => $user->avatar,
            'content'      => $request->content,
            'rating'       => $request->rating,
        ]);

        return response()->json($review, 201);
    }

    public function destroy(Review $review)
    {
        $review->delete();

        return response()->json(['message' => 'Avis supprimé.']);
    }
}
