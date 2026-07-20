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
docker run --name idx-mysql-local -p [database location] \
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
docker exec -it idx-mysql-local mysql -uroot -p[database password] rets
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

---

## Week 3: Property Search API with Filters and Indexing

**Goal:** Build a robust, paginated property search API with dynamic server-side filters, parameterized securely against SQL injection and optimized with database indexes.

### Step 1: Create Properties Route File

Create the router file to isolate your property endpoints:

```bash
touch src/routes/properties.js
```

Mount the router inside your main application file (src/index.js) right after your global middleware declarations:

```bash
const propertiesRouter = require('./routes/properties');
app.use('/api/properties', propertiesRouter);
```

### Step 2: Build Basic Pagination Endpoint
Add a foundational GET handler to src/routes/properties.js that implements offset-based pagination to safely chunk large dataset results

### Step 3: Add Filter Support
Replace your basic endpoint handler with a dynamic query builder. This version maps optional incoming query strings to raw SQL filters safely via placeholders

### Step 4: Add Input Validation
Guard the SQL enging against malformed text mutations and unbounded queries by introducing strict conditional bounds constraints before parsing parameters

### Step 5: Create Database Indexes
By default, filtering un-indexed columns forces full table scans. Introduce structural search markers directly inside the containerized MySQL CLI to transition your reads into high-speed index lookups:

SQL:
```
ALTER TABLE rets_property ADD INDEX idx_city (L_City);
ALTER TABLE rets_property ADD INDEX idx_zipcode (L_Zip);
ALTER TABLE rets_property ADD INDEX idx_price (L_SystemPrice);
ALTER TABLE rets_property ADD INDEX idx_beds (L_Keyword2);
ALTER TABLE rets_property ADD INDEX idx_baths (LM_Dec_3);
```

Verify your scheme state updates:

SQL:
```
SHOW INDEXES FROM rets_property;
```

### Step 6: Measure Performance
Prepend the optimization validator keyword to analyze your active search query plans:

```
EXPLAIN SELECT * FROM rets_property WHERE L_City = 'Portland';
```

Ensure that the output matrix highlights idx_city inside the key field and displays significantly dropped estimation volumes in the rows section.

### Example Response (200)
```bash
{
  "total": 287,
  "limit": 10,
  "offset": 0,
  "results": [ /* array of property objects */ ]
}
```

### Example Response (400)
```bash
{ "error": "limit must be between 1 and 100" }
```
Triggers include: limit=0, limit=200, non-nmeric minPrice/maxPrice/beds/baths, negative offset

### Database Schema Summary

`rets_property`
Property listings table:

| Column   | Represents                    |
|----------|-------------------------------|
| `L_ListingID` | Unique listing ID      |
| `L_Address, L_City, L_State, L_Zip`  | Location             |
| `L_SystemPrice` | List price                  |
| `L_Keyword2` | Bedrooms                      |
| `LM_Dec_3` | Bathrooms                     |
| `LM_Int2_3` | Square footage                |
| `L_Photos` | JSON array of photo URLs (not always valid JSON — must be parsed defensively) |
| `LMD_MP_Latitude, LMD_MP_Longitude` | Geo coordinates |
| `L_Remarks` | Listing description           |
| `YearBuilt, LotSizeAcres` | Additional property details |

`rets_openhouse`
Open house events, linked to rets_property via L_ListingID.

| Column   | Represents                    |
|----------|-------------------------------|
| `L_ListingID` | Foreign key to rets_property  |
| `OpenHouseDate, OH_StartTime, OH_EndTime` | Event scheduling |
| `all_data` | JSON blob containing OpenHouseRemarks and other fields |

### Indexing and Performance
Indexes on rets_property, created to support common filter combinations:

| Index    | Column(s)                     |
|----------|-------------------------------|
| `idx_L_City` | L_City (pre-existing from data import) |
| `idx_L_Zip` | L_Zip (pre-existing from data import) |
| `idx_price` | L_SystemPrice                 |
| `idx_beds` | L_Keyword2                    |
| `idx_baths` | LM_Dec_3                      |
| `idx_city_price` | L_City, L_SystemPrice (composite) |

### Week 3 Checkpoint

- [ ] `GET /api/properties/:id` returns full property object
- [ ] Pagination works: GET /api/properties?limit=10&offset=20 returns properties 21-30
- [ ] Filters work: GET /api/properties?city=BeverlyHills returns only Beverly Hills properties
- [ ] Multiple filters: GET /api/properties?city=Beverly Hills&minPrice=1000000&beds=3&limit=10&offset=0
- [ ] Invalid inputs return 400: ?minPrice=abc returns error
- [ ] Indexes exist: SHOW INDEXES shows all created indexes

---

## Week 4: Property Detail and Open House Endpoints

**Goal:** Two new endpoints: property by ID and open houses by property ID.

### Step 1: Create Property Detail Endpoints
Add specifc asset looksups to `src/routes/properties.js` BEFORE the GET / route

| Target Endpoint | HTTP Method | Objective |
| :--- | :--- | :--- |
| `/api/properties/:id` | `GET` | Fetches full, single row mapping properties from `L_ListingID` |
| `/api/properties/:id/openhouses` | `GET` | Pulls correlated calendar schedules chronologically sorted |

Route Precedence Warning: The openhouse path literal definition must sit positionally higher than the plain variable parameter template (/:id). Otherwise, Express matches and interprets the keyword string literal "openhouses" as a target asset ID pattern.

### Step 2: Add ID Validation
Sanitize routing structures by binding key validation logic to catch empty parameters or database-overflow string constraints

### Step 3: Add Request Logging
Inject a custom observation logger directly into your root stack setup within src/index.js (above active router mount points) to expose real-time application access details

### Testing Live Server
Start your development server so it can capture incoming traffic with your new performance request logger:

```bash
npm run dev
```

Once it is running on port 5000, you can open a new terminal window or tab and use curl to test the endpoints and verify their JSON responses directly from the command line:

- Test Property Details (Valid ID):
``` bash
curl http://localhost:5000/api/properties/existing_id
```

- Test Open Houses (Valid ID):
```bash
curl http://localhost:5000/api/properties/existing_id
```

- Test 404 Error (Missing ID):
```bash
curl http://localhost:5000/api/properties/nonexistent_id
```

- Test 400 Error (Oversized ID over 50 characters):
```bash
curl http://localhost:5000/api/properties/id_that_exceeds_fifty_characters_long
```

### Week 4 Checkpoint
- [ ] `GET /api/properties/:id` returns full property object
- [ ] `GET /api/properties/:id/openhouses` returns array of events
- [ ] Properties with no open houses return empty array (not error)
- [ ] Invalid listing ID returns 404 with helpful message
- [ ] Malformed ID returns 400 error
- [ ] Request logs appear in terminal with timestamps

## Week 5: React Setup and Listings Page

**Goal:** Create a React frontend that fetches and displays properties.

### Step 1: Create React app

```
cd ~/idx-internship
npx create-react-app frontend
cd frontend
npm start
```

Browser opens to http://localhost:3000

### Step 2: Configure Proxy

Edit frontend/package.json and add at the top level:

```
"proxy": "http://localhost:5000"
```

Make sure to restart React dev server after adding proxy (CTRL + C, then npm start)

### Step 3: Create API Client Module

Create frontend/src/api/client.js, then add your code for the API Client module

### Step 4: Create Listings Page Component

Create frontend/src/pages/directory:

```
mkdir src/pages
touch /src/pages/pages/ListingsPage.js
```

Then implement your code for the frontend React ;listings page. 

### Step 5: Add Styling

Create frontend/src/pages/ListingsPage.css, and add your customization for your page with colors and style of your choosing.

### Step 6: Update App.js

Replace frontend/src/App.js:

```bash
import React from 'react';
import ListingsPage from './pages/ListingsPage';
import './App.css';
function App() {
 return (
 <div className="App">
 <ListingsPage />
 </div>
 );
}
export default App;
```

Make sure both servers are running:
- Backend: cd backend && npm run dev
- Frontend: cd frontend && npm start

### Week 5 Checkpoint
- [ ] React app runs on port 3000 without errors
- [ ] Property grid displays caard with image/placeholder, price, address, city, beds/baths/sqft
- [ ] API errors are caught and displayed to the user. Error message displays if backend is down
- [ ] Property coount shows total
- [ ] Cards have hover effect
