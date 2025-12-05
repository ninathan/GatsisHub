import express from 'express';
import supabase from '../supabaseClient.js';

const router = express.Router();

// Save a new design
router.post('/save', async (req, res) => {
  try {
    const {
      customerid,
      userid,
      designName,
      hangerType,
      selectedColor,
      customText,
      textColor,
      textPosition,
      textSize,
      logoPreview,
      logoPosition,
      logoSize,
      materials,
      thumbnail, // Add thumbnail parameter
      designData // Complete 3D design JSON string
    } = req.body;

    // Prepare the design data object
    const designDataObject = {
      hangerType,
      selectedColor,
      customText,
      textColor,
      textPosition,
      textSize,
      logoPreview,
      logoPosition,
      logoSize,
      materials,
      designName,
      thumbnail, // Include thumbnail in design data
      dateSaved: new Date().toISOString()
    };

    const insertData = {
      customerid: customerid || null,
      orderid: null, // No order ID for saved designs
      url: designData || JSON.stringify(designDataObject), // Store as JSON string with thumbnail
      designname: designName || `Design ${new Date().toLocaleDateString()}`,
      userid: userid || null,
      datecreated: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('designs')
      .insert([insertData])
      .select();

    if (error) {

      return res.status(500).json({ error: error.message });
    }

    res.json({ 
      success: true, 
      design: data[0],
      message: 'Design saved successfully!' 
    });

  } catch (error) {

    res.status(500).json({ error: error.message });
  }
});

// Get all designs for a user
router.get('/user/:userid', async (req, res) => {
  try {
    const { userid } = req.params;

    const { data, error } = await supabase
      .from('designs')
      .select('*')
      .eq('userid', userid)
      .order('datecreated', { ascending: false });

    if (error) {

      return res.status(500).json({ error: error.message });
    }

    res.json(data);

  } catch (error) {

    res.status(500).json({ error: error.message });
  }
});

// Get a specific design
router.get('/:designid', async (req, res) => {
  try {
    const { designid } = req.params;

    const { data, error } = await supabase
      .from('designs')
      .select('*')
      .eq('designid', designid)
      .single();

    if (error) {

      return res.status(500).json({ error: error.message });
    }

    res.json(data);

  } catch (error) {

    res.status(500).json({ error: error.message });
  }
});

// Delete a design
router.delete('/:designid', async (req, res) => {
  try {
    const { designid } = req.params;

    const { data, error } = await supabase
      .from('designs')
      .delete()
      .eq('designid', designid)
      .select();

    if (error) {

      return res.status(500).json({ error: error.message });
    }

    res.json({ 
      success: true, 
      message: 'Design deleted successfully!' 
    });

  } catch (error) {

    res.status(500).json({ error: error.message });
  }
});

// Update a design
router.put('/:designid', async (req, res) => {
  try {
    const { designid } = req.params;
    const {
      designName,
      hangerType,
      selectedColor,
      customText,
      textColor,
      textPosition,
      textSize,
      logoPreview,
      logoPosition,
      logoSize,
      materials,
      designData
    } = req.body;

    const designDataObject = {
      hangerType,
      selectedColor,
      customText,
      textColor,
      textPosition,
      textSize,
      logoPreview,
      logoPosition,
      logoSize,
      materials,
      designName,
      dateModified: new Date().toISOString()
    };

    const updateData = {
      url: designData || JSON.stringify(designDataObject),
      designname: designName
    };

    const { data, error } = await supabase
      .from('designs')
      .update(updateData)
      .eq('designid', designid)
      .select();

    if (error) {

      return res.status(500).json({ error: error.message });
    }

    res.json({ 
      success: true, 
      design: data[0],
      message: 'Design updated successfully!' 
    });

  } catch (error) {

    res.status(500).json({ error: error.message });
  }
});

export default router;
