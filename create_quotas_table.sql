-- Create quotas table
CREATE TABLE IF NOT EXISTS quotas (
    quotaid SERIAL PRIMARY KEY,
    quotaname VARCHAR(255) NOT NULL,
    targetquota INTEGER NOT NULL,
    finishedquota INTEGER DEFAULT 0,
    teamids INTEGER[] DEFAULT '{}',
    assignedorders UUID[] DEFAULT '{}',
    materialcount JSONB,
    startdate DATE,
    enddate DATE,
    status VARCHAR(50) DEFAULT 'Active',
    createdat TIMESTAMP DEFAULT NOW(),
    updatedat TIMESTAMP DEFAULT NOW()
);

-- Create index on teamids for faster queries
CREATE INDEX IF NOT EXISTS idx_quotas_teamids ON quotas USING GIN(teamids);

-- Create index on status
CREATE INDEX IF NOT EXISTS idx_quotas_status ON quotas(status);

-- Add columns to teams table for quota management
ALTER TABLE teams 
ADD COLUMN IF NOT EXISTS linkedquotaid INTEGER REFERENCES quotas(quotaid) ON DELETE SET NULL;

ALTER TABLE teams
ADD COLUMN IF NOT EXISTS dailyquota INTEGER DEFAULT NULL;

COMMENT ON TABLE quotas IS 'Stores production quotas with target and finished counts';
COMMENT ON COLUMN quotas.quotaid IS 'Unique identifier for the quota';
COMMENT ON COLUMN quotas.quotaname IS 'Name/description of the quota';
COMMENT ON COLUMN quotas.targetquota IS 'Target number of items to produce (sum of order quantities)';
COMMENT ON COLUMN quotas.finishedquota IS 'Number of items completed';
COMMENT ON COLUMN quotas.teamids IS 'Array of team IDs assigned to this quota';
COMMENT ON COLUMN quotas.assignedorders IS 'Array of order IDs linked to this quota';
COMMENT ON COLUMN quotas.materialcount IS 'JSON object tracking material quantities needed';
COMMENT ON COLUMN quotas.startdate IS 'Start date of quota period';
COMMENT ON COLUMN quotas.enddate IS 'End date of quota period';
COMMENT ON COLUMN quotas.status IS 'Status of quota (Active, Completed, Cancelled)';
COMMENT ON COLUMN teams.dailyquota IS 'Daily production target for the team';
