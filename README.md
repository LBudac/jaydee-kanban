# Jaydee Kanban — API

API REST de suivi des ordres de fabrication (OF) en Kanban pour l'atelier d'injection
plastique Jaydee. Node.js 20 · Express 5 · MongoDB · TypeScript.

## Contexte
Jaydee a développé cette API pour suivre la production et gérer les priorités.
Ce dépôt la prépare à la mise en production : tests, sécurité, conteneurisation,
stratégie CI/CD et documentation.

## Démarrage rapide
    cp .env.example .env      # puis renseigner JWT_SECRET
    docker compose up -d --build
    curl http://localhost:3000/health
Installation détaillée, tests et mise à jour : DEPLOYMENT_GUIDE.md

## Routes principales
Toutes exigent un JWT (en-tête Authorization: Bearer <jeton>), sauf /health et /api/auth.
- POST /api/auth/register, POST /api/auth/login
- GET et POST /api/columns ; GET, PUT et DELETE /api/columns/:id
- GET et POST /api/ofs ; GET, PUT et DELETE /api/ofs/:id ; PATCH /api/ofs/:id/move

## Choix techniques
- Vitest + Supertest : rapides, compatibles TypeScript et modules ES ; Supertest teste
  l'application sans ouvrir de port.
- MongoDB en mémoire pour les tests : tests isolés, aucune base à installer.
- Docker multi-stage : l'image de production ne contient ni TypeScript ni outils de test.
- Docker Compose : l'API et MongoDB démarrent ensemble, la base n'est pas exposée.
- GitHub Actions : build et tests à chaque push et pull request.

## Sécurité
helmet, limitation des requêtes (10 par 15 min sur /api/auth), taille maximale du JSON,
dépendances mises à jour, aucun secret dans les logs. Détails et limites : NOTE_SECURITE.md

## Documents du projet
- ANALYSE_EXISTANT.md : structure, risques et priorités
- CI_CD_STRATEGIE.md : pipeline d'intégration et de déploiement
- NOTE_SECURITE.md : mesures de sécurité et limites
- DEPLOYMENT_GUIDE.md : installation, exécution, tests, mise à jour
- docs/captures/ : résultats des tests, limitation des requêtes, conteneurs Docker

## Auteur et version
Laurentiu Budac — version 1.1.0 (novembre 2026)