# Scolia — ERP Scolaire

> Application de gestion scolaire : élèves, enseignants, paiements, notes, absences, communication parents.

**Stack** : Laravel 11 · React 18 · TypeScript · Tailwind CSS · MySQL 8.0

---

## Prérequis

- PHP 8.2+
- Composer 2.x
- Node.js 18+
- MySQL 8.0+ (WAMP / XAMPP / Laragon)
- Git

---

## Installation

### 1. Cloner le projet

```bash
git clone https://github.com/makeu05/scolia.git
cd scolia
```

### 2. Importer la base de données via phpMyAdmin

1. Ouvrir **phpMyAdmin** → `http://localhost/phpmyadmin`
2. Cliquer sur **Nouvelle base de données** (panneau gauche)
3. Nom : `scolia` · Interclassement : `utf8mb4_unicode_ci` · Cliquer **Créer**
4. Sélectionner la base `scolia` dans le panneau gauche
5. Cliquer sur l'onglet **Importer**
6. Cliquer **Choisir un fichier** → sélectionner `scolia_bd_version_finale.sql`
7. Cliquer **Importer** en bas de page
8. ✅ Message de succès : *L'importation s'est terminée avec succès*

### 3. Configurer le backend

```bash
composer install
cp .env.example .env
php artisan key:generate
```

Modifier `.env` :
```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=scolia
DB_USERNAME=root
DB_PASSWORD=

FRONTEND_URL=http://localhost:5173
SANCTUM_STATEFUL_DOMAINS=localhost:5173
```

```bash
php artisan storage:link
php artisan migrate
```

### 4. Configurer le frontend

```bash
cd frontend
npm install
```

Créer `frontend/.env` :
```env
VITE_API_URL=http://localhost:8000/api
```

---

## Démarrage

**Terminal 1 — Backend :**
```bash
cd scolia
php artisan serve
```

**Terminal 2 — Frontend :**
```bash
cd frontend
npm run dev
```

Ouvrir **http://localhost:5173**

---

## Connexion

| Rôle | Username | Mot de passe |
|---|---|---|
| Root | `root` | `root123` |

---


