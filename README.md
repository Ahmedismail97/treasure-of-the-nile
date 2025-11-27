# Treasure of the Nile Volume II: The Lost Relics

An Egyptian-themed treasure hunt management system for campus-wide scavenger hunt events.

## Features

- 🏛️ **10 Sequential Stations** - Strict order enforcement prevents teams from skipping ahead
- 🎯 **5 Challenge Types** - Riddles, QR codes, photo uploads, physical tasks, and check-ins
- 📊 **Real-time Leaderboard** - Live updates with timestamp-based tiebreaking
- 👥 **Team Management** - Hybrid registration (admin pre-create + self-registration)
- 💡 **Hint System** - Progressive hints with point penalties
- 🔐 **Admin Controls** - Challenge verification, manual overrides, event management
- 📱 **Mobile-First Design** - Fully responsive for smartphone use
- 🎨 **Egyptian Theme** - Immersive design with hieroglyphics, gold accents, and animations

## Prerequisites

### Required
- **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop)
- **Node.js 18+** (for local development without Docker)

### Database Access (choose one)
- **DB Browser for SQLite** (Recommended) - [Download here](https://sqlitebrowser.org/)
- **TablePlus** - [Download here](https://tableplus.com/)
- **sqlite3 CLI** (included in macOS)

## Quick Start with Docker

```bash
# 1. Clone and navigate to project
cd ESAUM

# 2. Start all services
docker-compose up -d --build

# 3. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000

# 4. View logs
docker-compose logs -f

# 5. Stop all services
docker-compose down
```

## Local Development (without Docker)

```bash
# 1. Install all dependencies
npm run install:all

# 2. Setup environment variables
cp server/.env.example server/.env
# Edit server/.env with your configuration

# 3. Run database migrations and seed data
cd server
npm run migrate
npm run seed
cd ..

# 4. Start both client and server in development mode
npm run dev

# Frontend: http://localhost:5173
# Backend: http://localhost:5000
```

## Database Access

The SQLite database is located at `server/database/treasure_hunt.db`

### Using DB Browser for SQLite
1. Open DB Browser for SQLite
2. Click "Open Database"
3. Navigate to `ESAUM/server/database/treasure_hunt.db`
4. View/edit tables: Team, Station, Progress, Admin, EventSettings

### Using CLI
```bash
sqlite3 server/database/treasure_hunt.db

# Example queries
.tables                                    # List all tables
SELECT * FROM Team;                        # View all teams
SELECT * FROM Station ORDER BY stationNumber;  # View stations in order
SELECT * FROM Progress WHERE teamId = 1;   # View team progress
```

## Project Structure

```
ESAUM/
├── client/              # React frontend (Vite + Tailwind)
├── server/              # Node.js/Express backend
├── docker-compose.yml   # Docker orchestration
└── package.json         # Root workspace scripts
```

## Admin Access

Default admin credentials (change after first login):
- **Username**: `admin`
- **Password**: `TreasureNile2024!`

Admin panel: `http://localhost:3000/admin`

## Team Access

Teams can:
1. **Login** with pre-generated team code
2. **Self-register** with a team name (system generates code)

Team dashboard: `http://localhost:3000/`

## Event Preparation Checklist

### 1 Week Before
- [ ] Deploy system to production server
- [ ] Test all features end-to-end
- [ ] Pre-generate team codes for registered teams
- [ ] Create station clues and challenges
- [ ] Test QR code scanning on multiple devices

### 3 Days Before
- [ ] Print QR codes for all 10 stations
- [ ] Place QR codes at physical campus locations
- [ ] Test QR codes work at actual locations
- [ ] Create admin accounts for event staff
- [ ] Backup database

### Event Day
- [ ] Enable event in EventSettings (via admin panel or DB Browser)
- [ ] Monitor system performance
- [ ] Verify challenges as they're submitted
- [ ] Manually end event when complete

## API Documentation

Full API documentation available at: [docs/API.md](docs/API.md)

Base URL: `http://localhost:5000/api/v1`

### Key Endpoints
- `POST /team/login` - Team authentication
- `POST /team/register` - Self-registration
- `POST /team/station/:id/submit` - Submit challenge
- `GET /leaderboard` - Current rankings
- `POST /admin/login` - Admin authentication

## Scripts

```bash
# Seed database with initial data
npm run seed

# Generate team codes (bulk creation)
npm run generate-teams

# Reset all progress (testing only)
npm run reset

# Run only server
npm run dev:server

# Run only client
npm run dev:client
```

## Technology Stack

### Frontend
- React 18 + Vite
- Tailwind CSS
- Socket.io-client
- html5-qrcode
- React Router v6

### Backend
- Node.js + Express
- Sequelize ORM
- SQLite3
- Socket.io
- JWT authentication

## Troubleshooting

### Docker Issues
```bash
# Rebuild containers
docker-compose up -d --build

# View container logs
docker-compose logs server
docker-compose logs client

# Restart specific service
docker-compose restart server
```

### Database Locked
If you get "database is locked" error:
1. Close DB Browser for SQLite
2. Stop Docker containers
3. Delete lock files: `rm server/database/*.db-*`
4. Restart containers

### QR Scanner Not Working
- Ensure HTTPS or localhost (camera permissions)
- Check browser camera permissions
- Test on multiple devices/browsers

## Support

For issues and feature requests, please contact the event organizers.

## License

MIT License - Created for University of Malaya campus events
