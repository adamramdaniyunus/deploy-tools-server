-- Database Schema for AutoDeploy (PostgreSQL / MySQL Compatible) --

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(36) PRIMARY KEY, -- UUID
    organizationId VARCHAR(36) NOT NULL, -- For relation to organization
    name VARCHAR(255) NOT NULL,
    credentialsId VARCHAR(36) NOT NULL, -- For relation to credentials_projects
    appPort INTEGER DEFAULT 3000,
    branch VARCHAR(32) NOT NULL DEFAULT "main",
    domain VARCHAR(255),
    lastDeployedAt TIMESTAMP NULL,
    lastDeploymentStatus VARCHAR(50),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createdBy VARCHAR(36) NOT NULL,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedBy VARCHAR(36) NOT NULL
);

-- Add foreign key constraint to projects table
ALTER TABLE projects
ADD CONSTRAINT fk_projects_organization
FOREIGN KEY (organizationId) REFERENCES organizations(id)
ON DELETE CASCADE;

ALTER TABLE projects
ADD CONSTRAINT fk_projects_createdBy
FOREIGN KEY (createdBy) REFERENCES users(id)
ON DELETE CASCADE;

ALTER TABLE projects
ADD CONSTRAINT fk_projects_updatedBy
FOREIGN KEY (updatedBy) REFERENCES users(id)
ON DELETE CASCADE;

ALTER TABLE projects
ADD CONSTRAINT fk_projects_credentials
FOREIGN KEY (credentialsId) REFERENCES credentials_projects(id)
ON DELETE CASCADE;

-- Add foreign key constraint for toolId
ALTER TABLE projects
ADD CONSTRAINT fk_projects_tool
FOREIGN KEY (toolId) REFERENCES list_tools_project(id)
ON DELETE SET NULL;

-- Add index to projects table
CREATE INDEX idx_projects_name ON projects(name);
CREATE INDEX idx_projects_toolId ON projects(toolId);
CREATE INDEX idx_projects_credentialsId ON projects(credentialsId);
CREATE INDEX idx_projects_appPort ON projects(appPort);
CREATE INDEX idx_projects_domain ON projects(domain);
CREATE INDEX idx_projects_lastDeployedAt ON projects(lastDeployedAt);
CREATE INDEX idx_projects_lastDeploymentStatus ON projects(lastDeploymentStatus);
CREATE INDEX idx_projects_createdAt ON projects(createdAt);
CREATE INDEX idx_projects_updatedAt ON projects(updatedAt);


-- Credentials Projects
CREATE TABLE IF NOT EXISTS credentials_projects (
    id VARCHAR(36) PRIMARY KEY, -- UUID
    projectId VARCHAR(36) NOT NULL,
    hashed_credentials TEXT NOT NULL, -- Encrypted credentials include host, username, password, privateKey, port, deployPath
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint to credentials_projects table
ALTER TABLE credentials_projects
ADD CONSTRAINT fk_credentials_projects_project
FOREIGN KEY (projectId) REFERENCES projects(id)
ON DELETE CASCADE;

-- Add index to credentials_projects table
CREATE INDEX idx_credentials_projects_project_id ON credentials_projects(projectId);
CREATE INDEX idx_credentials_projects_createdAt ON credentials_projects(createdAt);
CREATE INDEX idx_credentials_projects_updatedAt ON credentials_projects(updatedAt);

-- History Deploy
CREATE TABLE IF NOT EXISTS logs_deplpoy (
    id VARCHAR(36) PRIMARY KEY, -- UUID
    projectId VARCHAR(36) NOT NULL,
    status VARCHAR(50) NOT NULL, -- success, failed
    message TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint to logs_deplpoy table
ALTER TABLE logs_deplpoy
ADD CONSTRAINT fk_logs_deplpoy_project
FOREIGN KEY (projectId) REFERENCES projects(id)
ON DELETE CASCADE;

-- Add index to logs_deplpoy table
CREATE INDEX idx_logs_deplpoy_project_id ON logs_deplpoy(projectId);

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY, -- UUID
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    wrongPasswordCount INT DEFAULT 0, -- if 3 then block user
    isBlocked BOOLEAN DEFAULT FALSE, -- if true then block user
    lastLoginAt TIMESTAMP NULL, -- last login time
    lastLoginIp VARCHAR(255) NULL, -- last login ip
    resetPasswordToken VARCHAR(255) NULL, -- reset password token
    resetPasswordTokenExpiresAt TIMESTAMP NULL, -- reset password token expires at
    changePasswordAt TIMESTAMP NULL, -- change password time
    changePasswordIp VARCHAR(255) NULL, -- change password ip
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index to users table
CREATE INDEX idx_users_name ON users(name);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_password ON users(password);
CREATE INDEX idx_users_createdAt ON users(createdAt);
CREATE INDEX idx_users_updatedAt ON users(updatedAt);


-- Create table association for organization
CREATE TABLE IF NOT EXISTS organizations (
    id VARCHAR(36) PRIMARY KEY, -- UUID
    name VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index to organizations table
CREATE INDEX idx_organizations_name ON organizations(name);
CREATE INDEX idx_organizations_createdAt ON organizations(createdAt);
CREATE INDEX idx_organizations_updatedAt ON organizations(updatedAt);

-- Create table association for organization members
CREATE TABLE IF NOT EXISTS organization_members (
    id VARCHAR(36) PRIMARY KEY, -- UUID
    organizationId VARCHAR(36) NOT NULL,
    userId VARCHAR(36) NOT NULL,
    role VARCHAR(50) NOT NULL, -- owner, admin, member
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint to organization_members table
ALTER TABLE organization_members
ADD CONSTRAINT fk_organization_members_organization
FOREIGN KEY (organizationId) REFERENCES organizations(id)
ON DELETE CASCADE;

-- Add foreign key constraint to organization_members table
ALTER TABLE organization_members
ADD CONSTRAINT fk_organization_members_user
FOREIGN KEY (userId) REFERENCES users(id)
ON DELETE CASCADE;

-- Add index to organization_members table
CREATE INDEX idx_organization_members_organization_id ON organization_members(organizationId);
CREATE INDEX idx_organization_members_user_id ON organization_members(userId);
CREATE INDEX idx_organization_members_role ON organization_members(role);
CREATE INDEX idx_organization_members_createdAt ON organization_members(createdAt);
CREATE INDEX idx_organization_members_updatedAt ON organization_members(updatedAt);

-- Add index to projects table
CREATE INDEX idx_projects_organization_id ON projects(organizationId);


-- Create list type project
CREATE TABLE IF NOT EXISTS list_type_project (
    id VARCHAR(36) PRIMARY KEY, -- UUID
    name VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index to list_type_project table
CREATE INDEX idx_list_type_project_name ON list_type_project(name);
CREATE INDEX idx_list_type_project_createdAt ON list_type_project(createdAt);
CREATE INDEX idx_list_type_project_updatedAt ON list_type_project(updatedAt);

-- Create list tools for option project
CREATE TABLE IF NOT EXISTS list_tools_project (
    id VARCHAR(36) PRIMARY KEY, -- UUID
    name VARCHAR(255) NOT NULL, -- docker, nginx, nodejs, php, static, laravel-react
    version VARCHAR(255) NOT NULL, -- 1.0.0
    build_command JSON NOT NULL, -- {"build": "npm run build", "start": "npm run start", "composer": "composer install", "optimize": "php artisan optimize"}
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index to list_tools_project table
CREATE INDEX idx_list_tools_project_name ON list_tools_project(name);
CREATE INDEX idx_list_tools_project_version ON list_tools_project(version);
CREATE INDEX idx_list_tools_project_createdAt ON list_tools_project(createdAt);
CREATE INDEX idx_list_tools_project_updatedAt ON list_tools_project(updatedAt);




-- Seed Data
INSERT INTO list_tools_project (id, name, version, build_command, createdAt, updatedAt) VALUES
('1', 'docker', '1.0.0', '{"build": "docker build -t $PROJECT_NAME .", "start": "docker run -p $APP_PORT:$APP_PORT $PROJECT_NAME"}', NOW(), NOW()),
('2', 'nginx', '1.0.0', '{"build": "nginx -s reload", "start": "nginx"}', NOW(), NOW()),
('3', 'nodejs', '1.0.0', '{"build": "npm run build", "start": "npm run start"}', NOW(), NOW()),
('4', 'php', '1.0.0', '{"build": "php artisan optimize", "start": "php artisan serve"}', NOW(), NOW()),
('5', 'static', '1.0.0', '{"build": "echo \"No build needed\"", "start": "echo \"No start needed\""}', NOW(), NOW()),
('6', 'laravel-react', '1.0.0', '{"build": "npm run build", "start": "npm run start", "composer": "composer install", "optimize": "php artisan optimize && php artisan queue:restart && php artisan config:cache && php artisan route:cache && php artisan view:cache && php artisan event:cache && php artisan storage:link", "migration": "php artisan migrate && php artisan db:seed"}', NOW(), NOW());


-- Seed Data
INSERT INTO list_type_project (id, name, createdAt, updatedAt) VALUES
('1', 'nodejs', NOW(), NOW()),
('2', 'php', NOW(), NOW()),
('3', 'static', NOW(), NOW()),
('4', 'laravel-react', NOW(), NOW());
