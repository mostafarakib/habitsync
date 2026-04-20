import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

const connectTestDb = async () => {
  mongoServer = await MongoMemoryServer.create();

  const uri = mongoServer.getUri();

  await mongoose.connect(uri);
};

const disconnectTestDb = async () => {
  await mongoose.disconnect();

  await mongoServer.stop();
};

const clearDatabase = async () => {
  const collections = await mongoose.connection.db.collections();

  for (const collection of collections) {
    if (collection.collectionName) {
      await collection.deleteMany({});
    }
  }
};

export { connectTestDb, disconnectTestDb, clearDatabase };
