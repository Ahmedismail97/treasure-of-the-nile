# 🎯 FINAL SETUP INSTRUCTIONS

## You're 3 Commands Away from a Working System!

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Everything

```bash
cd /Users/ahmeddawod/Desktop/ESAUM
npm run install:all
```

This installs all dependencies for both backend and frontend.

### Step 2: Setup & Seed Database

```bash
cd server
cp .env.example .env
npm run seed
```

This creates:

- ✅ Admin account (admin / TreasureNile2024!)
- ✅ 10 Egyptian-themed stations
- ✅ 3 sample teams with codes

### Step 3: Start Both Services

**Terminal 1 - Backend:**

```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd client
npm run dev
```

**Done!** Open http://localhost:5173 in your browser 🎉

---

## 🧪 Test the System (2 Minutes)

### Test 1: Team Registration

1. Go to http://localhost:5173
2. Click "Register"
3. Enter team name: "Test Hunters"
4. Save your team code!
5. You should see the dashboard ✅

### Test 2: Complete a Station

1. Click on "Station 1: The Gateway of Ra"
2. Click "Check In"
3. You should get +50 points
4. Station 2 should unlock ✅

### Test 3: Solve a Riddle

1. Click on "Station 2: The Sphinx's Riddle"
2. Try wrong answer (to see penalty)
3. Click "Hint" button (costs 10 points)
4. Submit correct answer: `echo`
5. Station 3 should unlock ✅

### Test 4: View Leaderboard

1. Click "View Leaderboard"
2. See your team ranked
3. Open in another browser tab
4. Complete a station in first tab
5. Watch leaderboard update in second tab ✅

---

## 📱 Test QR Scanner (Requires Phone)

### Generate QR Code

```bash
# Get admin token
curl -X POST http://localhost:5001/api/v1/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "TreasureNile2024!"}' | jq -r '.token'

# Generate QR for Station 3 (replace TOKEN)
curl -X POST http://localhost:5001/api/v1/admin/qr/generate/3 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test Scanning

1. Copy the `qrImageUrl` from response
2. Open on phone browser
3. In treasure hunt app, go to Station 3
4. Click "Start Scanner"
5. Scan the QR code ✅

---

## 💾 Access Database

### Using DB Browser for SQLite

1. Download: https://sqlitebrowser.org/
2. Open: `server/database/treasure_hunt.db`
3. Browse all tables

### Quick Queries

```sql
-- View all teams
SELECT * FROM teams ORDER BY totalPoints DESC;

-- View team progress
SELECT t.teamName, t.totalPoints, t.currentStation, p.status
FROM teams t
JOIN progress p ON t.id = p.teamId
WHERE t.teamCode = 'YOUR-TEAM-CODE';

-- View leaderboard
SELECT teamName, totalPoints, currentStation, completedAt
FROM teams
WHERE isActive = 1
ORDER BY totalPoints DESC, completedAt ASC;

-- Manually verify a submission
UPDATE progress
SET status = 'completed', pointsEarned = 100
WHERE teamId = 1 AND stationId = 5;
```

---

## 🔧 Common Operations

### Generate More Team Codes

```bash
cd server
npm run generate-teams        # Generate 10 teams
node scripts/generate-team-codes.js 25  # Generate 25 teams
```

### Reset All Progress (Testing)

```bash
cd server
npm run reset
```

### Rebuild Everything

```bash
# Backend
cd server
rm -rf node_modules package-lock.json
npm install

# Frontend
cd client
rm -rf node_modules package-lock.json dist
npm install
```

---

## 🐳 Deploy with Docker

### Build and Start

```bash
docker-compose up -d --build
```

### Seed Database in Docker

```bash
docker exec -it treasure-hunt-server npm run seed
```

### Access

- Frontend: http://localhost:3000
- Backend: http://localhost:5001

### View Logs

```bash
docker-compose logs -f server
docker-compose logs -f client
```

### Stop Everything

```bash
docker-compose down
```

---

## 📊 What's Included

### Backend (Port 5001)

- ✅ REST API with 20+ endpoints
- ✅ WebSocket server for real-time updates
- ✅ SQLite database with full schema
- ✅ File upload handling (photos)
- ✅ JWT authentication
- ✅ Sequential station locking
- ✅ All 5 challenge types

### Frontend (Port 5173)

- ✅ Team registration & login
- ✅ Egyptian-themed UI
- ✅ Station progress dashboard
- ✅ All challenge components:
  - Riddle with hints
  - QR scanner
  - Photo upload
  - Physical task
  - Check-in
- ✅ Real-time leaderboard
- ✅ Mobile responsive

### Database

- ✅ 10 Egyptian-themed stations
- ✅ Sample teams for testing
- ✅ Admin account configured
- ✅ Event settings

---

## 🎮 Sample Login Codes

Use these to test quickly:

- `MIGHTY-PHARAOH-777`
- `GOLDEN-SPHINX-888`
- `SACRED-ANUBIS-999`

Or register a new team!

---

## 🏆 The 10 Stations

1. **The Gateway of Ra** (Check-in) - 50 pts
2. **The Sphinx's Riddle** (Riddle: "echo") - 100 pts
3. **Anubis's Chamber** (QR) - 75 pts
4. **The Obelisk of Thoth** (Riddle: "fire") - 100 pts
5. **The Sacred Scarab** (Photo) - 100 pts
6. **The Nile's Trial** (Physical) - 100 pts
7. **Cleopatra's Garden** (QR) - 75 pts
8. **Horus's Vision** (Riddle: "footsteps") - 100 pts
9. **The Pharaoh's Memory** (Photo) - 100 pts
10. **The Treasure Chamber** (Check-in) - 150 pts

**Total**: 950 points

---

## ✅ Pre-Event Checklist

### Technical Setup

- [ ] System running locally and tested
- [ ] All challenge types working
- [ ] QR codes generated for stations 3 & 7
- [ ] QR codes printed
- [ ] Database backed up

### Content Setup

- [ ] Station locations confirmed on campus
- [ ] QR codes placed at locations
- [ ] Riddle answers documented
- [ ] Photo challenge prompts clear
- [ ] Physical task instructions prepared

### Team Setup

- [ ] Team codes generated (or self-registration enabled)
- [ ] Team codes distributed (if pre-registration)
- [ ] Admin accounts created
- [ ] Admin briefed on verification process

### Deployment

- [ ] Deployed to production server (or localhost)
- [ ] Event settings configured
- [ ] Database accessible to admins
- [ ] Backup strategy in place

---

## 🆘 Need Help?

### Backend Not Starting?

```bash
# Check if port is in use
lsof -i :5001

# Kill process using port
kill -9 <PID>

# Restart
cd server && npm run dev
```

### Frontend Not Starting?

```bash
# Check if port is in use
lsof -i :5173

# Clear and restart
cd client
rm -rf dist
npm run dev
```

### Database Issues?

```bash
# Delete and recreate
rm server/database/treasure_hunt.db
cd server && npm run seed
```

### WebSocket Not Connecting?

- Check `server/.env` has correct `CLIENT_URL`
- Check browser console for errors
- Try refreshing the page

---

## 📁 File Structure

```
ESAUM/
├── server/
│   ├── src/              # All backend code ✅
│   ├── scripts/          # Seeding utilities ✅
│   ├── database/         # SQLite database
│   └── package.json      # Dependencies ✅
│
├── client/
│   ├── src/
│   │   ├── components/   # All UI components ✅
│   │   ├── pages/        # Route pages ✅
│   │   ├── services/     # API & WebSocket ✅
│   │   └── styles/       # CSS & theme ✅
│   └── package.json      # Dependencies ✅
│
├── docker-compose.yml    # Docker config ✅
└── *.md files           # All documentation ✅
```

---

## 🎉 You're All Set!

**Everything is ready to go!** Just run the 3 commands at the top of this file and you'll have a fully functional treasure hunt system.

**Questions?** Check the other documentation files:

- `README.md` - Overview
- `QUICK_START.md` - Getting started
- `BACKEND_COMPLETE.md` - API documentation
- `FRONTEND_GUIDE.md` - Component patterns
- `SYSTEM_COMPLETE.md` - Full feature list

**Good luck with your event!** 🏛️✨

---

_Built for University of Malaya's Treasure of the Nile Volume II event_
