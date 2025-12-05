import express from "express";
import supabase from "../supabaseClient.js";

const router = express.Router();

// 📋 GET /materials - Get all materials
router.get("/", async (req, res) => {
  try {
    const { is_active } = req.query;

    let query = supabase
      .from("materials")
      .select("*")
      .order('materialname', { ascending: true });

    if (is_active !== undefined) {
      query = query.eq('is_active', is_active === 'true');
    }

    const { data: materials, error } = await query;

    if (error) throw error;

    res.status(200).json({ materials });
  } catch (err) {
    console.error("Error fetching materials:", err);
    res.status(500).json({ error: "Failed to fetch materials" });
  }
});

// ➕ POST /materials - Create new material
router.post("/", async (req, res) => {
  try {
    const { materialname, features } = req.body;

    if (!materialname) {
      return res.status(400).json({ error: "Material name is required" });
    }

    const { data: material, error } = await supabase
      .from("materials")
      .insert([{ materialname, features: features || [] }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique violation
        return res.status(400).json({ error: "Material name already exists" });
      }
      throw error;
    }

    res.status(201).json({ material });
  } catch (err) {
    console.error("Error creating material:", err);
    res.status(500).json({ error: "Failed to create material" });
  }
});

// 🔄 PATCH /materials/:materialid - Update material
router.patch("/:materialid", async (req, res) => {
  try {
    const { materialid } = req.params;
    const { materialname, features, is_active } = req.body;

    const updateData = { updatedat: new Date().toISOString() };
    
    if (materialname !== undefined) updateData.materialname = materialname;
    if (features !== undefined) updateData.features = features;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data: material, error } = await supabase
      .from("materials")
      .update(updateData)
      .eq("materialid", materialid)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: "Material not found" });
      }
      throw error;
    }

    res.status(200).json({ material });
  } catch (err) {
    console.error("Error updating material:", err);
    res.status(500).json({ error: "Failed to update material" });
  }
});

// 🗑️ DELETE /materials/:materialid - Delete material
router.delete("/:materialid", async (req, res) => {
  try {
    const { materialid } = req.params;

    const { error } = await supabase
      .from("materials")
      .delete()
      .eq("materialid", materialid);

    if (error) throw error;

    res.status(200).json({ message: "Material deleted successfully" });
  } catch (err) {
    console.error("Error deleting material:", err);
    res.status(500).json({ error: "Failed to delete material" });
  }
});

export default router;
