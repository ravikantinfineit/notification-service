# Quick Setup Guide

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/notification_db?schema=public"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# SendGrid (for Email)
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@example.com

# Twilio (for SMS/WhatsApp)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890

# Application
PORT=3000
NODE_ENV=development

# Retry Configuration
MAX_RETRY_ATTEMPTS=3
RETRY_DELAY_MS=5000
BACKOFF_MULTIPLIER=2

# Queue Configuration
QUEUE_CONCURRENCY=10
PRIORITY_QUEUE_CONCURRENCY=20
```

## Step 3: Set Up Database

### Option A: Using Docker Compose (Recommended)

```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Wait for services to be ready, then run migrations
npm run prisma:migrate
npm run prisma:generate
```

### Option B: Local PostgreSQL

1. Create a PostgreSQL database named `notification_db`
2. Update `DATABASE_URL` in `.env`
3. Run migrations:

```bash
npm run prisma:migrate
npm run prisma:generate
```

## Step 4: Start Redis

### Option A: Using Docker

```bash
docker-compose up -d redis
```

### Option B: Local Redis

```bash
# macOS
brew install redis
brew services start redis

# Linux
sudo apt-get install redis-server
sudo systemctl start redis

# Or use Docker
docker run -d -p 6379:6379 redis:7-alpine
```

## Step 5: Start the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The service will be available at `http://localhost:3000`

## Step 6: Verify Installation

### Test the API

```bash
# Health check (if you add a health endpoint)
curl http://localhost:3000

# Send a test notification
curl -X POST http://localhost:3000/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-id",
    "notificationType": "TRANSACTIONAL",
    "channel": "EMAIL",
    "content": "Test notification",
    "recipient": "test@example.com"
  }'
```

### Check Database

```bash
# Open Prisma Studio to view data
npm run prisma:studio
```

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running: `pg_isready`
- Check `DATABASE_URL` in `.env`
- Ensure database exists: `createdb notification_db`

### Redis Connection Issues

- Verify Redis is running: `redis-cli ping`
- Check `REDIS_HOST` and `REDIS_PORT` in `.env`
- Test connection: `redis-cli -h localhost -p 6379`

### Provider Configuration

- **SendGrid**: Get API key from [SendGrid Dashboard](https://app.sendgrid.com/)
- **Twilio**: Get credentials from [Twilio Console](https://console.twilio.com/)
- For testing, you can use Twilio's trial account (limited functionality)

### Migration Issues

```bash
# Reset database (WARNING: Deletes all data)
npm run prisma:migrate reset

# Create a new migration
npm run prisma:migrate dev --name init
```

## Next Steps

1. Review the [README.md](./README.md) for detailed documentation
2. Check [API_EXAMPLES.md](./API_EXAMPLES.md) for API usage examples
3. Set up monitoring and alerting for production
4. Configure authentication/authorization for admin endpoints
5. Set up CI/CD pipeline for deployments

## Production Checklist

- [ ] Set up proper authentication/authorization
- [ ] Configure HTTPS/TLS
- [ ] Set up monitoring and alerting (e.g., Prometheus, Grafana)
- [ ] Configure log aggregation (e.g., ELK stack)
- [ ] Set up database backups
- [ ] Configure rate limiting
- [ ] Set up health check endpoints
- [ ] Configure CORS properly
- [ ] Review and optimize database indexes
- [ ] Set up Redis persistence
- [ ] Configure proper error tracking (e.g., Sentry)

