import express from "express";
import supabase from "../supabaseClient.js";

const router = express.Router();

// 📋 GET /products - Get all products
router.get("/", async (req, res) => {
  try {
    const { is_active } = req.query;

    let query = supabase
      .from("products")
      .select("*")
      .order('productname', { ascending: true });

    if (is_active !== undefined) {
      query = query.eq('is_active', is_active === 'true');
    }

    const { data: products, error } = await query;

    if (error) throw error;

    res.status(200).json({ products });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// ➕ POST /products - Create new product
router.post("/", async (req, res) => {
  try {
    const { productname, description, image_url, model_url } = req.body;

    if (!productname) {
      return res.status(400).json({ error: "Product name is required" });
    }

    const { data: product, error } = await supabase
      .from("products")
      .insert([{ productname, description, image_url, model_url }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique violation
        return res.status(400).json({ error: "Product name already exists" });
      }
      throw error;
    }

    res.status(201).json({ product });
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ error: "Failed to create product" });
  }
});

// 🔄 PATCH /products/:productid - Update product
router.patch("/:productid", async (req, res) => {
  try {
    const { productid } = req.params;
    const { productname, description, image_url, model_url, is_active } = req.body;

    const updateData = { updatedat: new Date().toISOString() };
    
    if (productname !== undefined) updateData.productname = productname;
    if (description !== undefined) updateData.description = description;
    if (image_url !== undefined) updateData.image_url = image_url;
    if (model_url !== undefined) updateData.model_url = model_url;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data: product, error } = await supabase
      .from("products")
      .update(updateData)
      .eq("productid", productid)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: "Product not found" });
      }
      throw error;
    }

    res.status(200).json({ product });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// 🗑️ DELETE /products/:productid - Delete product
router.delete("/:productid", async (req, res) => {
  try {
    const { productid } = req.params;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("productid", productid);

    if (error) throw error;

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;
