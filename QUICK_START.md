# Quick Start Guide

Get CareAgentDashboard up and running in 5 minutes.

## 1. Clone & Install (2 min)

```bash
git clone https://github.com/dochobbs/claradash_replit.git
cd claradash_replit
npm install
```

## 2. Configure Environment (1 min)

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
DATABASE_URL=postgresql://localhost:5432/claradash
AI_INTEGRATIONS_OPENAI_API_KEY=sk-your-key-here
PORT=5000
```

## 3. Setup Database (1 min)

```bash
# Option A: Use local PostgreSQL
npm run db:push

# Option B: Use Docker
docker run --name claradash-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=claradash \
  -p 5432:5432 \
  -d postgres:16
npm run db:push
```

## 4. Start Development Server (1 min)

```bash
npm run dev
```

Open: http://localhost:5000

## 5. Load Sample Data (Optional)

Click "Initialize Sample Data" button on Dashboard, or:

```bash
curl -X POST http://localhost:5000/api/initialize-data
```

## ✅ Done!

You now have a running CareAgentDashboard instance.

---

## Common Commands

```bash
npm run dev              # Start dev server with hot reload
npm run build            # Build for production
npm run start            # Run production build
npm run check            # TypeScript type checking
npm run db:push          # Apply database migrations
```

## Project Structure

```
client/                  # React frontend
server/                  # Express backend
shared/schema.ts         # Database schema & types
docs/                    # Comprehensive documentation
```

## Key URLs

- **App**: http://localhost:5000
- **API**: http://localhost:5000/api
- **Docs**: http://localhost:5000 (built-in API docs coming soon)

## Documentation

- **Setup Details**: [README.md](./README.md)
- **API Reference**: [docs/API.md](./docs/API.md)
- **Architecture**: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- **Deployment**: [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)
- **Security**: [docs/SECURITY.md](./docs/SECURITY.md)
- **Contributing**: [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md)

## Troubleshooting

### Port 5000 in use?
```bash
PORT=5001 npm run dev
```

### Database connection error?
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT 1"

# Or verify DATABASE_URL
echo $DATABASE_URL
```

### TypeScript errors?
```bash
npm run check
```

### Need fresh database?
```bash
# Drop and recreate
dropdb claradash
createdb claradash
npm run db:push
```

## Features to Explore

1. **Dashboard**: Overview of pending reviews and stats
2. **Patients**: Browse and manage patient records
3. **Reviews**: Review AI recommendations
4. **Escalations**: Manage patient escalations
5. **Analytics**: View performance metrics
6. **Clara Chat**: AI assistant integration (floating button)

## Demo Data

Sample data includes:
- 3 patients with children
- 3 AI interactions awaiting review
- 2 completed reviews
- Ready for exploration

---

## Next Steps

- [ ] Read [README.md](./README.md) for full overview
- [ ] Check [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) to understand the codebase
- [ ] Review [docs/API.md](./docs/API.md) for API endpoints
- [ ] Follow [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md) to start developing

---

**Questions?** Check the full [README.md](./README.md) or explore the `/docs` folder.

**Ready to deploy?** See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md).

**Security concerns?** Review [docs/SECURITY.md](./docs/SECURITY.md) before production.
