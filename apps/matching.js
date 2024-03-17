import { Router } from "express";
import { supabase } from "../utils/db.js";

const matchingRounter = Router();

matchingRounter.put("/", async function (req, res) {
  try {
    //get buy orders
    let { data: buyOrders } = await supabase
      .from("orders")
      .select("*")
      .eq("order_type", "Buy")
      .eq("status", "Open");

    console.log(buyOrders);

    if (buyOrders.length === 0)
      return res.json({ message: "no order to matching" });

    for (let i = 0; i < buyOrders.length; i++) {
      //get buyer wallet
      let { data: buyerWallet } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", buyOrders[i].user_id)
        .eq("currency_id", buyOrders[i].currency_id);

      //get buy order amount
      let buyOrderAmount = buyOrders[i].amount;

      //get sell orders
      let { data: sellOrders, error } = await supabase
        .from("orders")
        .select("*")
        .eq("order_type", "Sell")
        .eq("status", "Open")
        .neq("user_id", buyOrders[i].user_id)
        .lte("price", buyOrders[i].price);

      console.log(sellOrders);

      //matching buy and sell orders together
      if (sellOrders.length === 0)
        return res.json({ message: "no order to matching" });

      for (let j = 0; j < sellOrders.length; j++) {
        //get seller wallet
        let { data: sellerWallet } = await supabase
          .from("wallets")
          .select("*")
          .eq("user_id", sellOrders[j].user_id)
          .eq("currency_id", "e9ad28ce-d962-46ca-8555-4a6ba29abbab");

        //get sell order amount

        if (buyOrders[i].amount <= sellOrders[j].amount) {
          const sellOrderAmount =
            (await sellOrders[j].amount) - buyOrders[i].amount;
          const status = sellOrderAmount === 0 ? "Closed" : "Open";

          //update buy order status
          await supabase
            .from("orders")
            .update({ amount: 0, status: "Closed" })
            .eq("order_id", buyOrders[i].order_id);

          //update sell order status
          await supabase
            .from("orders")
            .update({ amount: sellOrderAmount, status: status })
            .eq("order_id", sellOrders[j].order_id);

          //update buyer wallet
          await supabase
            .from("wallets")
            .update({ balance: buyerWallet[0].balance + buyOrders[i].amount })
            .eq("user_id", buyOrders[i].user_id)
            .eq("currency_id", buyOrders[i].currency_id);

          //update seller wallet
          await supabase
            .from("wallets")
            .update({
              balance:
                sellerWallet[0].balance +
                buyOrders[i].amount * buyOrders[i].price,
            })
            .eq("user_id", sellOrders[j].user_id)
            .eq("currency_id", "e9ad28ce-d962-46ca-8555-4a6ba29abbab");

          const { data, error } = await supabase.from("transactions").insert([
            {
              transaction_type: "Buy",
              user_id: buyOrders[i].user_id,
              order_id: buyOrders[i].order_id,
              related_user_id: sellOrders[j].user_id,
              related_order_id: sellOrders[j].order_id,
              amount: buyOrders[j].amount,
              price: buyOrders[i].price,
            },
            {
              transaction_type: "Sell",
              user_id: sellOrders[j].user_id,
              order_id: sellOrders[j].order_id,
              related_user_id: buyOrders[i].user_id,
              related_order_id: buyOrders[i].order_id,
              amount: buyOrders[j].amount,
              price: buyOrders[i].price,
            },
          ]);
        } else {
          buyOrderAmount = buyOrderAmount - sellOrders[j].amount;
          const status = buyOrderAmount === 0 ? "Closed" : "Open";

          //update buy order status
          await supabase
            .from("orders")
            .update({ amount: buyOrderAmount, status: status })
            .eq("order_id", buyOrders[i].order_id);

          //update sell order status
          await supabase
            .from("orders")
            .update({ amount: 0, status: "Closed" })
            .eq("order_id", sellOrders[j].order_id);

          //update buyer wallet
          await supabase
            .from("wallets")
            .update({ balance: buyerWallet[0].balance + sellOrders[j].amount })
            .eq("user_id", buyOrders[i].user_id)
            .eq("currency_id", buyOrders[i].currency_id);

          //update seller wallet
          await supabase
            .from("wallets")
            .update({
              balance:
                sellerWallet[0].balance +
                sellOrders[j].amount * buyOrders[i].price,
            })
            .eq("user_id", sellOrders[j].user_id)
            .eq("currency_id", "e9ad28ce-d962-46ca-8555-4a6ba29abbab");

          //create transactions log

          const { data, error } = await supabase.from("transactions").insert([
            {
              transaction_type: "Buy",
              user_id: buyOrders[i].user_id,
              order_id: buyOrders[i].order_id,
              related_user_id: sellOrders[j].user_id,
              related_order_id: sellOrders[j].order_id,
              amount: sellOrders[j].amount,
              price: buyOrders[i].price,
            },
            {
              transaction_type: "Sell",
              user_id: sellOrders[j].user_id,
              order_id: sellOrders[j].order_id,
              related_user_id: buyOrders[i].user_id,
              related_order_id: buyOrders[i].order_id,
              amount: sellOrders[j].amount,
              price: buyOrders[i].price,
            },
          ]);
        }
      }
    }

    return res.json({ message: "matching success" });
  } catch {
    return res.status(500).json({ message: `an error occurred` });
  }
});

export default matchingRounter;
