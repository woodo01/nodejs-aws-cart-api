FROM node:18-alpine
WORKDIR /app
RUN npm ci
RUN npm run build
RUN npm prune --omit=dev

EXPOSE 4000

CMD ["node", "dist/main"]