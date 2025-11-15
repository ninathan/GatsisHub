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
      .select(`
        *,
        teams:teamid (
          teamid,
          teamname,
          members
        )
      `)
      .order('createdat', { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (teamid) {
      query = query.eq('teamid', teamid);
    }

    const { data: quotas, error } = await query;

    if (error) {
      console.error("❌ Error fetching quotas:", error);
      throw error;
    }

    console.log(`✅ Fetched ${quotas.length} quotas`);
    res.status(200).json({ quotas });

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
      .select(`
        *,
        teams:teamid (
          teamid,
          teamname,
          members,
          description
        )
      `)
      .eq("quotaid", quotaid)
      .single();

    if (error || !quota) {
      return res.status(404).json({ error: "Quota not found" });
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
      targetquota,
      teamid,
      assignedorders,
      materialcount,
      startdate,
      enddate
    } = req.body;

    console.log("➕ Creating quota:", quotaname);

    // Validation
    if (!quotaname || !targetquota) {
      return res.status(400).json({ error: "Quota name and target quota are required" });
    }

    const quotaData = {
      quotaname,
      targetquota: parseInt(targetquota),
      finishedquota: 0,
      teamid: teamid ? parseInt(teamid) : null,
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

    // If team is assigned, update team's linkedquotaid
    if (teamid) {
      const { error: teamError } = await supabase
        .from("teams")
        .update({ linkedquotaid: quota.quotaid, quota: targetquota })
        .eq("teamid", teamid);

      if (teamError) {
        console.error("⚠️ Warning: Could not update team:", teamError);
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
      targetquota,
      finishedquota,
      teamid,
      assignedorders,
      materialcount,
      startdate,
      enddate,
      status
    } = req.body;

    console.log("🔄 Updating quota:", quotaid);

    const updateData = {
      updatedat: new Date().toISOString()
    };

    if (quotaname !== undefined) updateData.quotaname = quotaname;
    if (targetquota !== undefined) updateData.targetquota = parseInt(targetquota);
    if (finishedquota !== undefined) updateData.finishedquota = parseInt(finishedquota);
    if (teamid !== undefined) updateData.teamid = teamid ? parseInt(teamid) : null;
    if (assignedorders !== undefined) updateData.assignedorders = assignedorders;
    if (materialcount !== undefined) updateData.materialcount = materialcount;
    if (startdate !== undefined) updateData.startdate = startdate;
    if (enddate !== undefined) updateData.enddate = enddate;
    if (status !== undefined) updateData.status = status;

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

    // If team is assigned or changed, update team's linkedquotaid
    if (teamid !== undefined) {
      if (teamid) {
        const { error: teamError } = await supabase
          .from("teams")
          .update({ 
            linkedquotaid: quota.quotaid,
            quota: updateData.targetquota || quota.targetquota
          })
          .eq("teamid", teamid);

        if (teamError) {
          console.error("⚠️ Warning: Could not update team:", teamError);
        }
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
