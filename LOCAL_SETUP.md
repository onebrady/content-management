# Local Development Setup

## Quick Start

1. **Start the local environment:**

   ```bash
   npm run local:dev
   ```

2. **Access the application:**
   - URL: http://localhost:3000
   - Admin Login: admin@local.dev / admin123

## Manual Setup

1. **Start Docker database:**

   ```bash
   npm run docker:up
   ```

2. **Set up database:**

   ```bash
   npm run db:generate
   npm run db:migrate
   ```

3. **Create admin user:**

   ```bash
   node scripts/create-local-admin.js
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

## Useful Commands

- `npm run docker:down` - Stop Docker containers
- `npm run docker:reset` - Reset database completely
- `npm run db:studio` - Open Prisma Studio
- `npm run local:setup` - Full setup without starting dev server

## Environment Variables

Your `.env.local` file should contain:

- `DATABASE_URL` - Local PostgreSQL connection
- `NEXTAUTH_URL` - Local development URL
- `NEXTAUTH_SECRET` - Local development secret
- Azure AD credentials (optional for local)
- UploadThing credentials (optional for local)
- Resend API key (optional for local)

## Production Safety

✅ **Completely isolated from production**  
✅ **Uses local Docker PostgreSQL**  
✅ **Local environment variables**  
✅ **No impact on production database**  
✅ **Local admin user only**

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker ps

# Check database connection
npx prisma db pull
```

### Authentication Issues

- Make sure `NEXTAUTH_SECRET` is set
- Verify `NEXTAUTH_URL` matches your local URL
- Check that the admin user was created successfully

### Port Conflicts

If port 3000 is in use:

```bash
# Use a different port
npm run dev -- -p 3001
```

### Docker Issues

```bash
# Reset Docker completely
npm run docker:reset

# Check Docker logs
docker-compose logs postgres
```

```

### 3. **Environment Variables**

Your `.env.local` file already has the necessary environment variables:
```
