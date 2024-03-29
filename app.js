import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import authRouter from "./apps/auth.js";
import orderRouter from "./apps/order.js";
import matchingRouter from "./apps/matching.js";
import userRouter from "./apps/user.js";

async function init() {
  const app = express();
  const port = 4000;

  app.use(cors());
  app.use(bodyParser.json());

  app.get("/", (req, res) => {
    res.send("Hello DTs");
  });

  app.use("/auth", authRouter);
  app.use("/order", orderRouter);
  app.use("/matching", matchingRouter)
  app.use("/user",userRouter)

  app.listen(port, () => {
    console.log(`Server is running at ${port}`);
  });
}

init();
