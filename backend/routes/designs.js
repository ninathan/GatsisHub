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

    console.log('💾 Saving design:', { customerid, userid, designName, hangerType, hasThumbnail: !!thumbnail });

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

    console.log('📦 Insert data:', { ...insertData, url: insertData.url ? '[JSON_DATA]' : null });

    const { data, error } = await supabase
      .from('designs')
      .insert([insertData])
      .select();

    if (error) {
      console.error('❌ Error saving design:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('✅ Design saved successfully:', data);
    res.json({ 
      success: true, 
      design: data[0],
      message: 'Design saved successfully!' 
    });

  } catch (error) {
    console.error('❌ Server error saving design:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all designs for a user
router.get('/user/:userid', async (req, res) => {
  try {
    const { userid } = req.params;

    console.log('🔍 Fetching designs for user:', userid);

    const { data, error } = await supabase
      .from('designs')
      .select('*')
      .eq('userid', userid)
      .order('datecreated', { ascending: false });

    if (error) {
      console.error('❌ Error fetching designs:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log(`✅ Found ${data.length} designs for user ${userid}`);
    res.json(data);

  } catch (error) {
    console.error('❌ Server error fetching designs:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get a specific design
router.get('/:designid', async (req, res) => {
  try {
    const { designid } = req.params;

    console.log('🔍 Fetching design:', designid);

    const { data, error } = await supabase
      .from('designs')
      .select('*')
      .eq('designid', designid)
      .single();

    if (error) {
      console.error('❌ Error fetching design:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('✅ Design found:', data);
    res.json(data);

  } catch (error) {
    console.error('❌ Server error fetching design:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a design
router.delete('/:designid', async (req, res) => {
  try {
    const { designid } = req.params;

    console.log('🗑️ Deleting design:', designid);

    const { data, error } = await supabase
      .from('designs')
      .delete()
      .eq('designid', designid)
      .select();

    if (error) {
      console.error('❌ Error deleting design:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('✅ Design deleted successfully');
    res.json({ 
      success: true, 
      message: 'Design deleted successfully!' 
    });

  } catch (error) {
    console.error('❌ Server error deleting design:', error);
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

    console.log('✏️ Updating design:', designid);

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
      console.error('❌ Error updating design:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('✅ Design updated successfully');
    res.json({ 
      success: true, 
      design: data[0],
      message: 'Design updated successfully!' 
    });

  } catch (error) {
    console.error('❌ Server error updating design:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
