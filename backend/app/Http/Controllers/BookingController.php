<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function index()
    {
        $bookings = Booking::with('user:id,name,email')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($bookings);
    }

    public function mine(Request $request)
    {
        $bookings = Booking::where('user_id', $request->user()->id)
            ->orderBy('booking_date', 'desc')
            ->get();

        return response()->json($bookings);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'           => 'required|string|max:191',
            'email'          => 'required|email',
            'booking_date'   => 'required|date',
            'type'           => 'required|in:Guide,Hébergement,Activité,Gastronomie,Découverte',
            'region'         => 'required|in:Basse-Casamance,Moyenne-Casamance,Haute-Casamance',
            'message'        => 'nullable|string',
            'payment_method' => 'nullable|in:wave,orange_money,card',
        ]);

        $booking = Booking::create([
            'user_id'        => $request->user()->id,
            'name'           => $request->name,
            'email'          => $request->email,
            'booking_date'   => $request->booking_date,
            'type'           => $request->type,
            'region'         => $request->region,
            'message'        => $request->message,
            'status'         => 'en_attente',
            'payment_method' => $request->payment_method,
        ]);

        return response()->json($booking, 201);
    }

    public function updateStatus(Request $request, Booking $booking)
    {
        $request->validate([
            'status'         => 'required|in:en_attente,confirme,annule',
            'refusal_reason' => 'nullable|string',
        ]);

        $booking->update([
            'status'         => $request->status,
            'refusal_reason' => $request->refusal_reason,
        ]);

        return response()->json($booking);
    }

    public function destroy(Booking $booking)
    {
        $booking->delete();

        return response()->json(['message' => 'Réservation supprimée.']);
    }
}
