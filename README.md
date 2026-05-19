# Scolia — Système de Gestion Scolaire

Application web de gestion scolaire composée d'un backend Laravel et d'un frontend Next.js.

---

## Structure du dépôt

```
scolia/
├── scolia/        ← Backend Laravel
└── frontend/      ← Frontend Next.js
```

---

## Backend — Laravel

### Prérequis

- PHP >= 8.2
- Composer
- MySQL (WAMP / XAMPP)
- Laravel 11

### Installation

```bash
cd scolia
composer install
cp .env.example .env
php artisan key:generate
```

### Configuration de la base de données

Dans le fichier `.env` :

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=scolia
DB_USERNAME=root
DB_PASSWORD=
```

### Migration

```bash
php artisan migrate
```

### Démarrage

```bash
php artisan serve
# → http://localhost:8000
```

### Endpoints API

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| POST | `/api/register` | Créer un compte | Non |
| POST | `/api/login` | Se connecter | Non |
| POST | `/api/logout` | Se déconnecter | Oui |
| GET | `/api/me` | Infos utilisateur connecté | Oui |

### Authentification

L'API utilise **Laravel Sanctum** avec des tokens Bearer.

Toutes les routes protégées nécessitent le header :
```
Authorization: Bearer {token}
```

---

## Frontend — Next.js

### Prérequis

- Node.js >= 18
- npm ou pnpm

### Installation

```bash
cd frontend
npm install
```

### Configuration

Crée un fichier `.env.local` :

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Démarrage

```bash
npm run dev
# → http://localhost:3000
```

### Pages

| Route | Description |
|-------|-------------|
| `/` | Redirige vers `/login` |
| `/login` | Connexion |
| `/register` | Création de compte |
| `/reset-password` | Réinitialisation du mot de passe |
| `/dashboard` | Tableau de bord (protégé) |

### Technologies

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui

---

## Lancer le projet complet

```bash
# Terminal 1 — Backend
cd scolia
php artisan serve

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Accède à l'application sur **http://localhost:3000**

---

## Auteur

Projet réalisé dans le cadre du cours de SI Urbanisation — ENSP Yaoundé I