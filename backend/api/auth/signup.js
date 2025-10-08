import { supabase } from "../../supabaseClient.js";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { companyName, emailAddress, companyAddress, companyNumber, password } = req.body;

    // 1️⃣ Create Supabase Auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: emailAddress,
      password: password,
    });

    if (authError) {
      console.error("❌ Supabase Auth error:", authError.message);
      return res.status(400).json({ error: authError.message });
    }

    const userId = authData.user?.id;

    // 2️⃣ Insert into customers table
    const { data: customerData, error: customerError } = await supabase
      .from("customers")
      .insert([
        {
          userid: userId,
          companyname: companyName,
          emailaddress: emailAddress,
          companyaddress: companyAddress,
          companynumber: companyNumber,
          accountstatus: "Active",
          datecreated: new Date().toISOString(),
        },
      ])
      .select();

    if (customerError) {
      console.error("❌ Customer insert error:", customerError.message);
      return res.status(500).json({ error: customerError.message });
    }

    return res.status(201).json({
      message: "Signup successful",
      user: authData.user,
      customer: customerData[0],
    });
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    return res.status(500).json({ error: "Unexpected server error" });
  }
}
