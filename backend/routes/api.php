<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\SiteConfigController;
use App\Http\Middleware\IsAdmin;
use Illuminate\Support\Facades\Route;

// Auth routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});

// Public routes
Route::get('/reviews', [ReviewController::class, 'index']);
Route::get('/site-configs', [SiteConfigController::class, 'index']);
Route::post('/contact', [ContactController::class, 'store']);

// Authenticated user routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/bookings/mine', [BookingController::class, 'mine']);
});

// Admin routes
Route::middleware(['auth:sanctum', IsAdmin::class])->group(function () {
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::put('/bookings/{booking}/status', [BookingController::class, 'updateStatus']);
    Route::delete('/bookings/{booking}', [BookingController::class, 'destroy']);

    Route::delete('/reviews/{review}', [ReviewController::class, 'destroy']);

    Route::put('/site-configs/{key}', [SiteConfigController::class, 'update']);
    Route::post('/site-configs/upload', [SiteConfigController::class, 'upload']);

    Route::prefix('admin')->group(function () {
        Route::get('/stats', [AdminController::class, 'stats']);
        Route::get('/users', [AdminController::class, 'users']);
    });
});
