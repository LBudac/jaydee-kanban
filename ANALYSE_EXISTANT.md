# Analyse de l'existant — Jaydee Kanban

## Architecture
Le projet est une API REST écrite en TypeScript avec Node.js et Express 5. Les données sont stockées dans MongoDB, via Mongoose 8. Le code suit une organisation en couches : routes, puis middlewares, puis contrôleurs, puis modèles.
- `src/main.ts` lance l'application ; `src/app.ts` configure Express et l'exporte pour les tests.
- `src/config/` regroupe la validation des variables d'environnement (Zod), la connexion à MongoDB et la journalisation (Pino).
- Routes : `/api/auth` (inscription, connexion), `/api/columns` (CRUD), `/api/ofs` (CRUD et déplacement d'un OF) et `/health`. Modèles Mongoose : `User`, `Column`, `OF`.
- `tests/` contient des tests pour auth, ofs et la route health ; `columns.test.ts` est vide.
- **Exécution** : après création du `.env` et lancement de MongoDB, `npm run dev` démarre et `GET /health` répond. `npm test` : les 35 tests fournis passent, mais la commande échoue car `columns.test.ts` est vide (« No test suite found »). Les tests lisent le `.env` : sans lui, ils ne démarreraient pas.

## Dépendances principales
- **Production** : express, mongoose, jsonwebtoken, bcryptjs, zod, pino, cors, dotenv.
- **Développement** : typescript, tsx, vitest, supertest, mongodb-memory-server.
- helmet et express-rate-limit figurent dans les dépendances, mais le code ne les utilise pas.

## Variables d'environnement
| Variable | Statut | Rôle |
|---|---|---|
| `MONGODB_URI` | obligatoire | adresse de la base MongoDB |
| `JWT_SECRET` | obligatoire (32 caractères min.) | clé de signature des jetons |
| `PORT`, `NODE_ENV`, `JWT_EXPIRES_IN`, `CORS_ORIGIN` | facultatives | configuration du serveur |

L'énoncé mentionne `MONGO_URI`, mais le code attend `MONGODB_URI`.
Si l'une des deux variables obligatoires manque, l'application refuse de démarrer.

## Risques identifiés
1. **Build impossible** : `npm run build` échoue avec l'erreur TS6059. Sans build, `npm start` ne peut pas fonctionner en production.
2. **Dépendances vulnérables** : 10 vulnérabilités connues touchent les dépendances de production, dont 2 critiques.
3. **Sécurité HTTP insuffisante** : aucun en-tête de sécurité, aucune limite de débit. La route `/login` peut donc subir une attaque par force brute. Par défaut, CORS accepte toutes les origines (`*`).
4. **Fuite de secret dans les logs** : au démarrage, l'URI MongoDB est journalisée en entier, y compris le mot de passe s’il y en a un.
5. **Documentation et configuration incomplètes** : ni `.gitignore` ni `.env.example`, et le README contient des erreurs (il mentionne Node 18 et présente `GET /api/columns` comme public alors que cette route demande un JWT).
6. **Runtime en fin de vie** : Node 20, imposé par le contexte, n'est plus maintenu depuis le 30 avril 2026.

## Priorités avant la mise en production
1. Corriger le build et ajouter `.gitignore` et `.env.example`, conditions minimales pour que l'application démarre.
2. Mettre à jour les dépendances vulnérables, car ces failles sont publiques et documentées.
3. Activer helmet et la limitation de débit, et ne plus écrire l'URI MongoDB dans les logs.
4. Écrire les tests des routes `columns`, conteneuriser l'application et lancer les tests automatiquement en CI.
5. Prévoir la migration vers Node 24, maintenu en LTS jusqu'en avril 2028.
