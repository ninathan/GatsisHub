import express from "express";
import supabase from "../supabaseClient.js";

const router = express.Router();

// 📋 GET /quotas - Get all quotas
router.get("/", async (req, res) => {
  try {
    const { status, teamid } = req.query;

    let query = supabase
      .from("quotas")
      .select("*")
      .order('createdat', { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (teamid) {
      query = query.contains('teamids', [parseInt(teamid)]);
    }

    const { data: quotas, error } = await query;

    if (error) {

      throw error;
    }

    // Fetch team details for each quota
    const quotasWithTeams = await Promise.all(quotas.map(async (quota) => {
      if (quota.teamids && quota.teamids.length > 0) {
        const { data: teams } = await supabase
          .from("teams")
          .select("teamid, teamname, members")
          .in("teamid", quota.teamids);
        
        return { ...quota, teams: teams || [] };
      }
      return { ...quota, teams: [] };
    }));

    res.status(200).json({ quotas: quotasWithTeams });

  } catch (err) {

    res.status(500).json({ error: "Failed to fetch quotas" });
  }
});

// 🔍 GET /quotas/:quotaid - Get single quota
router.get("/:quotaid", async (req, res) => {
  try {
    const { quotaid } = req.params;

    const { data: quota, error } = await supabase
      .from("quotas")
      .select("*")
      .eq("quotaid", quotaid)
      .single();

    if (error || !quota) {
      return res.status(404).json({ error: "Quota not found" });
    }

    // Fetch team details if teamids exist
    if (quota.teamids && quota.teamids.length > 0) {
      const { data: teams } = await supabase
        .from("teams")
        .select("teamid, teamname, members, description")
        .in("teamid", quota.teamids);
      
      quota.teams = teams || [];
    } else {
      quota.teams = [];
    }

    res.status(200).json(quota);

  } catch (err) {

    res.status(500).json({ error: "Failed to fetch quota" });
  }
});

// ➕ POST /quotas/create - Create new quota
router.post("/create", async (req, res) => {
  try {
    const {
      quotaname,
      teamids,
      assignedorders,
      startdate,
      enddate
    } = req.body;

    // Validation
    if (!quotaname) {
      return res.status(400).json({ error: "Quota name is required" });
    }

    if (!assignedorders || assignedorders.length === 0) {
      return res.status(400).json({ error: "At least one order must be assigned to calculate target quota" });
    }

    // Fetch orders to calculate target quota from quantities
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("orderid, quantity")
      .in("orderid", assignedorders);

    if (ordersError) {

      return res.status(400).json({ error: "Failed to fetch order details" });
    }

    // Calculate target quota as sum of order quantities
    const targetquota = orders.reduce((sum, order) => sum + (order.quantity || 0), 0);

    const quotaData = {
      quotaname,
      targetquota,
      finishedquota: 0,
      teamids: teamids || [],
      assignedorders: assignedorders || [],
      startdate: startdate || null,
      enddate: enddate || null,
      status: 'Active',
      createdat: new Date().toISOString(),
      updatedat: new Date().toISOString()
    };

    const { data: quota, error: insertError } = await supabase
      .from("quotas")
      .insert([quotaData])
      .select()
      .single();

    if (insertError) {

      return res.status(400).json({ error: insertError.message });
    }

    // If teams are assigned, update each team's linkedquotaid
    if (teamids && teamids.length > 0) {
      const { error: teamError } = await supabase
        .from("teams")
        .update({ linkedquotaid: quota.quotaid, quota: targetquota })
        .in("teamid", teamids);

      if (teamError) {

      }
    }

    res.status(201).json(quota);

  } catch (err) {

    res.status(500).json({ error: "Failed to create quota" });
  }
});

// 🔄 PATCH /quotas/:quotaid - Update quota
router.patch("/:quotaid", async (req, res) => {
  try {
    const { quotaid } = req.params;
    const {
      quotaname,
      finishedquota,
      adjusted_daily_target,
      adjusted_weekly_target,
      daily_production,
      weekly_production,
      teamids,
      assignedorders,
      startdate,
      enddate,
      status
    } = req.body;

    // Get existing quota to check previous team assignments
    const { data: existingQuota, error: fetchError } = await supabase
      .from("quotas")
      .select("*")
      .eq("quotaid", quotaid)
      .single();

    if (fetchError || !existingQuota) {
      return res.status(404).json({ error: "Quota not found" });
    }

    const updateData = {
      updatedat: new Date().toISOString()
    };

    if (quotaname !== undefined) updateData.quotaname = quotaname;
    if (finishedquota !== undefined) updateData.finishedquota = parseInt(finishedquota);
    if (adjusted_daily_target !== undefined) updateData.adjusted_daily_target = parseInt(adjusted_daily_target);
    if (adjusted_weekly_target !== undefined) updateData.adjusted_weekly_target = parseInt(adjusted_weekly_target);
    if (daily_production !== undefined) updateData.daily_production = parseInt(daily_production);
    if (weekly_production !== undefined) updateData.weekly_production = parseInt(weekly_production);
    if (teamids !== undefined) updateData.teamids = teamids;
    if (assignedorders !== undefined) updateData.assignedorders = assignedorders;
    if (startdate !== undefined) updateData.startdate = startdate;
    if (enddate !== undefined) updateData.enddate = enddate;
    if (status !== undefined) updateData.status = status;

    // Recalculate target quota if assigned orders changed
    if (assignedorders !== undefined && assignedorders.length > 0) {
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("orderid, quantity")
        .in("orderid", assignedorders);

      if (!ordersError && orders) {
        updateData.targetquota = orders.reduce((sum, order) => sum + (order.quantity || 0), 0);
      }
    }

    const { data: quota, error: updateError } = await supabase
      .from("quotas")
      .update(updateData)
      .eq("quotaid", quotaid)
      .select()
      .single();

    if (updateError) {

      return res.status(400).json({ error: updateError.message });
    }

    // Handle team linkage updates
    if (teamids !== undefined) {
      // Unlink old teams that are no longer assigned
      const oldTeamIds = existingQuota.teamids || [];
      const newTeamIds = teamids || [];
      const removedTeamIds = oldTeamIds.filter(id => !newTeamIds.includes(id));
      const addedTeamIds = newTeamIds.filter(id => !oldTeamIds.includes(id));

      if (removedTeamIds.length > 0) {
        await supabase
          .from("teams")
          .update({ linkedquotaid: null })
          .in("teamid", removedTeamIds)
          .eq("linkedquotaid", quotaid);
      }

      if (addedTeamIds.length > 0) {
        await supabase
          .from("teams")
          .update({ 
            linkedquotaid: quota.quotaid,
            quota: quota.targetquota
          })
          .in("teamid", addedTeamIds);
      }

      // Update quota value for all linked teams if target changed
      if (updateData.targetquota && newTeamIds.length > 0) {
        await supabase
          .from("teams")
          .update({ quota: updateData.targetquota })
          .in("teamid", newTeamIds);
      }
    }

    res.status(200).json(quota);

  } catch (err) {

    res.status(500).json({ error: "Failed to update quota" });
  }
});

// ❌ DELETE /quotas/:quotaid - Delete quota
router.delete("/:quotaid", async (req, res) => {
  try {
    const { quotaid } = req.params;

    // First, unlink from any teams
    const { error: teamError } = await supabase
      .from("teams")
      .update({ linkedquotaid: null })
      .eq("linkedquotaid", quotaid);

    if (teamError) {

    }

    // Delete the quota
    const { error: deleteError } = await supabase
      .from("quotas")
      .delete()
      .eq("quotaid", quotaid);

    if (deleteError) {

      return res.status(400).json({ error: deleteError.message });
    }

    res.status(200).json({ message: "Quota deleted successfully" });

  } catch (err) {

    res.status(500).json({ error: "Failed to delete quota" });
  }
});

// 📊 GET /quotas/:quotaid/progress - Get quota progress
router.get("/:quotaid/progress", async (req, res) => {
  try {
    const { quotaid } = req.params;

    const { data: quota, error } = await supabase
      .from("quotas")
      .select("targetquota, finishedquota, quotaname, status")
      .eq("quotaid", quotaid)
      .single();

    if (error || !quota) {
      return res.status(404).json({ error: "Quota not found" });
    }

    const progress = {
      quotaname: quota.quotaname,
      targetquota: quota.targetquota,
      finishedquota: quota.finishedquota,
      remaining: quota.targetquota - quota.finishedquota,
      percentage: Math.round((quota.finishedquota / quota.targetquota) * 100),
      status: quota.status
    };

    res.status(200).json(progress);

  } catch (err) {

    res.status(500).json({ error: "Failed to get quota progress" });
  }
});

export default router;
