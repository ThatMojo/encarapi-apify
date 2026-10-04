FROM apify/actor-node:20
COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund
COPY . ./
CMD ["node", "src/main.js"]
