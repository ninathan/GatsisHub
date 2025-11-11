import express from 'express';
import supabase from '../supabaseClient.js';

const router = express.Router();

// � Get all teams
router.get("/", async (req, res) => {
  try {
    console.log('📋 Fetching all teams');

    const { data: teams, error } = await supabase
      .from("teams")
      .select("*")
      .order('createdat', { ascending: false });

    if (error) {
      console.error('❌ Error fetching teams:', error);
      throw error;
    }

    console.log(`✅ Fetched ${teams.length} teams`);

    res.status(200).json({ teams });
  } catch (err) {
    console.error("💥 Get Teams Error:", err);
    res.status(500).json({ error: "Failed to fetch teams" });
  }
});

// � Get team by ID
router.get("/:teamid", async (req, res) => {
  try {
    const { teamid } = req.params;

    console.log(`📋 Fetching team: ${teamid}`);

    const { data: team, error } = await supabase
      .from("teams")
      .select("*")
      .eq("teamid", teamid)
      .single();

    if (error) {
      console.error(`❌ Error fetching team ${teamid}:`, error);
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: "Team not found" });
      }
      throw error;
    }

    console.log(`✅ Team fetched successfully: ${teamid}`);

    res.status(200).json({ team });
  } catch (err) {
    console.error("💥 Get Team Error:", err);
    res.status(500).json({ error: "Failed to fetch team" });
  }
});

// �➕ Create new team
router.post("/create", async (req, res) => {
  try {
    const { teamname, description, members, quota, assignedOrders } = req.body;

    console.log(`➕ Creating new team: ${teamname}`);

    // Validate required fields
    if (!teamname || !teamname.trim()) {
      return res.status(400).json({ error: "Team name is required" });
    }

    // Validate members is an array
    if (!Array.isArray(members)) {
      return res.status(400).json({ error: "Members must be an array of employee IDs" });
    }

    // Check if team name already exists
    const { data: existingTeam, error: checkError } = await supabase
      .from("teams")
      .select("teamid")
      .eq("teamname", teamname.trim())
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingTeam) {
      return res.status(409).json({ error: "Team name already exists" });
    }

    // Create team
    const newTeam = {
      teamname: teamname.trim(),
      description: description ? description.trim() : null,
      members: members || [],
      quota: quota || null,
      assignedorders: assignedOrders || [],
      createdat: new Date().toISOString()
    };

    const { data: team, error } = await supabase
      .from("teams")
      .insert([newTeam])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating team:', error);
      throw error;
    }

    console.log(`✅ Team created successfully: ${team.teamid} - ${team.teamname}`);

    res.status(201).json({
      message: "Team created successfully",
      team
    });
  } catch (err) {
    console.error("💥 Create Team Error:", err);
    res.status(500).json({ error: err.message || "Failed to create team" });
  }
});

// �✏️ Update team
router.patch("/:teamid", async (req, res) => {
  try {
    const { teamid } = req.params;
    const { teamname, description, members, quota, assignedOrders } = req.body;

    console.log(`✏️ Updating team: ${teamid}`);

    // Check if team exists
    const { data: existingTeam, error: fetchError } = await supabase
      .from("teams")
      .select("*")
      .eq("teamid", teamid)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ error: "Team not found" });
      }
      throw fetchError;
    }

    // Build update object
    const updateData = {};

    if (teamname !== undefined) {
      // Check if new team name conflicts with existing teams (excluding current team)
      if (teamname.trim() !== existingTeam.teamname) {
        const { data: conflictingTeam, error: checkError } = await supabase
          .from("teams")
          .select("teamid")
          .eq("teamname", teamname.trim())
          .neq("teamid", teamid)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError;
        }

        if (conflictingTeam) {
          return res.status(409).json({ error: "Team name already exists" });
        }
      }
      updateData.teamname = teamname.trim();
    }

    if (description !== undefined) {
      updateData.description = description ? description.trim() : null;
    }

    if (members !== undefined) {
      if (!Array.isArray(members)) {
        return res.status(400).json({ error: "Members must be an array of employee IDs" });
      }
      updateData.members = members;
    }

    if (quota !== undefined) {
      updateData.quota = quota;
    }

    if (assignedOrders !== undefined) {
      if (!Array.isArray(assignedOrders)) {
        return res.status(400).json({ error: "Assigned orders must be an array" });
      }
      updateData.assignedorders = assignedOrders;
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No fields provided for update" });
    }

    // Update team
    const { data: team, error } = await supabase
      .from("teams")
      .update(updateData)
      .eq("teamid", teamid)
      .select()
      .single();

    if (error) {
      console.error(`❌ Error updating team ${teamid}:`, error);
      throw error;
    }

    console.log(`✅ Team updated successfully: ${teamid}`);

    res.status(200).json({
      message: "Team updated successfully",
      team
    });
  } catch (err) {
    console.error("💥 Update Team Error:", err);
    res.status(500).json({ error: err.message || "Failed to update team" });
  }
});

// �🗑️ Delete team
router.delete("/:teamid", async (req, res) => {
  try {
    const { teamid } = req.params;

    console.log(`🗑️ Deleting team: ${teamid}`);

    // Check if team exists
    const { data: existingTeam, error: fetchError } = await supabase
      .from("teams")
      .select("teamname")
      .eq("teamid", teamid)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ error: "Team not found" });
      }
      throw fetchError;
    }

    // Delete team
    const { error } = await supabase
      .from("teams")
      .delete()
      .eq("teamid", teamid);

    if (error) {
      console.error(`❌ Error deleting team ${teamid}:`, error);
      throw error;
    }

    console.log(`✅ Team deleted successfully: ${teamid} (${existingTeam.teamname})`);

    res.status(200).json({
      message: "Team deleted successfully",
      deletedTeam: {
        teamid: parseInt(teamid),
        teamname: existingTeam.teamname
      }
    });
  } catch (err) {
    console.error("💥 Delete Team Error:", err);
    res.status(500).json({ error: err.message || "Failed to delete team" });
  }
});

// �👥 Get teams for specific employee
router.get("/employee/:employeeid", async (req, res) => {
  try {
    const { employeeid } = req.params;

    console.log(`👥 Fetching teams for employee: ${employeeid}`);

    const { data: teams, error } = await supabase
      .from("teams")
      .select("*")
      .contains("members", [parseInt(employeeid)]);

    if (error) {
      console.error(`❌ Error fetching teams for employee ${employeeid}:`, error);
      throw error;
    }

    console.log(`✅ Found ${teams.length} teams for employee ${employeeid}`);

    res.status(200).json({ teams });
  } catch (err) {
    console.error("💥 Get Employee Teams Error:", err);
    res.status(500).json({ error: "Failed to fetch employee teams" });
  }
});

// �📊 Get team statistics
router.get("/:teamid/stats", async (req, res) => {
  try {
    const { teamid } = req.params;

    console.log(`📊 Fetching stats for team: ${teamid}`);

    // Get team details
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("*")
      .eq("teamid", teamid)
      .single();

    if (teamError) {
      if (teamError.code === 'PGRST116') {
        return res.status(404).json({ error: "Team not found" });
      }
      throw teamError;
    }

    // Get member details
    const memberIds = team.members || [];
    const { data: members, error: membersError } = await supabase
      .from("employees")
      .select("employeeid, employeename, assigneddepartment, ispresent")
      .in("employeeid", memberIds);

    if (membersError) {
      console.error('❌ Error fetching team members:', membersError);
      throw membersError;
    }

    // Calculate statistics
    const stats = {
      totalMembers: memberIds.length,
      presentMembers: members.filter(m => m.ispresent).length,
      absentMembers: members.filter(m => !m.ispresent).length,
      assignedOrders: team.assignedorders?.length || 0,
      quota: team.quota,
      departmentBreakdown: {}
    };

    // Department breakdown
    members.forEach(member => {
      const dept = member.assigneddepartment || 'Unassigned';
      stats.departmentBreakdown[dept] = (stats.departmentBreakdown[dept] || 0) + 1;
    });

    console.log(`✅ Team stats calculated for team ${teamid}`);

    res.status(200).json({
      team,
      members,
      stats
    });
  } catch (err) {
    console.error("💥 Get Team Stats Error:", err);
    res.status(500).json({ error: "Failed to fetch team statistics" });
  }
});

export default router;