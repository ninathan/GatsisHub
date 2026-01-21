import express from "express";
import supabase from "../supabaseClient.js";

const router = express.Router();

// 📋 GET /submissions - Get all submissions (with filters)
router.get("/", async (req, res) => {
  try {
    const { status, employeeid, teamid, quotaid } = req.query;

    let query = supabase
      .from("production_submissions")
      .select("*")
      .order('submitted_at', { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (employeeid) {
      query = query.eq('employeeid', parseInt(employeeid));
    }
    if (teamid) {
      query = query.eq('teamid', parseInt(teamid));
    }
    if (quotaid) {
      query = query.eq('quotaid', parseInt(quotaid));
    }

    const { data: submissions, error } = await query;

    if (error) {
      throw error;
    }

    // Fetch related data for each submission
    const enrichedSubmissions = await Promise.all(
      (submissions || []).map(async (submission) => {
        // Fetch quota
        const { data: quota } = await supabase
          .from("quotas")
          .select("quotaid, quotaname, targetquota, finishedquota")
          .eq("quotaid", submission.quotaid)
          .single();

        // Fetch order
        const { data: order } = await supabase
          .from("orders")
          .select("orderid, ordername, quantity, deadline")
          .eq("orderid", submission.orderid)
          .single();

        // Fetch employee
        const { data: employee } = await supabase
          .from("employees")
          .select("employeeid, employeename")
          .eq("employeeid", submission.employeeid)
          .single();

        // Fetch team if teamid exists
        let team = null;
        if (submission.teamid) {
          const { data: teamData } = await supabase
            .from("teams")
            .select("teamid, teamname")
            .eq("teamid", submission.teamid)
            .single();
          team = teamData;
        }

        // Fetch verifier if verified_by exists
        let verifier = null;
        if (submission.verified_by) {
          const { data: verifierData } = await supabase
            .from("employees")
            .select("employeeid, employeename")
            .eq("employeeid", submission.verified_by)
            .single();
          verifier = verifierData;
        }

        return {
          ...submission,
          quota,
          order,
          employee,
          team,
          verifier
        };
      })
    );

    res.status(200).json({ submissions: enrichedSubmissions });

  } catch (err) {
    console.error('Error fetching submissions:', err);
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
});

// 🔍 GET /submissions/:submissionid - Get single submission
router.get("/:submissionid", async (req, res) => {
  try {
    const { submissionid } = req.params;

    const { data: submission, error } = await supabase
      .from("production_submissions")
      .select("*")
      .eq("submissionid", submissionid)
      .single();

    if (error || !submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    res.status(200).json(submission);

  } catch (err) {
    console.error('Error fetching submission:', err);
    res.status(500).json({ error: "Failed to fetch submission" });
  }
});

// ➕ POST /submissions/create - Create new submission
router.post("/create", async (req, res) => {
  try {
    const {
      quotaid,
      orderid,
      employeeid,
      teamid,
      reported_completed,
      submission_notes,
      priority
    } = req.body;

    // Validation
    if (!quotaid || !orderid || !employeeid || !reported_completed) {
      return res.status(400).json({ 
        error: "Missing required fields: quotaid, orderid, employeeid, reported_completed" 
      });
    }

    if (reported_completed < 0) {
      return res.status(400).json({ error: "Reported completed units must be a positive number" });
    }

    // Verify the quota exists
    const { data: quota, error: quotaError } = await supabase
      .from("quotas")
      .select("quotaid, targetquota, finishedquota")
      .eq("quotaid", quotaid)
      .single();

    if (quotaError || !quota) {
      return res.status(404).json({ error: "Quota not found" });
    }

    // Verify the order exists
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("orderid, quantity")
      .eq("orderid", orderid)
      .single();

    if (orderError || !order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Create submission
    const submissionData = {
      quotaid: parseInt(quotaid),
      orderid,
      employeeid: parseInt(employeeid),
      teamid: teamid ? parseInt(teamid) : null,
      reported_completed: parseInt(reported_completed),
      submission_notes: submission_notes || null,
      priority: priority || 'Medium',
      status: 'Pending',
      submitted_at: new Date().toISOString(),
      createdat: new Date().toISOString(),
      updatedat: new Date().toISOString()
    };

    const { data: submission, error: insertError } = await supabase
      .from("production_submissions")
      .insert([submissionData])
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    res.status(201).json({
      message: "Submission created successfully",
      submission
    });

  } catch (err) {
    console.error('Error creating submission:', err);
    res.status(500).json({ error: err.message || "Failed to create submission" });
  }
});

// ✅ PATCH /submissions/:submissionid/verify - Verify a submission
router.patch("/:submissionid/verify", async (req, res) => {
  try {
    const { submissionid } = req.params;
    const {
      verified_by,
      verification_notes,
      approved
    } = req.body;

    // Validation
    if (!verified_by || approved === undefined) {
      return res.status(400).json({ 
        error: "Missing required fields: verified_by, approved" 
      });
    }

    // Get the submission
    const { data: submission, error: fetchError } = await supabase
      .from("production_submissions")
      .select("*")
      .eq("submissionid", submissionid)
      .single();

    if (fetchError || !submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    if (submission.status !== 'Pending') {
      return res.status(400).json({ error: "Submission has already been processed" });
    }

    // Get the quota to update it later
    const { data: quota, error: quotaError } = await supabase
      .from("quotas")
      .select("finishedquota")
      .eq("quotaid", submission.quotaid)
      .single();

    if (quotaError) {
      console.error('Error fetching quota:', quotaError);
    }

    const newStatus = approved ? 'Verified' : 'Rejected';

    // Update submission status
    const updateData = {
      status: newStatus,
      verified_by: parseInt(verified_by),
      verified_at: new Date().toISOString(),
      verification_notes: verification_notes || null,
      updatedat: new Date().toISOString()
    };

    const { data: updatedSubmission, error: updateError } = await supabase
      .from("production_submissions")
      .update(updateData)
      .eq("submissionid", submissionid)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // If approved, update the quota's finishedquota
    if (approved && quota) {
      const currentFinished = quota.finishedquota || 0;
      const newFinished = currentFinished + submission.reported_completed;

      const { error: quotaUpdateError } = await supabase
        .from("quotas")
        .update({ 
          finishedquota: newFinished,
          updatedat: new Date().toISOString()
        })
        .eq("quotaid", submission.quotaid);

      if (quotaUpdateError) {
        console.error('Error updating quota:', quotaUpdateError);
        // Don't fail the verification, just log the error
      }
    }

    res.status(200).json({
      message: `Submission ${approved ? 'verified' : 'rejected'} successfully`,
      submission: updatedSubmission
    });

  } catch (err) {
    console.error('Error verifying submission:', err);
    res.status(500).json({ error: err.message || "Failed to verify submission" });
  }
});

// 🔄 PATCH /submissions/:submissionid - Update submission (for employees to edit pending submissions)
router.patch("/:submissionid", async (req, res) => {
  try {
    const { submissionid } = req.params;
    const {
      reported_completed,
      submission_notes,
      priority
    } = req.body;

    // Get the submission
    const { data: submission, error: fetchError } = await supabase
      .from("production_submissions")
      .select("*")
      .eq("submissionid", submissionid)
      .single();

    if (fetchError || !submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    if (submission.status !== 'Pending') {
      return res.status(400).json({ error: "Cannot edit a submission that has been verified or rejected" });
    }

    const updateData = {
      updatedat: new Date().toISOString()
    };

    if (reported_completed !== undefined) {
      if (reported_completed < 0) {
        return res.status(400).json({ error: "Reported completed must be a positive number" });
      }
      updateData.reported_completed = parseInt(reported_completed);
    }
    if (submission_notes !== undefined) updateData.submission_notes = submission_notes;
    if (priority !== undefined) updateData.priority = priority;

    const { data: updatedSubmission, error: updateError } = await supabase
      .from("production_submissions")
      .update(updateData)
      .eq("submissionid", submissionid)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    res.status(200).json({
      message: "Submission updated successfully",
      submission: updatedSubmission
    });

  } catch (err) {
    console.error('Error updating submission:', err);
    res.status(500).json({ error: err.message || "Failed to update submission" });
  }
});

// ❌ DELETE /submissions/:submissionid - Delete submission
router.delete("/:submissionid", async (req, res) => {
  try {
    const { submissionid } = req.params;

    // Check if submission exists and is pending
    const { data: submission, error: fetchError } = await supabase
      .from("production_submissions")
      .select("status")
      .eq("submissionid", submissionid)
      .single();

    if (fetchError || !submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    if (submission.status !== 'Pending') {
      return res.status(400).json({ error: "Cannot delete a submission that has been verified or rejected" });
    }

    const { error: deleteError } = await supabase
      .from("production_submissions")
      .delete()
      .eq("submissionid", submissionid);

    if (deleteError) {
      throw deleteError;
    }

    res.status(200).json({ message: "Submission deleted successfully" });

  } catch (err) {
    console.error('Error deleting submission:', err);
    res.status(500).json({ error: "Failed to delete submission" });
  }
});

// 📊 GET /submissions/stats/:employeeid - Get employee submission statistics
router.get("/stats/:employeeid", async (req, res) => {
  try {
    const { employeeid } = req.params;

    const { data: submissions, error } = await supabase
      .from("production_submissions")
      .select("status, reported_completed")
      .eq("employeeid", parseInt(employeeid));

    if (error) {
      throw error;
    }

    const stats = {
      total: submissions.length,
      pending: submissions.filter(s => s.status === 'Pending').length,
      verified: submissions.filter(s => s.status === 'Verified').length,
      rejected: submissions.filter(s => s.status === 'Rejected').length,
      totalProduced: submissions
        .filter(s => s.status === 'Verified')
        .reduce((sum, s) => sum + s.reported_completed, 0)
    };

    res.status(200).json(stats);

  } catch (err) {
    console.error('Error fetching submission stats:', err);
    res.status(500).json({ error: "Failed to fetch submission statistics" });
  }
});

export default router;
