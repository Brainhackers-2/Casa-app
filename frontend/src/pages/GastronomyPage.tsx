import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChefHat, Wallet, BookOpen, Calendar, Heart,
  Utensils, Flame, ArrowRight, X, Clock,
} from 'lucide-react';
import { DISHES, DRINKS } from '../data';
import type { Dish, Drink } from '../types';

/* ─── Drawer state type ──────────────────────────────────────── */
type DrawerItem =
  | { item: Dish; type: 'dish' }
  | { item: Drink; type: 'drink' }
  | null;

/* ─── Booking URL helper ─────────────────────────────────────── */
function bookingUrl(name: string, region = 'Basse-Casamance') {
  return `/booking?type=Gastronomie&item=${encodeURIComponent('Atelier Cuisine: ' + name)}&region=${encodeURIComponent(region)}`;
}

/* ─── Recipe Drawer ──────────────────────────────────────────── */
function RecipeDrawer({ state, onClose }: { state: DrawerItem; onClose: () => void }) {
  if (!state) return null;
  const { item, type } = state;
  const isDish = type === 'dish';
  const dish = isDish ? (item as Dish) : null;

  const ingredients = isDish && dish
    ? dish.ingredients
    : ['Fruits frais', 'Sucre de canne', 'Eau pure', 'Herbes aromatiques'];
  const steps = item.recipe;
  const region = isDish && dish ? dish.region : 'Basse-Casamance';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[90] bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 h-full z-[100] w-full max-w-2xl bg-white shadow-2xl overflow-y-auto"
        style={{ animation: 'slideInRight 0.35s cubic-bezier(0.16,1,0.3,1)' }}
      >
        {/* Close */}
        <div className="sticky top-0 z-10 bg-white flex justify-end p-4 border-b border-slate-100">
          <button
            onClick={onClose}
            className="w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          {/* 1. Badge + Title + Meta */}
          <div>
            <span className="inline-block bg-emerald-50 text-emerald-700 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-4">
              La Recette pas à pas
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight mb-4">
              {item.name}
            </h2>
            <div className="flex flex-wrap gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-emerald-600" /> ~45–60 mins
              </span>
              <span className="flex items-center gap-1.5">
                <Wallet size={14} className="text-amber-500" />
                Coût moyen : {item.price}
              </span>
            </div>
          </div>

          {/* 2. Image */}
          <div className="h-64 md:h-80 rounded-[2.5rem] overflow-hidden shadow-xl">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* 3. Ingredients */}
          <div>
            <h3 className="flex items-center gap-2 font-bold text-slate-900 mb-4 text-lg">
              <Utensils size={18} className="text-emerald-600" /> Ingrédients Nécessaires
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {ingredients.map((ing, i) => (
                <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0" />
                  <span className="text-sm font-medium text-slate-700">{ing}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Preparation steps */}
          <div>
            <h3 className="flex items-center gap-2 font-bold text-slate-900 mb-4 text-lg">
              <Flame size={18} className="text-orange-500" /> Étapes de Préparation
            </h3>
            <div className="space-y-3">
              {steps.map((step, i) => (
                <div key={i} className="flex items-start gap-4 group">
                  <div className="w-10 h-10 bg-slate-100 group-hover:bg-emerald-600 rounded-xl flex items-center justify-center font-bold text-slate-600 group-hover:text-white transition-colors text-sm flex-shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-slate-600 leading-relaxed font-medium pt-2">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Booking CTA */}
          <div className="bg-amber-50 border border-amber-100 rounded-[2rem] p-6">
            <p className="font-bold text-amber-900 mb-3">Réserver l'atelier pour ce plat</p>
            <Link
              to={bookingUrl(item.name, region)}
              onClick={onClose}
              className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-full font-bold text-sm transition-colors"
            >
              Réserver <ArrowRight size={16} />
            </Link>
            <p className="text-amber-700 text-xs italic mt-3">
              Le tarif de l'atelier dépend du nombre de participants (base 15 000 FCFA).
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
      `}</style>
    </>
  );
}

/* ─── Dish Card ──────────────────────────────────────────────── */
function DishCard({ dish, onRecipe }: { dish: Dish; onRecipe: () => void }) {
  const extra = dish.ingredients.length - 3;
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
      {/* Image */}
      <div className="h-48 overflow-hidden relative">
        <img
          src={dish.image}
          alt={dish.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Region badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-white/95 text-emerald-900 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider">
            {dish.region.split('-')[0]}
          </span>
        </div>
        {/* Price badge */}
        <div className="absolute bottom-3 right-3">
          <span className="bg-emerald-600 text-white text-sm font-black px-4 py-1.5 rounded-xl">
            {dish.price.replace('À partir de ', '')}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        <h3 className="text-xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors mb-1.5">
          {dish.name}
        </h3>
        <p className="text-slate-500 text-sm leading-relaxed mb-3 line-clamp-2">{dish.description}</p>

        {/* Ingredients pills */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {dish.ingredients.slice(0, 3).map((ing, i) => (
            <span key={i} className="text-[10px] bg-slate-50 text-slate-600 px-2.5 py-1 rounded-full font-medium">
              {ing}
            </span>
          ))}
          {extra > 0 && (
            <span className="text-[10px] bg-slate-50 text-slate-500 px-2.5 py-1 rounded-full font-medium">
              +{extra}
            </span>
          )}
        </div>

        <div className="h-px bg-slate-100 mb-4" />

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onRecipe}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-emerald-600 text-white rounded-full text-sm font-semibold transition-colors"
          >
            <BookOpen size={14} /> Détails
          </button>
          <Link
            to={bookingUrl(dish.name, dish.region)}
            className="w-10 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center transition-colors flex-shrink-0"
            title="Réserver"
          >
            <Calendar size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── Drink Card ─────────────────────────────────────────────── */
function DrinkCard({ drink, onRecipe }: { drink: Drink; onRecipe: () => void }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
      {/* Image */}
      <div className="h-40 overflow-hidden relative">
        <img
          src={drink.image}
          alt={drink.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Price badge top-right */}
        <div className="absolute top-3 right-3">
          <span className="bg-amber-400 text-white text-xs font-black px-3 py-1.5 rounded-lg">
            {drink.price.replace('À partir de ', '')}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        <h3 className="text-xl font-black text-slate-900 mb-1.5">{drink.name}</h3>
        <p className="text-slate-400 text-xs leading-relaxed mb-3 line-clamp-2">{drink.description}</p>

        {/* Health benefit */}
        <div className="flex items-start gap-2 bg-emerald-50 rounded-xl p-3 mb-4">
          <Heart size={13} className="text-emerald-600 flex-shrink-0 mt-0.5" />
          <p className="text-[9px] font-bold text-emerald-700 leading-snug">{drink.benefits}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onRecipe}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 border-2 border-slate-900 hover:bg-slate-900 hover:text-white text-slate-900 rounded-full text-sm font-semibold transition-colors"
          >
            Recette
          </button>
          <Link
            to={bookingUrl(drink.name)}
            className="w-10 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center transition-colors flex-shrink-0"
            title="Réserver"
          >
            <Calendar size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function GastronomyPage() {
  const [selectedItem, setSelectedItem] = useState<DrawerItem>(null);

  return (
    <div className="min-h-screen bg-white">

      {/* ── SECTION 1 — Hero 70vh ────────────────────────────────── */}
      <section
        className="relative flex items-center justify-center text-center"
        style={{ height: '70vh' }}
      >
        <img
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600"
          alt="Gastronomie Casamance"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[1px]" />

        <div className="relative z-10 px-6 max-w-4xl">
          <span className="inline-flex items-center gap-2 bg-emerald-600/90 text-white text-xs font-bold px-5 py-2 rounded-full tracking-[0.2em] uppercase mb-6">
            <ChefHat size={14} /> Académie Culinaire
          </span>
          <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black text-white leading-none mb-4">
            Gastronomie
            <br />
            <span className="italic text-amber-400">Casamançaise</span>
          </h1>
          <p className="text-white/90 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Une immersion dans une cuisine de transmission, où chaque plat raconte un peuple,
            un climat et une histoire.
          </p>
        </div>
      </section>

      {/* ── SECTION 2 — Plats ────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="text-4xl font-black text-slate-900 mb-2">Nos Plats Emblématiques</h2>
              <p className="text-slate-500 max-w-xl leading-relaxed">
                Explorez les saveurs qui font la fierté de nos foyers et apprenez les secrets
                de leur préparation.
              </p>
            </div>
            <div className="flex-shrink-0">
              <span className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 text-xs font-bold px-4 py-2 rounded-full">
                <Wallet size={13} /> Prix moyens affichés
              </span>
            </div>
          </div>

          {/* Dishes grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {DISHES.map(dish => (
              <DishCard
                key={dish.id}
                dish={dish}
                onRecipe={() => setSelectedItem({ item: dish, type: 'dish' })}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 3 — Boissons ─────────────────────────────────── */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3">
              Fraîcheur Tropicale : La Magie des Jus Naturels
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Goûtez à la pureté des fruits de la forêt, cueillis et pressés selon les méthodes
              artisanales de nos villages.
            </p>
          </div>

          {/* Drinks grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {DRINKS.map(drink => (
              <DrinkCard
                key={drink.id}
                drink={drink}
                onRecipe={() => setSelectedItem({ item: drink, type: 'drink' })}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Recipe Drawer ─────────────────────────────────────────── */}
      <RecipeDrawer state={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
}
