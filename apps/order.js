import { Router } from "express";
import { supabase } from "../utils/db.js";

const orderRouter = Router();

orderRouter.post("/", async function (req, res) {
  try {
    const userId = req.body.userId;
    const currencyId = req.body.currencyId;
    const orderType = req.body.orderType;
    const amount = req.body.amount;
    const price = req.body.price;

    //Buy order section
    if (orderType === "Buy") {
      //get user's cash balance
      let { data: userData } = await supabase
        .from("wallets")
        .select("*")
        .eq("currency_id", "e9ad28ce-d962-46ca-8555-4a6ba29abbab")
        .eq("user_id", userId);

      //check cash balance must greater or equal buy order
      if (userData[0].balance < amount * price) {
        return res.json({ message: "insufficient balance" });
      }

      //create buy order
      await supabase
        .from("orders")
        .insert([
          {
            user_id: userId,
            order_type: orderType,
            currency_id: currencyId,
            amount: amount,
            price: price,
          },
        ])
        .select();

      //update user's wallet
      await supabase
        .from("wallets")
        .update({ balance: userData[0].balance - amount * price })
        .eq("currency_id", "e9ad28ce-d962-46ca-8555-4a6ba29abbab")
        .eq("user_id", userId);
    }

    //Sell order section
    if (orderType === "Sell") {
      //get user's currency balance
      let { data: userData } = await supabase
        .from("wallets")
        .select("*")
        .eq("currency_id", currencyId)
        .eq("user_id", userId);

      console.log(userData);

      //check currency amount must greater or equal the amount in sell order
      if (userData[0].balance < amount) {
        return res.json({ message: "insufficient balance" });
      }

      //create sell order
      await supabase
        .from("orders")
        .insert([
          {
            user_id: userId,
            order_type: orderType,
            currency_id: currencyId,
            amount: amount,
            price: price,
          },
        ])
        .select();

      //update user's wallet
      await supabase
        .from("wallets")
        .update({ balance: userData[0].balance - amount })
        .eq("currency_id", currencyId)
        .eq("user_id", userId);
    }

    res.json({ message: "order was created successfully" });
  } catch {
    return res
      .status(500)
      .json({ message: "an error occurred while creating the order" });
  }
});

export default orderRouter;
