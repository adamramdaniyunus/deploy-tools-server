-- ============================================
-- SEED DEFAULT DATA
-- ============================================
-- This script creates default user and organization for development

-- Create default user
INSERT INTO users (id, name, email, password, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000001', 'Default User', 'admin@autodeploy.local', '$2b$10$defaulthash', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create default organization
INSERT INTO organizations (id, name, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000001', 'Default Organization', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Add default user to default organization as owner
INSERT INTO organization_members (id, organization_id, user_id, role, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'owner', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Verify
SELECT 'Users:' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Organizations:', COUNT(*) FROM organizations
UNION ALL
SELECT 'Organization Members:', COUNT(*) FROM organization_members;




-- dummmy user and organization
INSERT INTO users (id, name, email, password, created_at, updated_at) VALUES
(uuid, 'Adam', 'adamramdani@deploy.com', 'dummy123', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO organizations (id, name, created_at, updated_at) VALUES
(uuid, 'Adam Organization', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO organization_members (id, organization_id, user_id, role, created_at, updated_at) VALUES
(uuid, '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'owner', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;