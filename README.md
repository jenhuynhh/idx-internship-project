# IDX-Property-Search-Project

A Zillow/Redfin-style property search experience backed by real MLS data. This application connects a React frontend to a local containerized MySQL database through a Node.js/Express REST API.

---

## Project Overview

This project is a full-stack property search experience backed by real MLS data. The finished application includes:

- A searchable, filterable property listings page with pagination
- A property detail page with photos, map, and open house schedule
- A Node/Express REST API connecting React to a MySQL database
- A local MySQL database populated from two provided SQL files

### Data Flow & Architecture
All communication between the user interface and the database is securely routed through the backend API. 

```text
React (Port 3000) ──> Express API (Port 5000) ──> MySQL (Port 3306)
```

### Tech Stack

| Layer    | Technology                    |
|----------|-------------------------------|
| Frontend | React (Create React App)      |
| Backend  | Node.js + Express             |
| Database | MySQL 8 running in Docker     |
| Testing  | Jest + React Testing Library + Supertest |

---

## Week 1: Environment Setup & Database Import

### Step 1: Install Docker Desktop

1. Download Docker Desktop from [docker.com](https://www.docker.com)
2. Install it:
   - **Mac:** Drag `Docker.app` into Applications
3. Open Docker Desktop and wait for "Docker is running"
4. Verify:
   ```bash
   docker --version
   ```

### Step 2: Start MySQL Container

```bash
docker run --name idx-mysql-local -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=[your password] \
  -e MYSQL_DATABASE=[your database name] \
  -d mysql:8.0
```

Verify it's running:

```bash
docker ps
```

Useful commands for later:

```bash
docker stop idx-mysql-local
docker start idx-mysql-local
docker restart idx-mysql-local
docker logs idx-mysql-local
```

### Step 3: Import SQL Files

Create a project folder and place both `.sql` files inside it:

```bash
mkdir ~/idx-internship
cd ~/idx-internship
```

Import each file:

```bash
docker exec -i idx-mysql-local mysql -uroot -p[your database password] rets < rets_property.sql
docker exec -i idx-mysql-local mysql -uroot -p[your database password] rets < rets_openhouse.sql
```

### Step 4: Verify the Import

Open a MySQL shell:

```bash
docker exec -it idx-mysql-local mysql -uroot -prootpass rets
```

Run these verification queries:

```sql
SHOW TABLES;
SELECT COUNT(*) FROM rets_property;
SELECT COUNT(*) FROM rets_openhouse;
SELECT * FROM rets_property LIMIT 5;
exit;
```

### Week 1 Checkpoint

- [ ] `docker ps` shows `idx-mysql-local` running
- [ ] `SHOW TABLES;` returns `rets_property` and `rets_openhouse`
- [ ] `SELECT COUNT(*)` on both tables returns non-zero numbers
- [ ] You can `SELECT` from both tables and `DESCRIBE` their columns
- [ ] You can explain what Docker containers are and why we use one for MySQL

---

## Week 2: Backend Foundation + REST API Basics

**Goal:** A running Node/Express server with a working health check endpoint.

### Step 1: Initialize Backend Project

```bash
cd ~/idx-internship
mkdir backend
cd backend
npm init -y
```

Install dependencies:

```bash
npm install express mysql2 dotenv cors
npm install --save-dev nodemon
```

### Step 2: Create Folder Structure

```bash
mkdir -p src/db src/routes
touch .env .gitignore src/index.js src/db/mysql.js
```

Structure should look like:

```
backend/
  .env
  .gitignore
  package.json
  src/
    index.js
    db/
      mysql.js
    routes/
```

### Step 3: Configure Environment Variables

**`.env`**

```
DB_HOST=[database location]
DB_PORT=[port to run server on]
DB_USER=[database username]
DB_PASSWORD=[database password]
DB_NAME=[database name]
PORT=5000
```

**`.gitignore`**

```
node_modules/
.env
.DS_Store
```

### Step 4: Create MySQL Connection Pool

**`src/db/mysql.js`**

### REST API Design Concepts

**HTTP Methods**

| Method | Use |
|---|---|
| `GET` | Retrieve data (read-only) |
| `POST` | Create new resources |
| `PUT`/`PATCH` | Update existing resources |
| `DELETE` | Remove resources |

**HTTP Status Codes**

| Code | Meaning |
|---|---|
| 200 | OK — request succeeded |
| 201 | Created — new resource created |
| 400 | Bad Request — invalid client input |
| 404 | Not Found — resource doesn't exist |
| 500 | Internal Server Error — server problem |

**Consistent Response Format (lists)**

```json
{
  "total": 487,
  "limit": 20,
  "offset": 0,
  "results": [...]
}
```

### Step 6: Create Health Check Endpoint

**`src/index.js`**

### Step 7: Add NPM Scripts & Run

Start the server:

```bash
npm run dev
```

Test at: [http://localhost:5000/api/health](http://localhost:5000/api/health)

### Week 2 Checkpoint

- [ ] `npm run dev` starts the server without errors
- [ ] `GET /api/health` returns `{ "status": "ok", "database": "connected" }` when MySQL is running
- [ ] `GET /api/health` returns a 500 (not a crash) when MySQL is unreachable
- [ ] `.env` is listed in `.gitignore`