import express from "express";
import supabase from "../supabaseClient.js";

const router = express.Router();

// 📋 GET /quotas - Get all quotas
router.get("/", async (req, res) => {
  try {
    const { status, teamid } = req.query;

    console.log("📋 Fetching quotas");

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
      console.error("❌ Error fetching quotas:", error);
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

    console.log(`✅ Fetched ${quotasWithTeams.length} quotas`);
    res.status(200).json({ quotas: quotasWithTeams });

  } catch (err) {
    console.error("💥 Error:", err);
    res.status(500).json({ error: "Failed to fetch quotas" });
  }
});

// 🔍 GET /quotas/:quotaid - Get single quota
router.get("/:quotaid", async (req, res) => {
  try {
    const { quotaid } = req.params;

    console.log("🔍 Fetching quota:", quotaid);

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

    console.log("✅ Quota fetched successfully");
    res.status(200).json(quota);

  } catch (err) {
    console.error("💥 Error:", err);
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
      materialcount,
      startdate,
      enddate
    } = req.body;

    console.log("➕ Creating quota:", quotaname);

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
      console.error("❌ Error fetching orders:", ordersError);
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
      materialcount: materialcount || {},
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
      console.error("❌ Error creating quota:", insertError);
      return res.status(400).json({ error: insertError.message });
    }

    // If teams are assigned, update each team's linkedquotaid
    if (teamids && teamids.length > 0) {
      const { error: teamError } = await supabase
        .from("teams")
        .update({ linkedquotaid: quota.quotaid, quota: targetquota })
        .in("teamid", teamids);

      if (teamError) {
        console.error("⚠️ Warning: Could not update teams:", teamError);
      }
    }

    console.log("✅ Quota created successfully:", quota.quotaid);
    res.status(201).json(quota);

  } catch (err) {
    console.error("💥 Error:", err);
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
      teamids,
      assignedorders,
      materialcount,
      startdate,
      enddate,
      status
    } = req.body;

    console.log("🔄 Updating quota:", quotaid);

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
    if (teamids !== undefined) updateData.teamids = teamids;
    if (assignedorders !== undefined) updateData.assignedorders = assignedorders;
    if (materialcount !== undefined) updateData.materialcount = materialcount;
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
      console.error("❌ Error updating quota:", updateError);
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

    console.log("✅ Quota updated successfully");
    res.status(200).json(quota);

  } catch (err) {
    console.error("💥 Error:", err);
    res.status(500).json({ error: "Failed to update quota" });
  }
});

// ❌ DELETE /quotas/:quotaid - Delete quota
router.delete("/:quotaid", async (req, res) => {
  try {
    const { quotaid } = req.params;

    console.log("❌ Deleting quota:", quotaid);

    // First, unlink from any teams
    const { error: teamError } = await supabase
      .from("teams")
      .update({ linkedquotaid: null })
      .eq("linkedquotaid", quotaid);

    if (teamError) {
      console.error("⚠️ Warning: Could not unlink teams:", teamError);
    }

    // Delete the quota
    const { error: deleteError } = await supabase
      .from("quotas")
      .delete()
      .eq("quotaid", quotaid);

    if (deleteError) {
      console.error("❌ Error deleting quota:", deleteError);
      return res.status(400).json({ error: deleteError.message });
    }

    console.log("✅ Quota deleted successfully");
    res.status(200).json({ message: "Quota deleted successfully" });

  } catch (err) {
    console.error("💥 Error:", err);
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
    console.error("💥 Error:", err);
    res.status(500).json({ error: "Failed to get quota progress" });
  }
});

export default router;
