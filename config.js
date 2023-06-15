require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const supabaseUrl = process.env.API_URI;
const supabaseKey = process.env.API_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;