# Portfolio IB

Monorepo avec :
- Frontend principal React/Vite (`/src`)
- Backend Node.js + Express en ESM modulaire (`/Backend`)
- Backoffice React dédié (`/backoffice`)

## 1) Frontend principal

```bash
npm install
npm run dev
```

Variables d’environnement :

```bash
cp .env.example .env
```

`VITE_API_URL` pointe vers l’API backend (par défaut `http://localhost:4000/api`).

## 2) Backend API

```bash
cd Backend
npm install
cp .env.example .env
npm run dev
```

API disponible sur `http://localhost:4000`.

Routes principales :
- `GET /api/health`
- `GET /api/projects`
- `GET /api/projects/:slug`
- `POST /api/messages`
- `GET /api/admin/messages` (header `x-admin-key`)
- `PATCH /api/admin/messages/:id/status` (header `x-admin-key`)
- `POST /api/projects` (header `x-admin-key`)

## 3) Base de données MySQL

1. Créer la base et les tables avec :

```bash
mysql -u root -p < Backend/database/schema.sql
```

2. Adapter les variables `DB_*` dans `Backend/.env`.

Le backend fonctionne en fallback si MySQL est indisponible (projets par défaut).

## 4) Backoffice React

```bash
cd backoffice
npm install
cp .env.example .env
npm run dev
```

Backoffice sur `http://localhost:3100` :
- Login par clé admin (`ADMIN_API_KEY`)
- Gestion des messages
- Création de projets

## Raccourcis utiles depuis la racine

- `npm run dev` : frontend
- `npm run dev:api` : backend
- `npm run dev:backoffice` : backoffice
