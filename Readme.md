# Sport Info — Live Matches & Commentary API (REST + WebSockets)

A lightweight **Node.js + Express + MongoDB** backend for managing sports matches and delivering **real‑time updates** to clients via **WebSockets**.

This project exposes:
- **REST APIs** to create and list matches, and to create/fetch commentary for a match
- A **WebSocket server** (`/ws`) for pushing:
  - **`match_created`** events to all connected clients
  - **`commentary`** events only to clients subscribed to a specific match

> Repo: `AveshRajSingh/sport-info`  
> Folder: `backend/` (this repository currently contains only the backend)

---

## Table of Contents

- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Run the Server](#run-the-server)
- [REST API](#rest-api)
  - [Matches](#matches)
  - [Commentary](#commentary)
  - [Pagination](#pagination)
  - [Validation Errors](#validation-errors)
- [WebSocket API](#websocket-api)
  - [Connect](#connect)
  - [Subscribe / Unsubscribe](#subscribe--unsubscribe)
  - [Server Events](#server-events)
  - [Heartbeat](#heartbeat)
- [Data Models](#data-models)
- [Notes & Suggestions](#notes--suggestions)

---

## Key Features

### 1) Match Management (REST)
- **Create match** with:
  - `homeTeam`, `awayTeam`, `sport`
  - `startTime`, `endTime`
  - optional scores (`homeScore`, `awayScore`)
- **List matches** with pagination (`limit`, `page`)
- Automatic match **status** calculation based on time:
  - `scheduled` (starts in the future)
  - `live` (between start and end)
  - `completed` (ended in the past)

### 2) Match Commentary (REST)
- Create commentary events for a match:
  - `actor`, `message`, `minute`, `sequenceNo`, `eventType`, optional metadata
- Fetch commentary for a given match with pagination

### 3) Real-time Updates (WebSockets)
- WebSocket server mounted at **`/ws`**
- Clients can:
  - subscribe to commentary for a **specific matchId**
  - unsubscribe when no longer needed
- Broadcast behavior:
  - **All clients** receive `match_created`
  - **Only subscribers** to a given match receive commentary events for that match

### 4) Request Validation (Zod)
- Uses **Zod** schemas to validate request bodies
- Returns consistent error responses on invalid payloads

---

## Tech Stack

- **Runtime:** Node.js (ESM modules enabled via `"type": "module"`)
- **HTTP API:** Express
- **DB:** MongoDB via Mongoose
- **WebSockets:** `ws`
- **Validation:** Zod
- **Dev tooling:** Nodemon

---

## Project Structure

```text
sport-info/
└── backend/
    ├── index.js
    ├── package.json
    ├── controllers/
    │   ├── match.controller.js
    │   └── commentry.controller.js
    ├── routes/
    │   ├── match.route.js
    │   └── commentry.route.js
    ├── db/
    │   ├── db.js
    │   ├── match.model.js
    │   └── commentry.model.js
    ├── middlewares/
    │   └── validate.middleware.js
    ├── validations/
    │   ├── matches.validation.js
    │   └── commentry.validation.js
    ├── utils/
    │   └── matchUtils.js
    └── ws/
        └── server.js
```

---

## Getting Started

### Prerequisites
- Node.js (recent LTS recommended)
- A running MongoDB instance (local or hosted)

### Install
```bash
cd backend
npm install
```

---

## Environment Variables

Create a `.env` file inside `backend/`:

```bash
PORT=8000
MONGO_URI=mongodb://localhost:27017/sport-info
```

- `PORT` defaults to **8000** if omitted
- `MONGO_URI` is required to connect to MongoDB

---

## Run the Server

### Development (with auto-reload)
```bash
cd backend
npm run dev
```

### Production
```bash
cd backend
npm start
```

Server will start on:
- HTTP: `http://localhost:8000`
- WebSocket: `ws://localhost:8000/ws`

---

## REST API

Base paths mounted in `backend/index.js`:
- `/api/matches`
- `/api/commentry`

### Matches

#### `GET /api/matches`
List matches (newest first).

**Query params**
- `limit` (default `20`, max `100`)
- `page` (default `1`)

**Example**
```bash
curl "http://localhost:8000/api/matches?limit=20&page=1"
```

#### `POST /api/matches/create-match`
Create a match (validated by Zod).

**Body**
```json
{
  "homeTeam": "Team A",
  "awayTeam": "Team B",
  "sport": "football",
  "startTime": "2026-03-11T12:00:00.000Z",
  "endTime": "2026-03-11T14:00:00.000Z",
  "homeScore": 0,
  "awayScore": 0
}
```

**Rules**
- `endTime` must be after `startTime`
- `homeTeam` and `awayTeam` must be different
- `homeScore` and `awayScore` default to `0` if omitted

**Example**
```bash
curl -X POST "http://localhost:8000/api/matches/create-match" \
  -H "Content-Type: application/json" \
  -d '{"homeTeam":"A","awayTeam":"B","sport":"football","startTime":"2026-03-11T12:00:00.000Z","endTime":"2026-03-11T14:00:00.000Z"}'
```

---

### Commentary

#### `GET /api/commentry/:matchId`
Fetch commentary entries for a match (newest first).

**Query params**
- `limit` (default `20`, max `100`)
- `page` (default `1`)

**Example**
```bash
curl "http://localhost:8000/api/commentry/64f0c0c0c0c0c0c0c0c0c0c0?limit=20&page=1"
```

#### `POST /api/commentry/:matchId`
Create a commentary item for the match (validated by Zod).  
Also **broadcasts** the commentary to WebSocket clients subscribed to that match.

**Body**
```json
{
  "actor": "referee",
  "message": "Kick-off!",
  "minute": 0,
  "sequenceNo": 1,
  "data": {},
  "period": "First Half",
  "eventType": "KICK_OFF",
  "tags": ["start"]
}
```

**Example**
```bash
curl -X POST "http://localhost:8000/api/commentry/64f0c0c0c0c0c0c0c0c0c0c0" \
  -H "Content-Type: application/json" \
  -d '{"actor":"referee","message":"Kick-off!","minute":0,"sequenceNo":1,"eventType":"KICK_OFF","tags":["start"]}'
```

---

### Pagination

List responses follow this shape:
```json
{
  "data": [],
  "pagination": {
    "total": 123,
    "page": 1,
    "limit": 20,
    "totalPages": 7
  }
}
```

---

### Validation Errors

When validation fails, the API responds with HTTP `400` and a structure like:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "homeTeam", "message": "Home team is required", "code": "too_small" }
  ]
}
```

---

## WebSocket API

### Connect
- URL: `ws://localhost:8000/ws`

On connect, server sends:
```json
{ "type": "welcome" }
```

### Subscribe / Unsubscribe

#### Subscribe to a match
Client → Server:
```json
{ "type": "subscribe", "matchId": "<matchId>" }
```

Server → Client:
```json
{ "type": "subscribed", "matchId": "<matchId>" }
```

#### Unsubscribe from a match
Client → Server:
```json
{ "type": "unsubscribe", "matchId": "<matchId>" }
```

Server → Client:
```json
{ "type": "unsubscribed", "matchId": "<matchId>" }
```

### Server Events

#### Match created (broadcast to all)
```json
{ "type": "match_created", "data": { /* match document */ } }
```

#### Commentary (broadcast only to subscribers of that matchId)
```json
{ "type": "commentary", "data": { /* commentary document */ } }
```

### Heartbeat
- Client can send:
```json
{ "type": "ping" }
```
- Server responds:
```json
{ "type": "pong" }
```

Additionally, the server pings clients periodically and terminates dead connections.

---

## Data Models

### Match (`backend/db/match.model.js`)
Fields:
- `homeTeam` (string, required)
- `awayTeam` (string, required)
- `sport` (string, required)
- `startTime` (date, required)
- `endTime` (date, required)
- `status` (`scheduled` | `live` | `completed`)
- `homeScore` (number, default `0`)
- `awayScore` (number, default `0`)
- timestamps enabled (`createdAt`, `updatedAt`)

### Commentry (`backend/db/commentry.model.js`)
Fields:
- `matchId` (ObjectId ref Match, required)
- `actor` (string, required)
- `message` (string, required)
- `minute` (number, default `0`)
- `sequenceNo` (number, required)
- `data` (object, default `{}`)
- `period` (string, default `"First Half"`)
- `eventType` (string, required)
- `tags` (string[], default `[]`)
- timestamps enabled (`createdAt`, `updatedAt`)

---