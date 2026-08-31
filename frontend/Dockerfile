FROM ghcr.io/pnpm/pnpm:11.25.0

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

CMD ["pnpm", "start"]
