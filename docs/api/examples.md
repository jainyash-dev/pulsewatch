# API examples

Human APIs use `Authorization: Bearer` after login. Ingest uses `X-Api-Key` only. Base: `http://localhost:3001/api/v1`.

## Register and login

```bash
curl -s -X POST http://localhost:3001/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"dev@example.com","password":"choose-a-long-pass","name":"Dev"}'

curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -c cookies.txt \
  -d '{"email":"dev@example.com","password":"choose-a-long-pass"}'
```

## Ingest (batch)

```bash
curl -s -X POST http://localhost:3001/api/v1/ingest \
  -H "X-Api-Key: $PULSEWATCH_API_KEY" \
  -H 'Content-Type: application/json' \
  -H "X-Request-Id: $(uuidgen)" \
  -d '{
    "events": [
      {
        "type": "log",
        "eventId": "11111111-1111-4111-8111-111111111111",
        "timestamp": "2026-08-24T18:00:00.000Z",
        "environment": "production",
        "service": "checkout-api",
        "severity": "info",
        "message": "charge succeeded"
      },
      {
        "type": "error",
        "eventId": "22222222-2222-4222-8222-222222222222",
        "environment": "production",
        "service": "checkout-api",
        "message": "PaymentError: card declined",
        "payload": { "stack": "PaymentError: card declined\n    at charge (charge.ts:10:5)" }
      },
      {
        "type": "request",
        "eventId": "33333333-3333-4333-8333-333333333333",
        "environment": "production",
        "service": "checkout-api",
        "endpoint": "/api/charges",
        "httpMethod": "POST",
        "statusCode": 500,
        "durationMs": 842
      },
      {
        "type": "metric",
        "eventId": "44444444-4444-4444-8444-444444444444",
        "environment": "production",
        "name": "queue.depth",
        "value": 12,
        "metricType": "gauge"
      }
    ]
  }'
```

Expected: **202** `{ "data": { "accepted": 4, "requestId": "...", "eventIds": [...] } }`.

## Query

```bash
curl -s "http://localhost:3001/api/v1/organizations/$ORG_ID/projects/$PROJECT_ID/events?type=error&range=24h" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

`range` on event lists is optional convenience; canonical filters are `from` + `to` ([endpoints.md](./endpoints.md)).

## Related

- [ingestion.md](../architecture/ingestion.md)
- [sdk.md](../sdk.md)
