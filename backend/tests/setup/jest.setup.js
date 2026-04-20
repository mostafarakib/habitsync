import { connectTestDb, disconnectTestDb, clearDatabase } from "./testDB.js";

beforeAll(async () => {
  await connectTestDb();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await disconnectTestDb();
});
