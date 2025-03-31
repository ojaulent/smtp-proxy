# Utilisation de l'image Node.js officielle
FROM node:18

# Définition du répertoire de travail dans le conteneur
WORKDIR /app

# Copie des fichiers package.json et package-lock.json (si existant)
COPY package*.json ./

# Installation des dépendances
RUN npm install

# Copie du reste des fichiers de l'application
COPY . .

# Exposition du port SMTP (25)
EXPOSE 25

# Commande pour démarrer l'application
CMD ["node", "index.js"]
