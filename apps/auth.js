import { Router } from "express";
import { supabase } from "../utils/db.js";
import bcrypt from "bcrypt";

const authRouter = Router();

authRouter.post("/register", async function (req, res) {
  try {
    const data = req.body;
    const email = req.body.email;

    //check duplicated email
    let { data: users, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email);

    if (users.length !== 0) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password, salt);

    //create user data
    let { data: userData, error: registerError } = await supabase
      .from("users")
      .insert([{ email: email, password: password }])
      .select();

    //create user's wallets
    let { data: currencies } = await supabase.from("currencies").select("*");

    currencies.map(async (item) => {
      await supabase
        .from("wallets")
        .insert([
          { user_id: userData[0].user_id, currency_id: item.currency_id },
        ])
        .select();
    });

    console.log(userData[0].user_id);
    console.log(currencies);

    return res.json({ message: "registration success" });
  } catch {
    return res
      .status(500)
      .json({ message: "error occurred while registration" });
  }
});

export default authRouter;
