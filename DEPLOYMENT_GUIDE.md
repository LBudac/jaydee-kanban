# Guide de déploiement — Jaydee Kanban

Sous Windows, exécutez les commandes dans Git Bash.

## 1. Prérequis
- Node.js 20 et npm (vérifier : node -v et npm -v)
- Docker Desktop, avec Docker Compose (vérifier : docker compose version)
- Git

## 2. Configuration
    git clone <url-du-depot> jaydee-kanban
    cd jaydee-kanban
    cp .env.example .env
Dans .env, remplacer JWT_SECRET par une chaîne aléatoire d'au moins 32 caractères :
    node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

## 3. Lancement en local (développement)
    docker run -d --name kanban-mongo -p 27017:27017 mongo:7
    npm ci
    npm run dev
Vérification : curl http://localhost:3000/health renvoie {"status":"ok", ...}

Version compilée, sans Docker :
    npm run build
    NODE_ENV=production npm start

## 4. Lancement avec Docker (API + MongoDB)
Arrêter d'abord tout ce qui utilise le port 3000 (npm run dev, conteneur kanban-mongo).
    docker compose up -d --build
    docker compose ps
    docker compose logs -f api
Vérification : curl http://localhost:3000/health
Arrêt : docker compose down (ajouter -v efface aussi les données)

## 5. Tests
    npx vitest run          # exécution unique ; MongoDB en mémoire, rien à lancer
    npm test                # mode surveillance : relance à chaque modification
    npm run test:coverage   # avec le taux de couverture
Au premier lancement, MongoDB en mémoire est téléchargé (connexion internet nécessaire).

## 6. Mise à jour
    git pull
    npm ci                          # réinstalle si package-lock.json a changé
    npm run build && npx vitest run # vérifier avant de redéployer
    docker compose up -d --build    # reconstruit l'API ; les données restent dans le volume
    curl http://localhost:3000/health
En cas de problème : git checkout <version-précédente> puis docker compose up -d --build.

## 7. Dépannage
- "Invalid environment variables" : .env absent ou incomplet -> cp .env.example .env
- "MongoDB connection error" : base arrêtée ou MONGODB_URI incorrecte
- "Cannot find module .../dist/main.js" : lancer npm run build avant npm start
- "EADDRINUSE :3000" ou "port is already allocated" : un autre programme utilise le port 3000