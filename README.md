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

---

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

---

## Week 6: Filters UI + Introduction to Testing

**Goal:** Build a filter form, wire it into the listings page, and write the first unit tests.

### Step 1: Create Filter Component

```
mkdir src/components
touch src/components/PropertyFilters.js
touch src/components/PropertyFilters.css
```

`PropertyFilters.js` is a controlled form with six inputs: city, ZIP code, min price,
max price, beds (dropdown), and baths (dropdown). All inputs are controlled by a single
`filters` state object. On submit, empty values are stripped out so blank fields are not
sent to the API. The component talks to its parent only through an `onSearch` callback.

### Step 2: Integrate Filters into the Listings Page

`ListingsPage` holds a `filters` state object and passes an `onSearch` handler to
`PropertyFilters`. The data-loading effect depends on `filters`, so it re-fetches
whenever a new search is submitted:

- Search → updates `filters` state → effect re-runs → new results
- Clear → resets the form and calls `onSearch({})` → reloads all properties

The filter form stays visible during loading, and the results area shows one of:
loading, error, "No properties found," or the property grid.

### Step 3: Write API Client Tests

Create `frontend/src/api/client.test.js`. Tests mock `global.fetch` so they run without
a live backend:

- Fetches properties with default parameters (hits `/api/properties`)
- Appends filter parameters to the URL query string
- Handles network errors (rejected fetch)
- Throws on an error HTTP status (`ok: false`, e.g. 500)

### Step 4: Write Component Tests

Create `frontend/src/components/PropertyFilters.test.js` using React Testing Library:

- Renders all six filter inputs
- Calls `onSearch` with the entered values when Search is clicked
- Clears the form and calls `onSearch({})` when Clear is clicked

```
npm install --save-dev @testing-library/react @testing-library/jest-dom
@testing-library/user-event
```

### Running the Tests

```bash
cd frontend
npm test
```

Press `a` to run all tests. Expected: 6 passing across 2 suites (3 API client, 3 component).

### Week 6 Checkpoint

- [ ] Filter form displays all six inputs
- [ ] Submitting the form fetches results matching the filters
- [ ] Multiple filters can be combined
- [ ] Empty filter values are not sent to the API
- [ ] Clear button resets the form and results
- [ ] "No properties found" state shows a helpful message
- [ ] `npm test` passes all tests

---

## Week 7: Pagination UI & Component Testing

**Goal:** Add pagination controls so users can browse the full result set, and write
comprehensive tests for the pagination logic.

### Step 1: Add Pagination State to the Listings Page

`ListingsPage` tracks the current page and page size:

- `currentPage` (state) and `itemsPerPage` (fixed at 20)
- The API `offset` is derived from the page: `offset = (currentPage - 1) * itemsPerPage`
- The data-loading effect depends on both `filters` and `currentPage`, so it re-fetches
  when either changes
- Changing filters resets `currentPage` to 1 (so a new search always starts at page 1)
- Changing pages scrolls the window to the top

### Step 2: Build the Pagination Component

Create the component and its styles:

```
touch src/components/Pagination.js
touch src/components/Pagination.css
```

`Pagination` receives `currentPage`, `totalPages`, and an `onPageChange` callback. It renders:

- Previous / Next buttons, disabled on the first / last page
- Numbered page buttons, with the current page highlighted
- Ellipsis (`...`) for large page counts, e.g. `1 ... 4 5 6 ... 24`
- Nothing at all when there is only one page (`totalPages <= 1` returns `null`)

The page-number logic handles four cases: all pages fit (no ellipsis), current page near
the start, current page near the end, and current page in the middle.

### Step 3: Results Summary

The listings page shows a "Showing X–Y of Z properties" summary that reflects the current
page, using the actual number of results returned for the end value.

### Step 4: Write Pagination Tests

Create `frontend/src/components/Pagination.test.js` using React Testing Library:

- Renders Previous / Next and page number buttons
- Previous is disabled on the first page; Next is disabled on the last page
- Clicking Next / Previous / a page number calls `onPageChange` with the correct page
- The current page has the `active` class
- Renders nothing when there is only one page
- **Debug challenge:** a test that renders every page position and asserts no page number
  is ever rendered twice (guards against the "last page appears twice" bug)

### Running the Tests

```bash
cd frontend
npm test
```

### Week 7 Checkpoint

- [ ] Pagination controls appear below the property grid
- [ ] Previous is disabled on page 1; Next is disabled on the last page
- [ ] Clicking a page number navigates to that page
- [ ] Ellipsis renders correctly for large page counts
- [ ] Results summary shows "Showing X–Y of Z properties"
- [ ] Applying new filters resets to page 1
- [ ] Pagination is hidden when there is only one page
- [ ] All component tests pass

---

## Week 8: Property Detail Page (Routing, Gallery, Map & Open Houses)

**Goal:** Build a full property detail page with client-side routing, a photo gallery
with lightbox, a Google Map, and an open house schedule.

### Step 1: Install React Router

```bash
cd frontend
npm install react-router-dom
```

Set up routes in `App.js` with `BrowserRouter`, `Routes`, and `Route`:
- `/` → `ListingsPage`
- `/property/:id` → `PropertyDetailPage`

### Step 2: Make Property Cards Clickable

In `PropertyCard`, use the `useNavigate` hook so clicking a card navigates to
`/property/:id`. The card's outer div gets an `onClick` handler.

### Step 3: Build the Property Detail Page

Create `src/pages/PropertyDetailPage.js`. It:
- Reads the listing ID from the URL with `useParams`
- Fetches the property and its open houses in parallel with `Promise.all`
- Displays price, address, stats (beds/baths/sqft/year), description, map, and open houses
- Handles loading, error (including 404 for missing properties), and a Back button

### Step 4: Photo Gallery (Detail Page)

Create `src/components/PropertyImageGallery.js`:
- Main image + scrollable thumbnail strip (clicking a thumbnail changes the main image)
- Clicking the main image opens a full-screen lightbox
- Lightbox: left/right arrows navigate, closes on the ✕, click-outside, or the Escape key
- Parses `L_Photos` defensively (falls back to an empty array on bad JSON)

### Step 5: Photo Carousel (Listing Cards)

Create `src/components/PropertyImageCarousel.js`:
- Small photo slider on each listing card with prev/next arrows and a photo counter
- Arrow clicks use `stopPropagation` so they do NOT trigger the card's navigation

### Step 6: Property Map (Google Maps Embed)

Create `src/components/PropertyMap.js` using the Google Maps Embed API (iframe, no npm package):
- Only renders when both latitude and longitude are present
- Includes a "Get Directions" link that opens Google Maps in a new tab

Get a free API key from the Google Cloud Console, enable the **Maps Embed API**, and add
the key to `frontend/.env` (never commit this file):

```
REACT_AOO_GOOGLE_MAPS_API_KEY=your_key_here
```

React env variables must start with `REACT_APP_`. Restart the dev server after editing `.env`.

### Step 7: Open Houses

Open house date, start/end time, and remarks display on the detail page. Remarks live
inside the `all_data` JSON blob, so they are parsed out in the component (not the backend).
If a property has no open houses, "No open houses scheduled" is shown.

### Debug Challenges

- **Open house remarks never appear:** remarks are nested inside the `all_data` JSON blob,
  not a standalone column. Fixed by `JSON.parse`-ing `all_data` and reading `OpenHouseRemarks`.
- **Lightbox does not close on Escape:** a keydown handler on a `<div>` never fires without
  focus/tabIndex. Fixed by attaching the listener to `document` inside a `useEffect` (with
  cleanup) so it fires globally while the lightbox is open.

### Week 8 Checkpoint

- [ ] Clicking a card navigates to `/property/[id]`; Back returns to the listings
- [ ] Detail page shows price, address, stats, description, map, and open houses
- [ ] Carousel arrows cycle photos without navigating to the detail page
- [ ] Gallery thumbnails update the main image; clicking the main image opens the lightbox
- [ ] Lightbox navigates with arrows and closes on Escape / click-outside / ✕
- [ ] Map renders only when lat/lng are present; Get Directions opens Google Maps
- [ ] Open house remarks display; "No open houses scheduled" shows when there are none
- [ ] Visiting `/property/invalid-id` shows an error, not a crash

---

## Week 9: Advanced Features (Sorting + Favorites) & Performance Optimization

**Goal:** Implement advanced features and optimize application performance. The project
required one advanced feature; this build includes two (Sorting and Favorites).

### Advanced Feature 1: Sorting

**Backend** — `/api/properties` accepts `sortBy` and `sortOrder` query parameters:
- `sortBy` is validated against a whitelist of real SQL column names
  (`L_SystemPrice`, `ListingContractDate`, `LM_Int2_3`, `L_Keyword2`); an invalid value
  returns a 400 error.
- `sortOrder` is validated to `ASC`/`DESC` (defaults to `ASC`).
- Because column names cannot use parameterized placeholders in `ORDER BY`, the whitelist
  is what prevents SQL injection — only pre-approved column names reach the query.

**Frontend** — a sort dropdown on the listings page:
- Sends the real column name so it matches the backend whitelist.
- Sort persists across page changes and resets when new filters are applied.

### Advanced Feature 2: Favorites

Users can save properties using a heart button. Implemented with a `useFavorites` custom
hook backed by `localStorage` (client-side only — the backend is not involved).

- `useFavorites` (in `src/hooks/`) exposes `favorites`, `isFavorite`, `toggleFavorite`,
  `addFavorite`, and `removeFavorite`.
- Each `PropertyCard` has an SVG heart button; the click uses `stopPropagation` so it does
  not trigger card navigation.
- A dedicated `/favorites` page (with a nav link from the listings page) fetches and
  displays only saved properties, with a count ("N saved properties").
- Unfavoriting removes a property from the favorites view immediately.
- Favorites persist across page refreshes via `localStorage`.

**Known issue fixed — rapid-click race:** clicking several hearts quickly could drop some
favorites, because separate `useFavorites` instances held independent stale copies of the
list. Fixed by having each write read the current value from `localStorage` first, then
update, so concurrent writes start from the true current state. (A fuller solution would
share one favorites state via React Context to keep all components in sync in real time.)

### Performance Optimization

**EXPLAIN analysis — a function on an indexed column blocks the index:**

The application query wraps the city column in `LOWER(TRIM(L_City))` for case-insensitive
matching. EXPLAIN showed this prevents index use:

- **With `LOWER(TRIM())`:** used `idx_price` only, examined **17,946 rows**.
- **Without the function** (`WHERE L_City = 'Beverly Hills'`): used `idx_L_City`, examined
  **287 rows** — roughly a 62x reduction.

The composite index `idx_city_price (L_City, L_SystemPrice)` exists but is unusable while
the function wrapping remains. The proper fix is to normalize city casing at the data layer.
The `LOWER(TRIM())` approach is kept because the source data has inconsistent city casing —
a documented tradeoff between matching correctness and query performance.

Low-cardinality columns (beds ~27 distinct values, baths ~30) benefit far less from
indexing than high-cardinality columns like price (~6,200 distinct values).

**Request logging** includes response time in milliseconds: each request logs method, URL,
status code, and duration (e.g. `GET /api/properties 200 - 14ms`).

**React Error Boundary:** a class-component error boundary wraps the app and catches render
errors, showing a recovery UI instead of a blank screen.

**Console warnings:** resolved all outstanding warnings (the `useEffect` dependency warning,
an unused variable, and a missing `itemsPerPage` dependency).

### Week 9 Checkpoint
- [x] Sorting works by price (both directions) and other fields
- [x] Invalid `sortBy` returns a 400 error
- [x] Sort persists across page changes and resets on new filters
- [x] Favorites: heart button, favorites view, count, persistence, immediate removal
- [x] Custom hook used (not inline localStorage in components)
- [x] EXPLAIN output documented; index behavior analyzed
- [x] Request logs show timing information
- [x] Error boundary implemented and tested

---

## Week 10: Git Workflow and Code Organization

**Goal:** A professional Git history and a well-organized, maintainable codebase.

### Branching Strategy

The project uses a branch structure:
- **main** — production-ready code
- **develop** — integration branch where finished features are merged
- **feature/**, **refactor/** — short-lived branches for individual tasks, merged into
  develop via pull requests

Feature branches created and merged this week:
- `refactor/cleanup-dead-files` — removed the unused CRA `logo.svg` and added the PR template
- `refactor/add-lint-script` — added an npm lint script and fixed a `useEffect` dependency warning
- `feature/add-proptypes` — added PropTypes validation to PropertyCard

Each was developed on its own branch, committed with a conventional message, and merged
into `develop` through a pull request. `develop` was then promoted to `main`.

### Pull Request Template

A template at `.github/pull_request_template.md` standardizes every PR with sections for
description, type of change, testing, and a checklist.

### Conventional Commits

Commits follow the format `type: subject` (optionally `type(scope): subject`). Examples
from this project:
- `refactor: extract parsePhotos util and PropertyCard component`
- `refactor: remove unused logo.svg and add PR template`
- `feat: add PropTypes validation to PropertyCard`

### Folder Structure

```
frontend/src/
api/
client.js
components/
PropertyCard.js
PropertyFilters.js
Pagination.js
PropertyImageGallery.js
PropertyImageCarousel.js
PropertyMap.js
ErrorBoundary.js
(+ matching .css and .test.js files)
pages/
ListingsPage.js
PropertyDetailPage.js
FavoritesPage.js
hooks/
useFavorites.js
utils/
parsePhotos.js
App.js
index.js
```


### Refactoring & Code Quality

- Consolidated photo parsing into a single `utils/parsePhotos.js` (removing duplicated
  inline `JSON.parse` logic across components — which also fixed an unguarded parse that
  could crash on malformed data).
- Extracted `PropertyCard` into its own component file so both the listings and favorites
  pages reuse it instead of duplicating card markup.
- Added PropTypes to `PropertyCard` to document and validate its props.

### Linting

An npm lint script (`eslint src --ext .js,.jsx`) was added. `npm run lint` passes with
**0 problems** — no unused imports, unused variables, or dead code. Explanatory comments
are kept; no commented-out code remains.

### Week 10 Checkpoint
- [x] Git history tells a clear story via conventional commits and pull requests
- [x] Three feature branches created and merged into develop
- [x] Pull request template at `.github/pull_request_template.md`
- [x] PropertyCard is in its own file with PropTypes
- [x] Folder structure organized into api / components / pages / hooks / utils
- [x] `npm run lint` passes with no errors
- [x] No console.logs, commented-out code, or unused imports