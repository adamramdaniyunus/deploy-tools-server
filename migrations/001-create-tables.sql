-- ============================================
-- MIGRATION: Create All Tables
-- ============================================
-- Created: 2026-01-20
-- Description: Initial database schema with proper snake_case column names

-- ============================================
-- 1. CREATE USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    wrong_password_count INTEGER DEFAULT 0,
    is_blocked BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP NULL,
    last_login_ip VARCHAR(255) NULL,
    reset_password_token VARCHAR(255) NULL,
    reset_password_token_expires_at TIMESTAMP NULL,
    change_password_at TIMESTAMP NULL,
    change_password_ip VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for users
CREATE INDEX idx_users_name ON users(name);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_updated_at ON users(updated_at);

-- ============================================
-- 2. CREATE ORGANIZATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for organizations
CREATE INDEX idx_organizations_name ON organizations(name);
CREATE INDEX idx_organizations_created_at ON organizations(created_at);
CREATE INDEX idx_organizations_updated_at ON organizations(updated_at);

-- ============================================
-- 3. CREATE ORGANIZATION_MEMBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_organization_members_organization
        FOREIGN KEY (organization_id) REFERENCES organizations(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_organization_members_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);

-- Add indexes for organization_members
CREATE INDEX idx_organization_members_organization_id ON organization_members(organization_id);
CREATE INDEX idx_organization_members_user_id ON organization_members(user_id);
CREATE INDEX idx_organization_members_role ON organization_members(role);
CREATE INDEX idx_organization_members_created_at ON organization_members(created_at);
CREATE INDEX idx_organization_members_updated_at ON organization_members(updated_at);

-- ============================================
-- 4. CREATE LIST_TOOLS_PROJECT TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS list_tools_project (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    version VARCHAR(255) NOT NULL,
    build_command JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for list_tools_project
CREATE INDEX idx_list_tools_project_name ON list_tools_project(name);
CREATE INDEX idx_list_tools_project_version ON list_tools_project(version);
CREATE INDEX idx_list_tools_project_created_at ON list_tools_project(created_at);
CREATE INDEX idx_list_tools_project_updated_at ON list_tools_project(updated_at);

-- ============================================
-- 5. CREATE CREDENTIALS_PROJECTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS credentials_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    hashed_credentials TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for credentials_projects
CREATE INDEX idx_credentials_projects_project_id ON credentials_projects(project_id);
CREATE INDEX idx_credentials_projects_created_at ON credentials_projects(created_at);
CREATE INDEX idx_credentials_projects_updated_at ON credentials_projects(updated_at);

-- ============================================
-- 6. CREATE PROJECTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    tool_id UUID,
    credentials_id UUID NULL,
    app_port INTEGER DEFAULT 3000,
    domain VARCHAR(255),
    last_deployed_at TIMESTAMP NULL,
    last_deployment_status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID NOT NULL,
    CONSTRAINT fk_projects_organization
        FOREIGN KEY (organization_id) REFERENCES organizations(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_projects_created_by
        FOREIGN KEY (created_by) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_projects_updated_by
        FOREIGN KEY (updated_by) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_projects_tool
        FOREIGN KEY (tool_id) REFERENCES list_tools_project(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_projects_credentials
        FOREIGN KEY (credentials_id) REFERENCES credentials_projects(id)
        ON DELETE CASCADE
);

-- Add indexes for projects
CREATE INDEX idx_projects_name ON projects(name);
CREATE INDEX idx_projects_organization_id ON projects(organization_id);
CREATE INDEX idx_projects_tool_id ON projects(tool_id);
CREATE INDEX idx_projects_credentials_id ON projects(credentials_id);
CREATE INDEX idx_projects_app_port ON projects(app_port);
CREATE INDEX idx_projects_domain ON projects(domain);
CREATE INDEX idx_projects_last_deployed_at ON projects(last_deployed_at);
CREATE INDEX idx_projects_last_deployment_status ON projects(last_deployment_status);
CREATE INDEX idx_projects_created_at ON projects(created_at);
CREATE INDEX idx_projects_updated_at ON projects(updated_at);

-- ============================================
-- 7. CREATE LOGS_DEPLPOY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS logs_deplpoy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('success', 'failed', 'pending', 'running')),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_logs_deplpoy_project
        FOREIGN KEY (project_id) REFERENCES projects(id)
        ON DELETE CASCADE
);

-- Add indexes for logs_deplpoy
CREATE INDEX idx_logs_deplpoy_project_id ON logs_deplpoy(project_id);
CREATE INDEX idx_logs_deplpoy_status ON logs_deplpoy(status);
CREATE INDEX idx_logs_deplpoy_created_at ON logs_deplpoy(created_at);

-- ============================================
-- 8. ADD FOREIGN KEY CONSTRAINT FOR CREDENTIALS
-- ============================================
-- Note: We add this after projects table is created
ALTER TABLE credentials_projects
ADD CONSTRAINT fk_credentials_projects_project
FOREIGN KEY (project_id) REFERENCES projects(id)
ON DELETE CASCADE;

-- ============================================
-- SEED DATA: List Tools Project
-- ============================================
INSERT INTO list_tools_project (id, name, version, build_command, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000001', 'docker', '1.0.0', '{"build": "docker build -t $PROJECT_NAME .", "start": "docker run -p $APP_PORT:$APP_PORT $PROJECT_NAME"}', NOW(), NOW()),
('00000000-0000-0000-0000-000000000002', 'nginx', '1.0.0', '{"build": "nginx -s reload", "start": "nginx"}', NOW(), NOW()),
('00000000-0000-0000-0000-000000000003', 'nodejs', '1.0.0', '{"build": "npm run build", "start": "npm run start", "install": "npm install"}', NOW(), NOW()),
('00000000-0000-0000-0000-000000000004', 'php', '1.0.0', '{"build": "php artisan optimize", "start": "php artisan serve"}', NOW(), NOW()),
('00000000-0000-0000-0000-000000000005', 'static', '1.0.0', '{"build": "echo \"No build needed\"", "start": "echo \"No start needed\""}', NOW(), NOW()),
('00000000-0000-0000-0000-000000000006', 'laravel-react', '1.0.0', '{"build": "npm run build", "start": "npm run start", "composer": "composer install", "optimize": "php artisan optimize && php artisan queue:restart && php artisan config:cache && php artisan route:cache && php artisan view:cache && php artisan event:cache && php artisan storage:link", "migration": "php artisan migrate && php artisan db:seed"}', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- VERIFICATION
-- ============================================
-- List all tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Show table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
