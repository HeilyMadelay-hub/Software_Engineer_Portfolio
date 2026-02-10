# Library Management System

Full-stack application for managing a library's books, users, and loans. It provides a complete CRUD interface for librarians to track inventory, register members, and handle book borrowing with return deadlines.

## Tech Stack

| Layer    | Technology           |
| -------- | ---------------------------------------------- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4     |
| Backend  | Node.js, Express 5, TypeScript, Sequelize 6    |
| Database | SQLite        |
| Docs     | Swagger (OpenAPI)        |
| Deploy   | Render (Web Service)     |

## Prerequisites

- Node.js >= 18
- npm >= 9

## Installation

```bash
# Clone the repository
git clone https://github.com/HeilyMadelay-hub/Master.git
cd "PROYECTOS INTERESANTES PARA GITHUB"

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
# Terminal 1 – Backend (http://localhost:4000)
cd back
npm run dev

# Terminal 2 – Frontend (http://localhost:5173)
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
? ??? routes/          # Express route definitions
?       ??? service/      # Business logic and DB connection
?       ??? seed/     # Auto-seed for initial data
?       ??? swagger/         # OpenAPI configuration
?       ??? server.ts      # App entry point
?
??? front/         # Frontend (React SPA)
?   ??? src/
?       ??? components/      # Reusable UI and domain components
?     ??? hooks/           # Custom hooks (useSearch)
?       ??? pages/        # Page-level components
?       ??? services/     # API client (axios)
?       ??? types/    # TypeScript type definitions
?
??? biblioteca.sqlite        # SQLite database file (auto-generated)
??? docs/    # Additional documentation
```

## API

Interactive documentation is available at:

```
http://localhost:4000/api-docs
```

### Endpoints

| Resource | Base route      | Methods       |
| -------- | --------------- | ---------------------- |
| Books    | `/api/books`    | GET, POST, PUT, DELETE |
| Users    | `/api/users`    | GET, POST, PUT, DELETE |
| Loans    | `/api/loans`    | GET, POST, PUT, DELETE |

## Build for Production

```bash
# From the back/ directory — builds both frontend and backend
cd back
npm run build
npm start
```

The backend `build` script performs two steps:

1. `cd ../front && npm install && npm run build` — installs frontend dependencies and generates the production bundle in `front/dist/`.
2. `tsc` — compiles the backend TypeScript into `back/dist/`.

At runtime, Express serves the compiled React SPA as static files from `front/dist/` and handles API routes under `/api/*`. This means the entire application (frontend + backend) runs as a **single process** on a single port.

---

## Deployment

### Why Render?

The entire project — frontend, backend, and database — is deployed as a **single Web Service on [Render](https://render.com/)**. This decision was made for several reasons:

1. **Monorepo simplicity.** The backend already serves the frontend static files via Express (`express.static`). There is no need to deploy the frontend and backend separately; a single service handles everything.
2. **SQLite as the database.** The project uses SQLite, which is a file-based database (`biblioteca.sqlite`). It does not require a separate database server or managed service, so a single Render Web Service is enough to run the full stack.
3. **Zero infrastructure cost.** Render's free tier allows deploying a Web Service with no credit card required, making it ideal for portfolio projects and demos.
4. **Simple CI/CD.** Render connects directly to the GitHub repository and re-deploys automatically on every push to the configured branch, so there is no need to set up a separate CI pipeline.

### Architecture in Production

```
Client (browser)
    ?
    ?
???????????????????????????????????
?  Render Web Service (Node.js)   ?
?   ?
?  Express serves:                ?
?   ??? /api/*    ? REST API      ?
?   ??? /api-docs ? Swagger UI    ?
?   ??? /*        ? React SPA     ?
?            (front/dist/)  ?
?       ?
?  SQLite DB: biblioteca.sqlite   ?
???????????????????????????????????
```

All traffic goes through a single URL. API requests are handled by Express routes, and any non-API route serves the React `index.html` (SPA fallback), so client-side routing with React Router works correctly.

### Render Configuration

| Setting   | Value   |
| ---------------- | ---------------------------------------------- |
| **Environment**  | Node      |
| **Root Directory** | `back`     |
| **Build Command** | `npm install && npm run build`        |
| **Start Command** | `node dist/server.js`          |
| **Branch**       | `demo-biblioteca`   |

The `npm run build` script defined in `back/package.json` handles the full pipeline:

```
npm install && cd ../front && npm install && npm run build && cd ../back && tsc
```

This installs all dependencies (back + front), builds the React app into `front/dist/`, and compiles the TypeScript backend into `back/dist/`.

### Environment Variables on Render

| Variable | Description        | Example |
| -------- | -------------------------- | ------- |
| `PORT`   | Port the server listens on (Render sets this automatically) | `10000` |

No database URL is needed because SQLite runs as an embedded file alongside the application.

### Live URL

?? **[https://software-engineer-portfolio-al1s.onrender.com/libros](https://software-engineer-portfolio-al1s.onrender.com/libros)**

> **Note:** Render's free tier spins down the service after ~15 minutes of inactivity. The first request after inactivity may take 30–60 seconds while the service cold-starts.

### Reproduce the Deployment Yourself

1. Fork or clone the repository.
2. Create a **Web Service** on [Render](https://render.com/).
3. Connect it to your GitHub repo.
4. Set the **Root Directory** to `back`.
5. Set the **Build Command** to `npm install && npm run build`.
6. Set the **Start Command** to `node dist/server.js`.
7. Deploy. Render will build and start the application automatically.

No additional environment variables are strictly required — `PORT` is injected by Render, and SQLite creates its database file on first run.
