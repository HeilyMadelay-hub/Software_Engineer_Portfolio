# Library Management System

Full-stack application for managing a library's books, users, and loans. It provides a complete CRUD interface for librarians to track inventory, register members, and handle book borrowing with return deadlines.

## Tech Stack

| Layer    | Technology      |
| -------- | ----------------------------------------------- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4   |
| Backend  | Node.js, Express 5, TypeScript, Sequelize 6     |
| Database | SQLite                |
| Docs   | Swagger (OpenAPI)  |

## Prerequisites

- Node.js >= 18
- npm >= 9

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd EJERCICIO1_API_BIBLIOTECA

# Install backend dependencies
cd back
npm install

# Install frontend dependencies
cd ../front
npm install
```

## Environment Variables

Create a `.env` file inside `back/`:

```
PORT=4000
```

The frontend uses Vite's dev proxy to reach the API, so no extra variables are needed in development.

For production, set `VITE_API_URL` in the frontend build environment pointing to the deployed backend URL.

## Running the Project

Start both servers in separate terminals:

```bash
# Terminal 1 — Backend (http://localhost:4000)
cd back
npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd front
npm run dev
```

The database is auto-created on first run and seeded with sample data if empty.

## Project Structure

```
??? back/           # Backend (Express API)
?   ??? src/
?       ??? controllers/     # Route handlers
?       ??? models/          # Sequelize models (Book, User, Loan)
?       ??? routes/          # Express route definitions
?       ??? service/         # Business logic and DB connection
?       ??? seed/     # Auto-seed for initial data
?       ??? swagger/       # OpenAPI configuration
?       ??? server.ts        # App entry point
?
??? front/    # Frontend (React SPA)
?   ??? src/
?       ??? components/      # Reusable UI and domain components
?  ??? hooks/   # Custom hooks (useSearch)
?       ??? pages/      # Page-level components
?       ??? services/        # API client (axios)
?       ??? types/         # TypeScript type definitions
?
??? biblioteca.sqlite        # SQLite database file (auto-generated)
??? docs/     # Additional documentation
```

## API

Interactive documentation is available at:

```
http://localhost:4000/api-docs
```

### Endpoints

| Resource | Base route      | Methods  |
| -------- | --------------- | ------------------------ |
| Books    | `/api/books`    | GET, POST, PUT, DELETE   |
| Users| `/api/users`    | GET, POST, PUT, DELETE   |
| Loans    | `/api/loans`    | GET, POST, PUT, DELETE   |

## Build for Production

```bash
# Backend
cd back
npm run build
npm start

# Frontend
cd front
npm run build     # outputs to front/dist/
npm run preview   # preview the production build locally
```
