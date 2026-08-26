import dotenv from "dotenv";
dotenv.config();

import connectToDatabase from "./config/db.js";
import { app } from "./app.js";

const PORT = process.env.PORT || 8080;

connectToDatabase()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to the database:", error);
    process.exit(1);
  });
