import { Router } from "express";
import { supabase } from "../utils/db.js";

const userRouter = Router();

//users can view their balance
userRouter.get("/wallets", async function (req, res) {
  try {
    const userId = req.body.userId;
    const data = [];
    let { data: wallets } = await supabase
      .from("wallets")
      .select("*,currencies(*)")
      .eq("user_id", userId);

    wallets.map((item) => {
      data.push({ symbol: item.currencies.symbol, balance: item.balance });
    });

    return res.json({ userId: userId, data: data });
  } catch {
    return res.status(500).json({ message: `an error occurred` });
  }
});

//users can view their transaction
userRouter.get("/transactions", async function (req, res) {
  try {
    const userId = req.body.userId;

    let { data } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId);

    return res.json({ message:"fetching data success", data: data });
  } catch {
    return res.status(500).json({ message: `an error occurred` });
  }
});

//user can deposit cash
userRouter.get("/deposit", async function (req, res) {
  try {
    const userId = req.body.userId;
    const amount = req.body.amount;

    let { data: wallets } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", userId)
      .eq("currency_id", "e9ad28ce-d962-46ca-8555-4a6ba29abbab");

    console.log(wallets);

    let { data } = await supabase
      .from("wallets")
      .update({ balance: wallets[0].balance + amount })
      .eq("user_id", userId)
      .eq("currency_id", "e9ad28ce-d962-46ca-8555-4a6ba29abbab");

    return res.json({ message: `you have deposited ${amount} THB` });
  } catch {
    return res
      .status(500)
      .json({ message: `an error occurred while depositng` });
  }
});

export default userRouter;
