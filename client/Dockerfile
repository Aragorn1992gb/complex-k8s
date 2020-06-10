# Multi-step dockerfile

# Fase iniziale
# FROM node:alpine as builder

# Usa un builder senza nome se deploy su AWS elastic-beanstalk
FROM node:alpine
# FROM node:alpine as builder

WORKDIR "/app"

# Metti l'asterisco dopo package se deploy sy AWS elastic-beanstalk
COPY ./package*.json ./
# COPY package.json ./
RUN npm install
COPY . .

# "build" perchè dobbiamo avviare quello di prod. CI sarà una cartella "build" nella working directory "app" in cui vi saranno tutti i file di produzione
RUN npm run build


# Fase finale
FROM nginx

# Serve solo per AWS elastic-beanstalk per mappare la porta per il traffico in entrata (il server di prod sta sulla porta 3000, come dichiarato anche in ./nginx/default.conf)
EXPOSE 3000

# Copio sul risultato di "npm run build" deployato in /app/build nella cartella del server nginx
#COPY --from=builder /app/build /usr/share/nginx/html

# Visto che sto usando un builder senza nome, metto =0. Copiamo tutti i production assets di base della prima fase (senza nome, quindi mettiamo , altrimenti sarebbe "builder" o altro nome della fase). Notiamo questo percorso anche in ./nginx/default.conf
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf 
COPY --from=0 /app/build /usr/share/nginx/html
#COPY --from=builder /app/build /usr/share/nginx/html