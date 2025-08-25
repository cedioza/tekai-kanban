#!/bin/bash
set -e

# Create multiple databases for the project
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create n8n database
    CREATE DATABASE n8n_db;
    GRANT ALL PRIVILEGES ON DATABASE n8n_db TO $POSTGRES_USER;
    
    -- Create additional schemas if needed
    \c tekai_db;
    CREATE SCHEMA IF NOT EXISTS public;
    CREATE SCHEMA IF NOT EXISTS analytics;
    
    -- Grant permissions
    GRANT ALL ON SCHEMA public TO $POSTGRES_USER;
    GRANT ALL ON SCHEMA analytics TO $POSTGRES_USER;
    
    -- Create extensions
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pg_trgm";
    
EOSQL

echo "Multiple databases created successfully!"