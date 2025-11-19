# API Usage Examples

## Send a Single Notification

```bash
curl -X POST http://localhost:3000/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "notificationType": "TRANSACTIONAL",
    "channel": "EMAIL",
    "content": "Your order has been shipped!",
    "subject": "Order Update",
    "recipient": "user@example.com",
    "priority": 2
  }'
```

Response:
```json
{
  "success": true,
  "transactionId": "abc-123-def-456",
  "message": "Notification queued successfully",
  "channel": "EMAIL",
  "priority": 2
}
```

## Send Bulk Notifications

```bash
curl -X POST http://localhost:3000/notifications/send-bulk \
  -H "Content-Type: application/json" \
  -d '{
    "notifications": [
      {
        "userId": "123e4567-e89b-12d3-a456-426614174000",
        "notificationType": "TRANSACTIONAL",
        "channel": "EMAIL",
        "content": "Welcome to our service!",
        "recipient": "user1@example.com"
      },
      {
        "userId": "223e4567-e89b-12d3-a456-426614174001",
        "notificationType": "MARKETING",
        "channel": "SMS",
        "content": "Check out our new features!",
        "recipient": "+1234567890"
      }
    ]
  }'
```

## Get User Preferences

```bash
curl http://localhost:3000/users/123e4567-e89b-12d3-a456-426614174000/preferences
```

Response:
```json
{
  "id": "pref-id",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
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

## Update User Preferences

```bash
curl -X PUT http://localhost:3000/users/123e4567-e89b-12d3-a456-426614174000/preferences \
  -H "Content-Type: application/json" \
  -d '{
    "emailEnabled": true,
    "smsEnabled": true,
    "whatsappEnabled": false,
    "pushEnabled": true,
    "emailPriority": 1,
    "smsPriority": 2,
    "whatsappPriority": 3,
    "pushPriority": 4
  }'
```

## Admin Dashboard

```bash
curl http://localhost:3000/admin/dashboard
```

Response:
```json
{
  "statistics": {
    "total": 1000,
    "pending": 50,
    "sent": 900,
    "failed": 30,
    "retry": 20,
    "deadLetter": 0,
    "successRate": "90.00"
  },
  "queueStats": {
    "regular": {
      "waiting": 10,
      "active": 5,
      "completed": 800,
      "failed": 20
    },
    "priority": {
      "waiting": 2,
      "active": 3,
      "completed": 100,
      "failed": 10
    },
    "deadLetter": {
      "waiting": 0,
      "active": 0,
      "completed": 0,
      "failed": 0
    }
  }
}
```

## Search Transactions

```bash
curl "http://localhost:3000/admin/transactions?status=FAILED&channel=EMAIL&limit=10&offset=0"
```

## Get Failed Transactions

```bash
curl "http://localhost:3000/admin/failed?errorType=NETWORK_ERROR&limit=20"
```

## Get Error Analytics

```bash
curl "http://localhost:3000/admin/analytics/errors?startDate=2024-01-01&endDate=2024-01-31"
```

## Get Channel Performance

```bash
curl "http://localhost:3000/admin/analytics/channels?startDate=2024-01-01&endDate=2024-01-31"
```

Response:
```json
{
  "EMAIL": {
    "total": 500,
    "sent": 480,
    "failed": 15,
    "pending": 5,
    "retry": 0,
    "deadLetter": 0,
    "successRate": "96.00",
    "failureRate": "3.00"
  },
  "SMS": {
    "total": 300,
    "sent": 290,
    "failed": 8,
    "pending": 2,
    "retry": 0,
    "deadLetter": 0,
    "successRate": "96.67",
    "failureRate": "2.67"
  }
}
```

## Get Specific Transaction

```bash
curl http://localhost:3000/admin/transactions/abc-123-def-456
```

Response:
```json
{
  "id": "txn-id",
  "transactionId": "abc-123-def-456",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "notificationType": "TRANSACTIONAL",
  "channel": "EMAIL",
  "status": "SENT",
  "content": "Your order has been shipped!",
  "subject": "Order Update",
  "recipient": "user@example.com",
  "retryCount": 0,
  "priority": 2,
  "createdAt": "2024-01-15T10:00:00Z",
  "sentAt": "2024-01-15T10:00:05Z",
  "errorLogs": []
}
```

