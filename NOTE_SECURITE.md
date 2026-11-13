# Note de sécurité — Jaydee Kanban

## Risques retenus
1. Brute force sur /api/auth/login : sans limite, un attaquant peut essayer
   des milliers de mots de passe.
2. Abus d'API et déni de service : requêtes en rafale ou corps JSON géants.
3. En-têtes HTTP faibles : X-Powered-By révèle Express, aucune protection
   côté navigateur (nosniff, Content-Security-Policy…).
4. Dépendances vulnérables : 10 failles connues en production avant mise à jour.
5. Fuite d'information : l'URI MongoDB, mot de passe compris, écrite dans les logs.

## Mesures mises en place
- helmet (src/middlewares/security.middleware.ts) : en-têtes de sécurité,
  suppression de X-Powered-By.
- Limiteur sur /api/auth : 10 requêtes par IP et par tranche de 15 minutes,
  puis réponse 429.
- Limiteur sur /api : 100 requêtes par IP et par tranche de 15 minutes.
- express.json({ limit: '10kb' }) : un corps plus gros est refusé (413).
- Dépendances mises à jour : npm audit --omit=dev ne signale plus de faille.
- URI retirée des logs (src/config/db.ts).
- Contrôle JWT existant (auth.middleware.ts) : 401 sans jeton valide.

## Vérifications
- tests/security.test.ts : en-têtes présents, 401 sans jeton et avec un jeton falsifié.
- Test manuel : la 11e requête sur /api/auth en 15 minutes reçoit 429.

## Limites
- Le compteur des limiteurs est en mémoire : il repart à zéro au redémarrage
  et n'est pas partagé entre plusieurs instances (il faudrait Redis).
- Derrière un reverse proxy, il faut app.set('trust proxy', 1), sinon toutes
  les requêtes semblent venir du proxy et tout le monde est bloqué ensemble.
- Les limiteurs sont désactivés pendant les tests automatisés.
- Aucun rôle : tout utilisateur connecté peut supprimer toutes les colonnes.
- Un JWT volé reste valide jusqu'à expiration (7 jours par défaut).
- HSTS n'a d'effet qu'en HTTPS, à assurer par le reverse proxy.
- CORS reste ouvert à * si CORS_ORIGIN n'est pas défini.

## Améliorations proposées
- Définir CORS_ORIGIN sur l'URL du front en production.
- Réduire JWT_EXPIRES_IN à 1h et ajouter un jeton de rafraîchissement.
- Ajouter des rôles (réponse 403) pour les suppressions.
- Exécuter npm audit dans la CI et passer à Node 24.