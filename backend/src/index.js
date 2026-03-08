import dotenv from "dotenv";
dotenv.config();

import connectToDatabase from "./config/db.js";
import { app } from "./app.js";

connectToDatabase()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running on port ${process.env.PORT || 8000}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to the database:", error);
    process.exit(1);
  });
