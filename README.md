# Salon de la Danse — Gestion des bénévoles

Application web qui organise les bénévoles du Salon de la Danse de bout en
bout : inscription sur invitation, choix des créneaux, validation du planning,
supervision par la régie, badges et exports.

Le dépôt réunit les deux espaces de l'application :

- **Espace bénévole** : inscription, planning interactif, récapitulatif.
- **Back-office de la régie** (`/admin`) : suivi, planning global, invitations,
  badges, relances, journal, réglages des éditions.

## Stack technique

| Domaine            | Outils                                                                 |
| ------------------ | ---------------------------------------------------------------------- |
| Framework          | **Next.js 16** (App Router, Server Components, Server Actions, `proxy.ts`) |
| UI                 | **React 19**, **Tailwind CSS 4**, icônes Fluent (générées en local)    |
| Langage            | **TypeScript** strict (`noUncheckedIndexedAccess`, aucun `any`)        |
| Base de données    | **PostgreSQL** + **Prisma 7** (`@prisma/adapter-pg`, client généré dans `src/generated/prisma`) |
| Authentification   | **Better Auth** (e-mail / mot de passe, sessions, plugin admin)        |
| Validation / forms | **Zod 4**, **React Hook Form** + `@hookform/resolvers`                 |
| E-mails            | **Nodemailer** (SMTP ; Mailpit en local)                               |
| Documents          | **ExcelJS** (export `.xlsx`), CSV, **qrcode** (QR des badges en SVG), vues d'impression PDF |
| Qualité            | **Vitest**, **ESLint 9** (config Next), `tsc --noEmit`                 |

## Fonctionnalités

### Espace bénévole

- **Inscription sur invitation** : code d'invitation à usage unique, photo
  d'identité (JPEG / PNG / WebP, 5 Mo max), acceptation des CGU. Le code est
  libéré si l'inscription échoue. Limitation des tentatives par adresse IP.
- **Connexion et mot de passe oublié** : lien de réinitialisation par e-mail
  (valable 60 min), avec limitation des demandes.
- **Tableau de bord** : état du planning, prochaines échéances.
- **Planning interactif** : grille des missions par jour, jauges de places
  (libre / tendu / complet). Règles métier vérifiées en temps réel côté client
  et revérifiées côté serveur :
  - 1 à 3 créneaux par bénévole ;
  - aucun chevauchement ;
  - pas plus de 2 créneaux consécutifs ;
  - capacité de chaque mission respectée.
- **Validation définitive** : le planning passe de brouillon à verrouillé ;
  seule la régie peut ensuite le modifier. Un bénévole ne peut pas retirer un
  poste attribué par la régie.
- **Récapitulatif** avec vue imprimable (PDF via le navigateur).
- Pages légales : **CGU** et **politique de confidentialité**.

### Back-office de la régie (`/admin`)

- **Connexion dédiée** (`/admin/connexion`), réservée au rôle ADMIN, rôle
  revérifié dans chaque page et chaque Server Action.
- **Vue d'ensemble** : compte à rebours avant le Salon, indicateurs clés, taux
  de remplissage, entonnoir d'inscription, carte de chaleur du week-end, liste
  des tâches restantes, thème clair / sombre.
- **Bénévoles** : liste filtrée et paginée, fiche détaillée, modification du
  profil et de la photo, mot de passe temporaire, contrôle des règles.
- **Planning global** : grille de toutes les missions, affectation manuelle,
  postes sensibles (attribution forcée), modification des jauges.
- **Invitations** : génération de codes en lot, envoi et renvoi par e-mail,
  filtres, suppression.
- **Badges** : planches imprimables avec photo et QR code, liste des photos
  manquantes, page de **vérification** ouverte par le QR code.
- **Relances e-mail** : plannings non validés, photos manquantes, rappel avant
  le Salon.
- **Exports** : bénévoles et planning en **Excel** ou **CSV** (mêmes filtres
  qu'à l'écran), vues d'impression (contacts, listes par mission, badges).
- **Journal d'audit** : historique des actions par catégorie (bénévoles,
  affectations, grille, invitations, éditions), groupé par jour.
- **Réglages des éditions** : création d'une édition (reprise de la grille
  précédente décalée d'un an, heure de Paris conservée), archivage, fenêtre
  d'inscription, verrouillage des inscriptions, missions et quotas, message
  d'accueil avec aperçu.

### Sécurité

- Validation Zod de toute entrée côté serveur, même déjà validée côté client.
- Autorisation au plus près des données (`proxy.ts` n'est qu'un premier filtre).
- Redirections après connexion limitées aux chemins internes.
- Photos stockées hors de `public/`, servies par un Route Handler protégé.
- Secret d'authentification refusé au démarrage s'il vaut la valeur d'exemple.
- Variables d'environnement validées au démarrage (`src/lib/env.ts`).

## Prérequis

- Node.js ≥ 22
- Un PostgreSQL accessible (local ou distant)
- Un serveur SMTP (en local : [Mailpit](https://mailpit.axllent.org/))
- ⚠️ **Accès réseau à `binaries.prisma.sh`** : Prisma télécharge son moteur lors
  de `prisma generate` / `migrate`. Sur un réseau qui le bloque (erreur
  `403 Forbidden`), ces commandes échouent.

## Mise en route

```bash
cp .env.example .env          # renseigner DATABASE_URL, BETTER_AUTH_SECRET, SMTP_*
npm install
npx prisma generate           # génère le client dans src/generated/prisma
npx prisma migrate dev        # applique les migrations
npm run db:seed               # édition, grille et comptes démo
npm run dev                   # http://localhost:3000
```

## Comptes de démonstration

Mot de passe commun : `SalonDemo2027!`

| E-mail                          | Rôle     | État                         | Connexion          |
| ------------------------------- | -------- | ---------------------------- | ------------------ |
| `admin@salon-danse.example`     | ADMIN    | —                            | `/admin/connexion` |

Codes d'invitation libres pour tester l'inscription des bénévoles : `INV-SEVL32`,
`INV-YQ8NHD`, `INV-YYVU64`.
