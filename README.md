# Enterprise Notification Service

A scalable, fault-tolerant, and configurable notification system built with NestJS that handles notifications across multiple channels (Email, SMS, WhatsApp, Push) with comprehensive tracking and monitoring capabilities.

## Features

### 🚀 Core Features

- **Multi-Channel Support**: Email (SendGrid), SMS/WhatsApp (Twilio), and Push Notifications
- **Queue Management**: Redis + BullMQ with priority-based queues and dead letter queue
- **User Preferences**: Configurable notification channel preferences per user
- **Transaction Tracking**: Complete audit trail of all notifications with Prisma + PostgreSQL
- **Error Handling**: Comprehensive error logging and retry mechanisms
- **Admin Dashboard**: Monitoring, reporting, and analytics APIs

### 📊 Queue System

- **Priority Queues**: Separate queues for high/urgent notifications
- **Dead Letter Queue**: Handles notifications that fail after max retries
- **Retry Logic**: Exponential backoff with configurable retry attempts
- **Concurrency Control**: Configurable worker concurrency per queue

### 🔍 Tracking & Monitoring

- Transaction ID tracking for every notification
- Real-time status updates (Pending, Queued, Processing, Sent, Failed, Retry, Dead Letter)
- Detailed error logs with error types and retryability
- Failure reason tracking
- Retry count monitoring

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL with Prisma ORM
- **Queue**: Redis + BullMQ
- **Email**: SendGrid
- **SMS/WhatsApp**: Twilio
- **Language**: TypeScript

## Prerequisites

- Node.js (v18+)
- PostgreSQL
- Redis
- SendGrid API Key (for email)
- Twilio Account (for SMS/WhatsApp)

## Installation

1. **Clone and install dependencies:**

```bash
npm install
```

2. **Set up environment variables:**

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

3. **Set up the database:**

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate
```

4. **Start the application:**

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## API Endpoints

### Send Notifications

**POST** `/notifications/send`
```json
{
  "userId": "uuid",
  "notificationType": "TRANSACTIONAL",
  "channel": "EMAIL",
  "content": "Your notification message",
  "subject": "Notification Subject",
  "recipient": "user@example.com",
  "priority": 2,
  "metadata": {}
}
```

**POST** `/notifications/send-bulk`
```json
{
  "notifications": [
    {
      "userId": "uuid",
      "notificationType": "TRANSACTIONAL",
      "channel": "EMAIL",
      "content": "Message",
      "recipient": "user@example.com"
    }
  ]
}
```

### User Preferences

**GET** `/users/:userId/preferences`
- Get user notification preferences

**PUT** `/users/:userId/preferences`
```json
{
  "emailEnabled": true,
  "smsEnabled": false,
  "whatsappEnabled": true,
  "pushEnabled": false,
  "emailPriority": 1,
  "smsPriority": 2,
  "whatsappPriority": 3,
  "pushPriority": 4
}
```

### Admin Dashboard

**GET** `/admin/dashboard?userId=uuid`
- Get dashboard statistics and queue stats

**GET** `/admin/transactions`
- Search transactions with filters:
  - `transactionId`
  - `userId`
  - `status` (PENDING, SENT, FAILED, etc.)
  - `channel` (EMAIL, SMS, WHATSAPP, PUSH)
  - `failureReason`
  - `startDate`, `endDate`
  - `limit`, `offset`

**GET** `/admin/transactions/:transactionId`
- Get specific transaction details

**GET** `/admin/failed`
- Get failed transactions with error filters

**GET** `/admin/analytics/errors?startDate=2024-01-01&endDate=2024-01-31`
- Get error analytics

**GET** `/admin/analytics/channels?startDate=2024-01-01&endDate=2024-01-31`
- Get channel performance metrics

## Database Schema

### Users
- User information and authentication

### NotificationPreferences
- User channel preferences and priorities

### NotificationTransaction
- Complete transaction history with:
  - Transaction ID (UUID)
  - User ID
  - Notification type and channel
  - Status and timestamps
  - Failure reasons
  - Retry counts
  - Priority levels

### ErrorLog
- Detailed error logs with:
  - Error type (RETRYABLE, NON_RETRYABLE, NETWORK_ERROR, etc.)
  - Error messages and stack traces
  - Provider responses
  - Retryability flags

## Configuration

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/notification_db"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# SendGrid
SENDGRID_API_KEY=your_key
SENDGRID_FROM_EMAIL=noreply@example.com

# Twilio
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890

# Retry Configuration
MAX_RETRY_ATTEMPTS=3
RETRY_DELAY_MS=5000
BACKOFF_MULTIPLIER=2

# Queue Configuration
QUEUE_CONCURRENCY=10
PRIORITY_QUEUE_CONCURRENCY=20
```

## Queue Architecture

### Regular Queue
- Handles low and medium priority notifications
- Default concurrency: 10 workers

### Priority Queue
- Handles high and urgent notifications
- Default concurrency: 20 workers
- Faster processing for critical notifications

### Dead Letter Queue
- Stores notifications that failed after max retries
- No automatic retries
- Manual review and reprocessing

## Error Handling

The system categorizes errors into:

- **RETRYABLE**: Network errors, timeouts, rate limits (429, 503)
- **NON_RETRYABLE**: Authentication errors (401, 403), invalid data (400)
- **NETWORK_ERROR**: Connection issues
- **PROVIDER_ERROR**: External provider failures
- **RATE_LIMIT**: Rate limiting errors
- **AUTHENTICATION_ERROR**: Auth failures

## Scalability

- **Horizontal Scaling**: Multiple worker instances can process queues
- **Database Optimization**: Indexed queries for fast lookups
- **Queue Management**: Efficient job processing with BullMQ
- **Connection Pooling**: Prisma connection pooling for database

## Monitoring

The admin dashboard provides:

- Real-time queue statistics
- Transaction status breakdowns
- Error analytics and trends
- Channel performance metrics
- Success/failure rates
- Failed transaction details

## Development

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio

# Run tests
npm run test

# Lint code
npm run lint
```

## License

MIT

