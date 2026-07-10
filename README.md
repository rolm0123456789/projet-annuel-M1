# Business First — Plateforme e-commerce microservices

Application e-commerce SaaS : frontend React, API Gateway .NET (YARP), microservices .NET 9,
PostgreSQL, RabbitMQ (architecture orientée événements).

## Lancement complet avec Docker Compose

```bash
docker compose up --build
```

| Composant | URL |
| --- | --- |
| Frontend | http://localhost:3000 |
| API Gateway | http://localhost:5163 |
| Console RabbitMQ | http://localhost:15672 (guest / guest) |

En conteneur, les services utilisent PostgreSQL (une base par service) et publient/consomment
les événements via RabbitMQ. Le cycle de commande est asynchrone :

```
OrderCreated ─→ InventoryService ─→ StockReserved / StockReservationFailed
             └→ PaymentService   ─→ PaymentConfirmed ─→ ShippingService ─→ ShipmentCreated
(OrderService consomme ces événements et met à jour le statut de la commande)
```

## Développement local (sans Docker)

Chaque service peut être lancé individuellement (`dotnet run`), il retombe alors sur SQLite
et désactive RabbitMQ si `RabbitMq__HostName` n'est pas défini.

```bash
cd front && npm install && npm run dev   # http://localhost:5173
cd backend/Gateway && dotnet run --project Gateway
```

## Tests

```bash
dotnet test backend/Gateway/OrderService.Tests/OrderService.Tests.csproj
dotnet test backend/Gateway/InventoryService.Tests/InventoryService.Tests.csproj
```

## CI/CD

Le pipeline GitHub Actions (`.github/workflows/ci.yml`) restaure, compile et teste le backend,
builde le front, construit les images Docker, puis déclenche le déploiement Coolify via le
secret `COOLIFY_WEBHOOK_URL` (poussées sur `main` uniquement).

## Migrations EF (dev)

```bash
dotnet ef migrations add Init
```
