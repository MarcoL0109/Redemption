FROM node:20-alpine
WORKDIR /app

COPY package.json yarn.lock* ./
COPY Frontend/package.json Frontend/yarn.lock* ./Frontend/

RUN yarn install 

RUN cd Frontend && yarn install

# ─── ADD THIS LINE HERE TO COPY ALL YOUR SOURCE CODE ───
COPY . .

ENV PATH /app/node_modules/.bin:/app/Frontend/node_modules/.bin:$PATH

WORKDIR /app/Frontend
CMD ["vite", "--host"]