# Environment Variables Setup Guide

## Quick Start

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file** with your actual credentials

3. **Required variables** (minimum to get started):
   - `DATABASE_URL` - PostgreSQL connection string
   - `REDIS_HOST` - Redis server host
   - `REDIS_PORT` - Redis server port
   - `SENDGRID_API_KEY` - For email notifications
   - `TWILIO_ACCOUNT_SID` - For SMS/WhatsApp notifications
   - `TWILIO_AUTH_TOKEN` - For SMS/WhatsApp notifications

## Detailed Configuration

### Database Configuration

**DATABASE_URL**
- Format: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA`
- Example: `postgresql://postgres:mypassword@localhost:5432/notification_db?schema=public`
- Required: Yes
- How to get: Create a PostgreSQL database and use the connection string

### Redis Configuration

**REDIS_HOST**
- Default: `localhost`
- Required: Yes
- Description: Redis server hostname or IP address

**REDIS_PORT**
- Default: `6379`
- Required: Yes
- Description: Redis server port

**REDIS_PASSWORD**
- Default: (empty)
- Required: No (unless Redis is password-protected)
- Description: Redis authentication password

### SendGrid Configuration (Email)

**SENDGRID_API_KEY**
- Required: Yes (for email notifications)
- How to get:
  1. Sign up at [SendGrid](https://sendgrid.com/)
  2. Go to Settings → API Keys
  3. Create a new API key with "Mail Send" permissions
  4. Copy the key (you can only see it once!)

**SENDGRID_FROM_EMAIL**
- Required: Yes (for email notifications)
- Format: `noreply@yourdomain.com`
- How to set up:
  1. Verify your sender email/domain in SendGrid
  2. Go to Settings → Sender Authentication
  3. Add and verify your email address or domain

### Twilio Configuration (SMS/WhatsApp)

**TWILIO_ACCOUNT_SID**
- Required: Yes (for SMS/WhatsApp notifications)
- How to get:
  1. Sign up at [Twilio](https://www.twilio.com/)
  2. Go to Console Dashboard
  3. Copy your Account SID

**TWILIO_AUTH_TOKEN**
- Required: Yes (for SMS/WhatsApp notifications)
- How to get:
  1. In Twilio Console Dashboard
  2. Copy your Auth Token
  3. Keep this secret!

**TWILIO_PHONE_NUMBER**
- Required: Yes (for SMS notifications)
- Format: `+1234567890` (E.164 format)
- How to get:
  1. In Twilio Console, go to Phone Numbers → Manage → Buy a number
  2. Purchase a phone number
  3. Copy the number in E.164 format

**TWILIO_WHATSAPP_NUMBER**
- Required: Yes (for WhatsApp notifications)
- Format: `whatsapp:+1234567890`
- How to get:
  1. In Twilio Console, go to Messaging → Try it out → Send a WhatsApp message
  2. Use the sandbox number or get approved for production
  3. Format: `whatsapp:+14155238886` (sandbox) or your approved number

### Application Configuration

**PORT**
- Default: `3000`
- Required: No
- Description: Port on which the application will run

**NODE_ENV**
- Options: `development`, `production`, `test`
- Default: `development`
- Required: No
- Description: Environment mode

### Retry Configuration

**MAX_RETRY_ATTEMPTS**
- Default: `3`
- Recommended: `3-5`
- Description: Maximum number of retry attempts for failed notifications

**RETRY_DELAY_MS**
- Default: `5000` (5 seconds)
- Recommended: `5000-10000`
- Description: Initial delay before first retry

**BACKOFF_MULTIPLIER**
- Default: `2`
- Recommended: `2`
- Description: Multiplier for exponential backoff (delay doubles each retry)

### Queue Configuration

**QUEUE_CONCURRENCY**
- Default: `10`
- Recommended: `10-50`
- Description: Number of concurrent workers for regular queue
- Adjust based on: Server CPU, memory, and notification volume

**PRIORITY_QUEUE_CONCURRENCY**
- Default: `20`
- Recommended: `20-100`
- Description: Number of concurrent workers for priority queue
- Higher value = faster processing of urgent notifications

## Provider Setup Instructions

### SendGrid Setup

1. **Create Account**: https://sendgrid.com/
2. **Verify Sender**:
   - Single Sender: Settings → Sender Authentication → Single Sender Verification
   - Domain Authentication (recommended for production)
3. **Create API Key**:
   - Settings → API Keys → Create API Key
   - Name: "Notification Service"
   - Permissions: "Mail Send" (Full Access)
   - Copy the key immediately (shown only once)

### Twilio Setup

1. **Create Account**: https://www.twilio.com/
2. **Get Credentials**:
   - Account SID and Auth Token are on the Console Dashboard
3. **Get Phone Number**:
   - Phone Numbers → Manage → Buy a number
   - Choose a number with SMS capabilities
4. **WhatsApp Setup**:
   - For testing: Use Twilio Sandbox (free)
   - For production: Request WhatsApp Business API access
   - Sandbox: Join via WhatsApp by sending code to +1 415 523 8886

## Testing Your Configuration

### Test Database Connection

```bash
# Using psql
psql $DATABASE_URL

# Or test with Prisma
npm run prisma:studio
```

### Test Redis Connection

```bash
# Using redis-cli
redis-cli -h $REDIS_HOST -p $REDIS_PORT ping
# Should return: PONG
```

### Test SendGrid

```bash
# Using curl
curl --request POST \
  --url https://api.sendgrid.com/v3/mail/send \
  --header "Authorization: Bearer $SENDGRID_API_KEY" \
  --header 'Content-Type: application/json' \
  --data '{"personalizations":[{"to":[{"email":"test@example.com"}]}],"from":{"email":"noreply@example.com"},"subject":"Test","content":[{"type":"text/plain","value":"Test email"}]}'
```

### Test Twilio

```bash
# Using Twilio CLI (if installed)
twilio api:core:messages:create \
  --from $TWILIO_PHONE_NUMBER \
  --to +1234567890 \
  --body "Test message"
```

## Security Best Practices

1. **Never commit `.env` file** to version control
2. **Use strong passwords** for database and Redis
3. **Rotate API keys** regularly
4. **Use environment-specific values** (dev, staging, prod)
5. **Restrict access** to `.env` file (chmod 600)
6. **Use secrets management** in production (AWS Secrets Manager, HashiCorp Vault, etc.)

## Production Checklist

- [ ] All required environment variables are set
- [ ] Database connection string is correct
- [ ] Redis is accessible and password-protected
- [ ] SendGrid sender is verified
- [ ] Twilio phone numbers are purchased and verified
- [ ] API keys are stored securely (not in code)
- [ ] Environment variables are loaded from secure storage
- [ ] CORS origins are configured correctly
- [ ] Rate limiting is configured
- [ ] Monitoring and alerting are set up

## Troubleshooting

### "Database connection failed"
- Check PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL format
- Check database exists: `psql -l`
- Verify user permissions

### "Redis connection failed"
- Check Redis is running: `redis-cli ping`
- Verify REDIS_HOST and REDIS_PORT
- Check firewall rules
- Verify REDIS_PASSWORD if set

### "SendGrid authentication failed"
- Verify API key is correct
- Check API key has "Mail Send" permissions
- Verify sender email is verified in SendGrid

### "Twilio authentication failed"
- Verify Account SID and Auth Token
- Check phone number is purchased and active
- Verify phone number format (E.164)

## Example .env File

```env
# Minimal working configuration
DATABASE_URL="postgresql://user:pass@localhost:5432/notification_db?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6379
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@example.com
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890
PORT=3000
NODE_ENV=development
```

