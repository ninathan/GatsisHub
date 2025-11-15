# Quota Management System - Implementation Guide

## Overview
The Quota Management System allows Operational Managers to create, track, and manage production quotas linked to teams and orders. The system automatically calculates material requirements based on assigned orders and provides real-time progress tracking.

## Features

### 1. **Quota Creation & Management**
- Create quotas with target and finished counts
- Assign quotas to specific teams
- Link multiple orders to a single quota
- Set date ranges for quota periods
- Track quota status (Active, Completed, Cancelled)

### 2. **Material Count Automation**
- Automatically calculates material requirements based on assigned orders
- Aggregates material needs across all orders in a quota
- Displays material breakdown in an easy-to-read format

### 3. **Team Integration**
- Teams can be linked to quotas via `linkedquotaid`
- Monthly quota value syncs from quota target to team
- Team view shows quota linkage status
- Unlinking is automatic when quota is deleted

### 4. **Progress Tracking**
- Visual progress bars showing completion percentage
- Real-time updates of finished vs target quota
- Remaining quota calculations
- Status indicators with color coding

## Database Schema

### Quotas Table
```sql
CREATE TABLE quotas (
    quotaid SERIAL PRIMARY KEY,
    quotaname VARCHAR(255) NOT NULL,
    targetquota INTEGER NOT NULL,
    finishedquota INTEGER DEFAULT 0,
    teamid INTEGER REFERENCES teams(teamid),
    assignedorders UUID[],
    materialcount JSONB,
    startdate DATE,
    enddate DATE,
    status VARCHAR(50) DEFAULT 'Active',
    createdat TIMESTAMP DEFAULT NOW(),
    updatedat TIMESTAMP DEFAULT NOW()
);
```

### Teams Table Update
```sql
ALTER TABLE teams 
ADD COLUMN linkedquotaid INTEGER REFERENCES quotas(quotaid);
```

## API Endpoints

### Get All Quotas
```
GET /quotas
Query Params: status, teamid
Response: { quotas: [...] }
```

### Get Single Quota
```
GET /quotas/:quotaid
Response: { quota object with team details }
```

### Create Quota
```
POST /quotas/create
Body: {
  quotaname: string,
  targetquota: number,
  teamid: number (optional),
  assignedorders: UUID[],
  materialcount: object,
  startdate: date,
  enddate: date
}
```

### Update Quota
```
PATCH /quotas/:quotaid
Body: { fields to update }
```

### Delete Quota
```
DELETE /quotas/:quotaid
```

### Get Quota Progress
```
GET /quotas/:quotaid/progress
Response: {
  quotaname, targetquota, finishedquota,
  remaining, percentage, status
}
```

## Frontend Components

### Tabs Structure
- **All Employees Tab**: View and manage employees
- **Teams Tab**: Manage teams and view linked quotas
- **Quotas Tab**: Full quota management interface (NEW)

### Quota Tab Features

#### Quota Card Display
- Quota name and delete button
- Progress bar with percentage
- Team assignment indicator
- Assigned orders count
- Status badge (Active/Completed/Cancelled)
- Date range display

#### Create/Edit Modal
**Basic Information:**
- Quota Name (required)
- Target Quota (required)
- Finished Quota
- Team Assignment (dropdown)
- Start Date
- End Date
- Status (Active/Completed/Cancelled)

**Order Assignment:**
- Checkbox list of available orders
- Shows company name, hanger type, and quantity
- "Calculate Materials" button

**Material Requirements:**
- Auto-calculated from assigned orders
- Grid display of materials and quantities
- Updates when orders are selected/deselected

**Progress Display (View Mode):**
- Progress bar with gradient
- Percentage complete
- Remaining count

### Teams Tab Enhancement
- Monthly Quota field now shows linkage status
- Blue badge indicates "Linked to Quota"
- Displays "Not Set" if no quota assigned

## Usage Workflow

### Creating a Quota

1. Navigate to **Quotas** tab
2. Click **Create Quota** button
3. Fill in quota details:
   - Enter quota name
   - Set target quota number
   - Select team (optional)
   - Choose start and end dates
4. Assign orders:
   - Check orders to include in quota
   - Click "Calculate Materials" to see requirements
5. Click **Create Quota**

### Editing a Quota

1. Click on any quota card
2. Click **Edit** button
3. Modify any fields
4. Reassign orders if needed
5. Recalculate materials
6. Click **Save Changes**

### Tracking Progress

1. View quota cards for quick overview
2. Progress bar shows visual completion
3. Click quota card for detailed view
4. Monitor finished vs target quota
5. Check material requirements

### Linking Quota to Team

1. Create or edit a quota
2. Select team from dropdown
3. Save quota
4. Team's "Monthly Quota" automatically updates
5. Team view shows "Linked to Quota" badge

### Unlinking Quota from Team

1. Edit quota
2. Change team selection to "No Team"
3. Save changes
4. OR delete the quota (auto-unlinks)

## Material Count Calculation

The system automatically calculates material requirements:

```javascript
// For each assigned order:
materials = order.materials // e.g., { "Plastic": 60, "Metal": 40 }
quantity = order.quantity

// Calculate material count:
materialCount["Plastic"] = (60/100) * quantity
materialCount["Metal"] = (40/100) * quantity

// Aggregate across all orders
```

**Example:**
- Order 1: 100 hangers, 60% Plastic, 40% Metal
- Order 2: 50 hangers, 80% Plastic, 20% Metal

**Result:**
- Plastic: (60 + 40) = 100 units
- Metal: (40 + 10) = 50 units

## Key State Management

### Quota State
```javascript
const [quotas, setQuotas] = useState([]);
const [selectedQuota, setSelectedQuota] = useState(null);
const [isEditingQuota, setIsEditingQuota] = useState(false);
const [quotaFormData, setQuotaFormData] = useState({
  quotaname: "",
  targetquota: "",
  finishedquota: 0,
  teamid: "",
  assignedOrders: [],
  materialcount: {},
  startdate: "",
  enddate: "",
  status: "Active"
});
```

## Best Practices

### For Operational Managers

1. **Create Realistic Quotas**: Base targets on team capacity and timeline
2. **Link to Teams Early**: Assign teams when creating quotas for better tracking
3. **Update Progress Regularly**: Keep finished quota count current
4. **Use Date Ranges**: Set clear start and end dates for accountability
5. **Monitor Materials**: Check material counts before production starts
6. **Complete Old Quotas**: Mark quotas as "Completed" or "Cancelled" when done

### For Developers

1. **Always Refresh**: After quota operations, refresh both quotas AND teams
2. **Handle Null Values**: Check for linkedquotaid before displaying
3. **Validate Input**: Ensure target quota is positive number
4. **Calculate on Demand**: Only calculate materials when requested
5. **Error Handling**: Show user-friendly messages for all operations

## Error Handling

- **Failed to Create**: Check required fields (name, target)
- **Failed to Update**: Ensure quotaid exists
- **Failed to Delete**: May have database dependencies
- **Team Not Updated**: Quota saved but team link failed (non-critical)

## Future Enhancements

- Bulk quota creation
- Quota templates
- Automatic progress updates from order completions
- Quota analytics and reports
- Email notifications for quota completion
- Historical quota tracking
- Team performance metrics based on quotas

## Troubleshooting

**Quota not appearing in team view:**
- Check if `linkedquotaid` is set in teams table
- Verify team has a quota value
- Refresh both tabs

**Material count not calculating:**
- Ensure orders have materials field
- Check order quantity is valid number
- Verify materials object has percentage values

**Cannot delete quota:**
- Check database foreign key constraints
- Ensure no circular references
- Try unlinking from team first

## Migration Steps

1. Run `create_quotas_table.sql` in Supabase SQL editor
2. Deploy backend changes (server.js, routes/quotas.js)
3. Update frontend (Employees.jsx with quota tab)
4. Test create/edit/delete operations
5. Verify team linkage works
6. Test material calculations

## Testing Checklist

- [ ] Create new quota without team
- [ ] Create quota with team assignment
- [ ] Edit quota details
- [ ] Assign/unassign orders
- [ ] Calculate material counts
- [ ] Update finished quota
- [ ] Change quota status
- [ ] Delete quota
- [ ] Verify team shows linkage
- [ ] Test date range filtering
- [ ] Check progress calculations

---

**Version**: 1.0  
**Last Updated**: November 16, 2025  
**Author**: GatsisHub Development Team
