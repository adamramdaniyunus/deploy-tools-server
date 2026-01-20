# Database Migration Guide

## Overview
This guide explains how to run database migrations for the AutoDeploy project.

## Prerequisites
- PostgreSQL installed and running
- Database credentials configured in `.env` file
- `psql` command-line tool available

## Files
- `drop-tables.sql` - Drops all existing tables
- `migrations/001-create-tables.sql` - Creates all tables with proper schema
- `migrate.sh` - Bash script to run migrations automatically

## Running Migrations

### Option 1: Using the Migration Script (Recommended)

```bash
# Make the script executable
chmod +x migrate.sh

# Run the migration
./migrate.sh
```

The script will:
1. Load environment variables from `.env`
2. Ask for confirmation before proceeding
3. Drop all existing tables
4. Create all tables with proper schema
5. Insert seed data for tools

### Option 2: Manual Migration

If you prefer to run migrations manually:

```bash
# 1. Drop all tables
psql -h localhost -p 5432 -U postgres -d autodeploy -f drop-tables.sql

# 2. Create all tables
psql -h localhost -p 5432 -U postgres -d autodeploy -f migrations/001-create-tables.sql
```

## Environment Variables

Make sure your `.env` file contains:

```env
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=autodeploy
```

## Verification

After running migrations, verify the tables were created:

```sql
-- List all tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Check table structure
\d+ users
\d+ organizations
\d+ projects
\d+ list_tools_project
```

## Seed Data

The migration automatically inserts seed data for `list_tools_project`:
- Docker
- Nginx
- Node.js
- PHP
- Static
- Laravel-React

## Troubleshooting

### Connection Error
If you get a connection error, verify:
- PostgreSQL is running
- Database exists
- Credentials are correct
- Host and port are correct

### Permission Error
If you get a permission error:
```bash
# Grant necessary permissions
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE autodeploy TO your_username;"
```

### Tables Already Exist
If tables already exist with different schema:
```bash
# Drop all tables first
psql -h localhost -p 5432 -U postgres -d autodeploy -f drop-tables.sql
```

## Important Notes

**WARNING**: Running migrations will **DROP ALL EXISTING TABLES** and **DELETE ALL DATA**!

- Always backup your data before running migrations
- Use this only in development or when you want to reset the database
- For production, use incremental migrations instead

## Next Steps

After successful migration:
1. Restart your Node.js server
2. The server will sync models with the database
3. Test the API endpoints
