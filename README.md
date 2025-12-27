\# 🎫 Real-Time Event Management \& Ticketing System



Complete REST API built with Node.js, TypeScript, and MongoDB that enables event management, ticket sales with real-time inventory control, and instant notifications via WebSockets.



\## 🌟 Key Features



\- ✅ \*\*Complete event management\*\* with multiple ticket categories

\- ✅ \*\*Reservation system with timeout\*\* (10 minutes to confirm)

\- ✅ \*\*Overselling prevention\*\* through transactions and optimistic locking

\- ✅ \*\*Real-time notifications\*\* with WebSockets (Socket.io)

\- ✅ \*\*Background jobs\*\* for automatic order expiration

\- ✅ \*\*JWT authentication\*\* with role-based system (Admin, Organizer, Buyer)

\- ✅ \*\*Robust validation\*\* with Zod

\- ✅ \*\*Testing\*\* with Jest and Supertest

\- ✅ \*\*Dockerized\*\* with docker-compose



\## 🏗️ System Architecture



```

┌─────────────┐            ┌──────────────┐            ┌─────────────┐

│   Client        │────────▶│  REST API        │────────▶│      MongoDB    │

│   (User)        │◀────────│  (Express)       │◀────────│      (Replica)  │

└─────────────┘            └──────────────┘            └─────────────┘

&nbsp;      │                         │

&nbsp;      │                         │

&nbsp;      │                ┌──────┴──────┐

&nbsp;      │                │  Background     │

&nbsp;      │                │    Jobs         │

&nbsp;      │                └─────────────┘

&nbsp;      │                       

&nbsp;      └────────────────┐

&nbsp;                            │

&nbsp;                ┌────────▼**────**─┐

&nbsp;                │  WebSocket      │

&nbsp;                │  (Socket.io)    │

&nbsp;                └─────────────┘

```



\*\*Ticket purchase flow:\*\*

1\. User creates order → Status `PENDING`

2\. System validates availability and reserves tickets → Status `RESERVED` (timeout: 10 min)

3\. User confirms payment → Status `CONFIRMED`

4\. If not confirmed in time → Automatic job marks as `EXPIRED` and releases tickets



\## 🚀 Quick Start



\### Prerequisites



\- Node.js 18+

\- Docker and Docker Compose

\- MongoDB 4.0+ (with replica set for transactions)



\### Installation



1\. \*\*Clone the repository\*\*

```bash

git clone https://github.com/your-username/event-ticketing-api.git

cd event-ticketing-api

```



2\. \*\*Install dependencies\*\*

```bash

npm install

```



3\. \*\*Configure environment variables\*\*

```bash

cp .env.example .env

\# Edit .env with your configurations

```



4\. \*\*Start with Docker\*\*

```bash

docker-compose up -d

```



5\. \*\*Run seeds (initial data)\*\*

```bash

npm run seed

```



6\. \*\*Start development server\*\*

```bash

npm run dev

```



The API will be available at `http://localhost:3000`



WebSocket will be at `http://localhost:3001`



\## 📋 Environment Variables



Create a `.env` file based on `.env.example`:



```env

\# Server

NODE\_ENV=development

PORT=3000



\# Database (with replica set for transactions)

MONGODB\_URI=mongodb://localhost:27017/event-ticketing?replicaSet=rs0



\# JWT

JWT\_SECRET=your-super-secure-secret-key-change-in-production

JWT\_EXPIRES\_IN=7d



\# WebSocket

WS\_PORT=3001



\# Order Configuration

ORDER\_RESERVATION\_TIMEOUT\_MINUTES=10



\# Logging

LOG\_LEVEL=debug

```



\## 📡 API Endpoints



\### Authentication



| Method | Endpoint             | Description          | Auth |

|--------|----------------------|----------------------|------|

| POST   | `/api/auth/register` | Register new user    | No   |

| POST   | `/api/auth/login`    | Login                | No   |

| GET    | `/api/auth/profile`  | View current profile | Yes  |



\### Events



| Method | Endpoint             | Description        | Auth   | Role            |

|--------|----------------------|--------------------|--------|-----------------|

| GET    | `/api/events`        | List events        | No     | -               |

| GET    | `/api/events/:id`    | View event details | No     | -               |

| POST   | `/api/events`        | Create evento      | Yes    | Organizer/Admin |

| PUT    | `/api/events/:id`    | Update event       | Yes    | Organizer/Admin |

| DELETE | `/api/events/:id`    | Delete evento      | Yes    | Admin           |

| GET    | `/api/events/search` | Search events      | No     | -               |



\*\*Query params for search:\*\*

\- `?fecha=2024-12-31` - Filter by date

\- `?ubicacion=Madrid` - Filter by location

\- `?disponible=true` - Only events with tickets



\### Ticket Categories



| Method | Endpoint                            | Description     | Auth | Role      |

|--------|-------------------------------------|-----------------|------|-----------|

| GET    | `/api/events/:id/categories`        | List categories | No   |     -     |

| POST   | `/api/events/:id/categories`        | Create category | Yes  | Organizer |

| PUT    | `/api/events/:id/categories/:catId` | Update category | Yes  | Organizer |

| DELETE | `/api/events/:id/categories/:catId` | Delete category | Yes  | Organizer |



\### Orders



| Method | Endpoint                 | Description            | Auth |

|--------|--------------------------|------------------------|------|

| POST   | `/api/orders`            | Create order (reserve) | Yes |

| GET    | `/api/orders/my-orders`  | View my orders         | Yes |

| GET    | `/api/orders/:id`        | View order details     | Yes |

| PUT    | `/api/orders/:id/confirm`| Confirm payment        | Yes |

| PUT    | `/api/orders/:id/cancel` | Cancel order           | Yes |



\### Admin



| Method | Endpoint                      | Description          | Auth|            Role |

|--------|-------------------------------|----------------------|-----|-----------------|

| GET    | `/api/admin/orders`           | View all orders      | Yes | Admin           |

| GET    | `/api/admin/stats`            | General statistics   | Yes | Admin           |

| GET    | `/api/admin/events/:id/sales` | Sales by event       | Yes | Admin/Organizer |



\## 🔌 WebSocket Events



\### Client → Server

```javascript

// Join event room

socket.emit('join:event', { eventId: '123' });



// Join personal room

socket.emit('join:user', { userId: 'abc' });

```



\### Server → Client

```javascript

// Stock update

socket.on('ticket:stock-update', (data) => {

&nbsp; // { eventoId, categoriaId, nuevoStock }

});



// Order status change

socket.on('order:status-change', (data) => {

&nbsp; // { orderId, nuevoEstado, expiraEn }

});



// Event update

socket.on('event:update', (data) => {

&nbsp; // { eventoId, cambios }

});



// Low stock alert

socket.on('ticket:almost-sold-out', (data) => {

&nbsp; // { eventoId, categoriaId, stockRestante }

});

```



\## 📝 Usage Examples



\### Register User



```bash

curl -X POST http://localhost:3000/api/auth/register \\

&nbsp; -H "Content-Type: application/json" \\

&nbsp; -d '{

&nbsp;   "nombre": "John Doe",

&nbsp;   "email": "john@example.com",

&nbsp;   "password": "Pass123!",

&nbsp;   "role": "COMPRADOR"

&nbsp; }'

```



\### Create Event



```bash

curl -X POST http://localhost:3000/api/events \\

&nbsp; -H "Content-Type: application/json" \\

&nbsp; -H "Authorization: Bearer YOUR\_JWT\_TOKEN" \\

&nbsp; -d '{

&nbsp;   "nombre": "Rock Concert 2024",

&nbsp;   "descripcion": "The best concert of the year",

&nbsp;   "fecha": "2024-12-31T20:00:00Z",

&nbsp;   "ubicacion": "Madrid Arena",

&nbsp;   "capacidadTotal": 1000,

&nbsp;   "precioBase": 50,

&nbsp;   "categorias": \[

&nbsp;     {

&nbsp;       "nombre": "VIP",

&nbsp;       "precio": 150,

&nbsp;       "cantidadTotal": 100,

&nbsp;       "beneficios": \["Backstage access", "Meet \& greet"]

&nbsp;     },

&nbsp;     {

&nbsp;       "nombre": "General",

&nbsp;       "precio": 50,

&nbsp;       "cantidadTotal": 900,

&nbsp;       "beneficios": \["General admission"]

&nbsp;     }

&nbsp;   ]

&nbsp; }'

```



\### Buy Tickets



```bash

curl -X POST http://localhost:3000/api/orders \\

&nbsp; -H "Content-Type: application/json" \\

&nbsp; -H "Authorization: Bearer YOUR\_JWT\_TOKEN" \\

&nbsp; -d '{

&nbsp;   "eventoId": "EVENT\_ID",

&nbsp;   "tickets": \[

&nbsp;     {

&nbsp;       "categoriaId": "VIP\_CATEGORY\_ID",

&nbsp;       "cantidad": 2

&nbsp;     }

&nbsp;   ]

&nbsp; }'

```



\### Confirm Order



```bash

curl -X PUT http://localhost:3000/api/orders/ORDER\_ID/confirm \\

&nbsp; -H "Content-Type: application/json" \\

&nbsp; -H "Authorization: Bearer YOUR\_JWT\_TOKEN" \\

&nbsp; -d '{

&nbsp;   "metodoPago": "credit\_card",

&nbsp;   "transactionId": "txn\_123456"

&nbsp; }'

```



\## 🧪 Testing



\### Run all tests

```bash

npm test

```



\### Tests with coverage

```bash

npm run test:coverage

```



\### Tests in watch mode

```bash

npm run test:watch

```



\### Included tests

\- ✅ Service unit tests (validation, calculations, business logic)

\- ✅ Endpoint integration tests

\- ✅ Concurrency test (overselling prevention)

\- ✅ Authentication and authorization tests



\## 🗂️ Project Structure



```

event-ticketing-api/

├── src/

│   ├── config/          # Configuration (DB, WS, env)

│   ├── models/          # Mongoose schemas

│   ├── controllers/     # Route controllers

│   ├── services/        # Business logic

│   ├── middleware/      # Auth, validation, errors

│   ├── routes/          # Route definitions

│   ├── utils/           # Helpers and utilities

│   ├── types/           # TypeScript types and interfaces

│   ├── websocket/       # WebSocket handlers

│   └── index.ts         # Entry point

├── tests/               # Unit and integration tests

├── docker-compose.yml   # Docker configuration

├── tsconfig.json        # TypeScript configuration

└── package.json

```



\## 🔒 Security



\- 🔐 \*\*Hashed passwords\*\* with bcrypt (12 rounds)

\- 🎫 \*\*JWT with expiration\*\* (7 days by default)

\- 🛡️ \*\*Helmet\*\* for HTTP security headers

\- 🌐 \*\*CORS\*\* configured

\- ✅ \*\*Strict validation\*\* with Zod

\- 🚫 \*\*Rate limiting\*\* (optional with express-rate-limit)



\## 🐳 Docker



\### Start all services

```bash

docker-compose up -d

```



\### View logs

```bash

docker-compose logs -f api

```



\### Stop services

```bash

docker-compose down

```



\### Rebuild images

```bash

docker-compose up --build

```



\## 📊 Test Data (Seeds)



When running `npm run seed`, the following is created:



\*\*Users:\*\*

\- Admin: `admin@test.com` / `Admin123!`

\- Organizer: `organizador@test.com` / `Org123!`

\- Buyer: `comprador@test.com` / `User123!`



\*\*Events:\*\*

1\. \*\*Rock Concert\*\* (1000 tickets)

&nbsp;  - VIP: 100 tickets ($150)

&nbsp;  - General: 900 tickets ($50)



2\. \*\*Tech Conference\*\* (500 tickets)

&nbsp;  - Premium: 50 tickets ($200)

&nbsp;  - Student: 200 tickets ($30)

&nbsp;  - General: 250 tickets ($80)



\## 🐛 Troubleshooting



\### Error: "Transaction numbers are only allowed on a replica set member"



\*\*Solution:\*\* MongoDB must run as a replica set for transactions.



```bash

\# Option 1: Docker Compose (included in project)

docker-compose up -d



\# Option 2: Local

mongod --replSet rs0

\# Then in mongo shell:

rs.initiate()

```



\### Error: "JWT malformed"



\*\*Solution:\*\* Verify that the JWT token is in the header:

```

Authorization: Bearer your\_token\_here

```



\### WebSocket not connecting



\*\*Solution:\*\* Check that port 3001 is free and that `WS\_PORT` in `.env` is correct.



\## 🚀 Deployment



\### Railway / Render / Heroku



1\. Create account on the platform

2\. Connect GitHub repository

3\. Configure environment variables

4\. Add MongoDB Atlas as database

5\. Automatic deployment on each push



\### Production environment variables

```env

NODE\_ENV=production

MONGODB\_URI=mongodb+srv://user:pass@cluster.mongodb.net/ticketing

JWT\_SECRET=super-secure-random-key-64-characters-minimum

PORT=3000

```

---



\## 🎯 Project Purpose



This project was built to deeply understand backend fundamentals such as:

\- concurrency and race condition handling

\- transactional consistency

\- real-time systems

\- clean architecture and separation of concerns



\## 🧠 Technical Decisions



\- MongoDB transactions were used to prevent ticket overselling

\- Optimistic locking was chosen over pessimistic locking for scalability

\- Background jobs handle expiration to keep API stateless

\- WebSockets were used instead of polling for real-time UX



⭐ If this project was useful to you, consider giving it a star on GitHub!

