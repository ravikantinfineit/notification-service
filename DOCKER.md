# Docker Setup

## Quick Start with Docker Compose

This project includes Docker Compose configuration for easy local development.

### Prerequisites

- Docker
- Docker Compose

### Running the Stack

1. **Start all services:**

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database
- Redis server
- The notification service

2. **Run database migrations:**

```bash
docker-compose exec app npm run prisma:migrate
```

3. **Generate Prisma Client:**

```bash
docker-compose exec app npm run prisma:generate
```

### Environment Variables

Create a `.env` file in the project root with your configuration. The Docker Compose file will automatically load it.

### Accessing Services

- **Application**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

### Stopping Services

```bash
docker-compose down
```

### Viewing Logs

```bash
docker-compose logs -f app
```

