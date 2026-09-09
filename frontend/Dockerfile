FROM ghcr.io/pnpm/pnpm:11.25.0

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

ARG VITE_BACKEND_URL=""
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

COPY . .
RUN pnpm run build

CMD ["pnpm", "start"]
