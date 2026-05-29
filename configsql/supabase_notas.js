const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL || "https://ceazbepzihcvyqzmwqrf.supabase.co";
const supabaseKey = process.env.SUPABASE_ANON_KEY || "sb_publishable_EKhpJl2AIbQLlmJSozfjlQ_nx7eXhfN";

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
