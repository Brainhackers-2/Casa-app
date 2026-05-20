# Casamance Tour

Plateforme de tourisme pour la région de Casamance au Sénégal.

## Stack technique
- **Frontend** : React 18 + TypeScript + Tailwind CSS + Vite
- **Backend** : Laravel 11 + MySQL + Sanctum
- **AI Chatbot** : Google Gemini 2.0 Flash

---

## Prérequis
- PHP 8.2+, Composer
- Node.js 18+, npm
- MySQL 8+

---

## Installation

### 1. Base de données MySQL
Créez la base de données :
```sql
CREATE DATABASE casamance_tour CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend Laravel
```bash
cd backend
composer install
php artisan key:generate
php artisan storage:link
php artisan migrate
php artisan db:seed
```
> Crée le compte admin : `admin@casamancetour.sn` / `Admin@2025!`

Démarrer le serveur :
```bash
php artisan serve --port=8000
```

### 3. Frontend React
```bash
cd frontend
npm install
```

Configurez votre clé Gemini dans `frontend/.env` :
```
VITE_API_URL=http://localhost:8000/api
VITE_GEMINI_API_KEY=votre_cle_gemini_ici
```

Démarrer le frontend :
```bash
npm run dev
```

Ouvrir : http://localhost:5173

---

## Comptes par défaut
| Rôle  | Email                     | Mot de passe  |
|-------|---------------------------|---------------|
| Admin | admin@casamancetour.sn    | Admin@2025!   |

---

## Pages disponibles
| Route            | Accès     | Description                    |
|------------------|-----------|--------------------------------|
| `/`              | Public    | Page d'accueil                 |
| `/login`         | Public    | Connexion / Inscription        |
| `/discovery`     | Connecté  | 3 régions de Casamance         |
| `/visit`         | Connecté  | 18 lieux à visiter             |
| `/visit/:id`     | Connecté  | Détail d'un lieu               |
| `/activities`    | Connecté  | 48 activités (4 types)         |
| `/booking`       | Connecté  | Réservation (4 étapes)         |
| `/my-bookings`   | Connecté  | Mes réservations                |
| `/gastronomy`    | Connecté  | 9 plats + 9 boissons           |
| `/gallery`       | Connecté  | Galerie masonry + lightbox     |
| `/guides`        | Connecté  | 9 guides locaux                |
| `/accommodations`| Connecté  | 36 hébergements (3 types)      |
| `/testimonials`  | Connecté  | Avis + formulaire              |
| `/agenda`        | Connecté  | Événements culturels           |
| `/contact`       | Connecté  | Formulaire de contact          |
| `/admin`         | Admin     | Dashboard administrateur       |

---

## Fonctionnalités
- ✅ Auth JWT via Laravel Sanctum
- ✅ 16 pages React avec lazy loading
- ✅ 6 langues (fr, en, wo, dyo, man, ff)
- ✅ Chatbot AI Gemini 2.0 Flash
- ✅ Réservations avec stepper 4 étapes
- ✅ Paiement Wave / Orange Money / Carte
- ✅ Galerie masonry + lightbox
- ✅ Dashboard admin complet
- ✅ Design responsive mobile-first
- ✅ Carousel hero automatique (8s)
