# Stratégie CI/CD — Jaydee Kanban

## Objectifs
- Automatiser les vérifications : chaque modification est compilée et testée sans
  intervention humaine.
- Détecter les régressions avant la fusion dans master, pas en production.
- Livrer de façon reproductible : la même image Docker du test à la production.

## Déclencheurs
- pull_request : build et tests avant toute fusion ; la fusion est bloquée si ça échoue.
- push sur master : mêmes vérifications, puis construction de l'image Docker.
- release (publication d'une version) : déploiement en production après approbation.

## Étapes du pipeline
1. Installation : npm ci, qui respecte exactement le package-lock.json.
2. Build : npm run build (compilation TypeScript).
3. Tests : npx vitest run (intégration avec MongoDB en mémoire, aucun service externe).
4. Audit : npm audit --omit=dev --audit-level=high.
5. Image : docker build, publiée sur un registre avec le hash du commit comme tag.
6. Déploiement : docker compose pull && docker compose up -d sur le serveur,
   puis vérification de GET /health.

## Extrait du pipeline (GitHub Actions)
```yaml
name: CI
on:
  push:
    branches: [master]
  pull_request:
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run build
      - run: npx vitest run
```

## Gestion des secrets
- Aucun secret dans le code ni dans le YAML : JWT_SECRET, identifiants du registre
  Docker et clé SSH du serveur sont stockés dans les secrets GitHub.
- Ils sont lus avec ${{ secrets.NOM }} et masqués automatiquement dans les logs.
- Le fichier .env de production reste sur le serveur, jamais dans le dépôt.

## Validations avant mise en production
- Build et tests verts (bloquant).
- Pull request relue et approuvée (règle de protection de la branche master).
- Aucune vulnérabilité élevée ou critique dans les dépendances.
- Approbation manuelle de l'environnement production dans GitHub.
- Après déploiement, /health doit répondre 200 ; sinon, redéploiement de l'image
  précédente (retour arrière).