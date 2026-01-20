#!/bin/bash

# ============================================
# Database Migration Script
# ============================================

set -e  # Exit on error

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Database connection details
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-autodeploy}
DB_USERNAME=${DB_USERNAME:-postgres}

echo "============================================"
echo "Database Migration Script"
echo "============================================"
echo "Host: $DB_HOST"
echo "Port: $DB_PORT"
echo "Database: $DB_NAME"
echo "Username: $DB_USERNAME"
echo "============================================"
echo ""

# Function to run SQL file
run_sql_file() {
    local file=$1
    local description=$2
    
    echo "$description"
    echo "   File: $file"
    
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d $DB_NAME -f "$file"
    
    if [ $? -eq 0 ]; then
        echo "Success!"
    else
        echo "Failed!"
        exit 1
    fi
    echo ""
}

# Confirm before proceeding
echo "WARNING: This will DROP all existing tables and recreate them!"
echo "   All data will be LOST!"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Migration cancelled."
    exit 0
fi

echo ""
echo "Starting migration..."
echo ""

# Step 1: Drop all tables
run_sql_file "drop-tables.sql" "Step 1: Dropping all existing tables"

# Step 2: Create all tables
run_sql_file "migrations/001-create-tables.sql" "Step 2: Creating all tables with proper schema"

echo "============================================"
echo "Migration completed successfully!"
echo "============================================"
echo ""
echo "Next steps:"
echo "1. Restart your Node.js server"
echo "2. Verify the tables were created correctly"
echo ""
