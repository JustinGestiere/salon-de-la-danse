# Salon de la Danse — Espace bénévole

Application web / PWA de gestion des bénévoles du Salon de la Danse. Ce dépôt
contient la **partie bénévole** (inscription, planning interactif, récapitulatif,
export). La partie administration est développée séparément.

## Stack

- **Next.js 16** (App Router, Server Components, Server Actions)
- **TypeScript** strict (`noUncheckedIndexedAccess`, aucun `any`)
- **Prisma 7** + `@prisma/adapter-pg` + **PostgreSQL**
- **Better Auth** (e-mail / mot de passe, sessions)
- **Zod**, **React Hook Form**, **Tailwind CSS 4**
- **Vitest** (règles métier testées unitairement)

## Prérequis

- Node.js ≥ 22
- Un PostgreSQL accessible (local ou distant)
- ⚠️ **Accès réseau à `binaries.prisma.sh`** : Prisma télécharge son moteur
  (schema-engine) depuis cet hôte lors de `prisma generate` / `migrate`. Sur un
  réseau dont la politique de sortie le bloque (erreur `403 Forbidden`), ces
  commandes échouent. Autoriser cet hôte, ou lancer l'installation sur un réseau
  non restreint.

## Mise en route

```bash
cp .env.example .env          # puis renseigner DATABASE_URL et BETTER_AUTH_SECRET
npm install                   # installe les dépendances (postinstall Prisma inclus)
npx prisma generate           # génère le client dans src/generated/prisma
npx prisma migrate dev --name init
npm run db:seed               # crée l'édition, la grille et les comptes démo
npm run dev                   # http://localhost:3000
```

Générer un secret : `openssl rand -base64 32` → `BETTER_AUTH_SECRET`.

## Scripts

| Script              | Rôle                                    |
| ------------------- | --------------------------------------- |
| `npm run dev`       | Serveur de développement                |
| `npm run build`     | Build de production                     |
| `npm run typecheck` | `tsc --noEmit`                          |
| `npm run lint`      | ESLint (config Next flat)               |
| `npm run test`      | Tests unitaires Vitest                  |
| `npm run db:seed`   | Jeu de données de démonstration         |

## Comptes de démonstration

Mot de passe commun : `SalonDemo2027!`

| E-mail                              | Rôle      | État                          |
| ----------------------------------- | --------- | ----------------------------- |
| `admin@salon-danse.example`         | ADMIN     | —                             |
| `benevole1@salon-danse.example`     | Bénévole  | Brouillon vide                |
| `benevole2@salon-danse.example`     | Bénévole  | Brouillon avec créneaux       |
| `benevole3@salon-danse.example`     | Bénévole  | Planning validé (verrouillé)  |

Codes d'invitation libres pour tester l'inscription : `DEMO-ALPHA`,
`DEMO-BRAVO`, `DEMO-CHARLIE`.

## Architecture

Découpage par fonctionnalité (feature-first), trois couches qui ne se
court-circuitent pas (entrée → service → accès données) :

```
src/
  app/                       # routing : pages, layouts, loading, error
    (auth)/                  # connexion, inscription (public)
    (app)/                   # espace connecté (garde de session)
    (print)/                 # vue d'impression PDF du planning
    cgu/ confidentialite/    # pages légales (publiques)
    api/auth/[...all]/       # Route Handler Better Auth
  features/
    auth/                    # schémas, service d'inscription, actions, gardes
    editions/                # édition active, fenêtre d'inscription
    planning/                # rules.ts (règles pures + tests), service, actions, grille
    volunteers/              # récapitulatif, filtres, export imprimable
  components/ui/             # primitives réutilisables
  lib/                       # db, env, auth, result, errors, format
  generated/prisma/          # client Prisma généré (non versionné)
prisma/                      # schema.prisma, seed.ts
proxy.ts                     # ex-middleware Next 16 (premier filtre de session)
```

Les règles métier du planning (1–3 créneaux, non-chevauchement, pas plus de 2
créneaux consécutifs, jauges) vivent dans `src/features/planning/rules.ts` sous
forme de fonctions pures, réutilisées côté client (retour immédiat) et côté
serveur (source de vérité), et couvertes par `rules.test.ts`.
