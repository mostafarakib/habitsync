import mongoose from "mongoose";
import Habit from "../../src/models/habit.model.js";
import {
  createHabitService,
  archiveHabitService,
  unarchiveHabitService,
} from "../../src/services/habit.services.js";

describe("archiveHabitService & unarchiveHabitService", () => {
  let userId;
  let anotherUserId;

  let habit;

  beforeEach(async () => {
    userId = new mongoose.Types.ObjectId();
    anotherUserId = new mongoose.Types.ObjectId();

    habit = await createHabitService(userId, {
      title: "Workout",
      description: "Daily exercise",
      startDate: new Date(),
      frequency: { type: "daily" },
      evaluationType: "boolean",
      targetType: "atLeast",
    });
  });

  // archive habit tests
  it("should archive a habit successfully", async () => {
    const archivedHabit = await archiveHabitService(userId, habit._id);

    expect(archivedHabit).toBeDefined();
    expect(archivedHabit.archived).toBe(true);
  });

  it("should not allow archiving a habit that belongs to another user", async () => {
    await expect(archiveHabitService(anotherUserId, habit._id)).rejects.toThrow(
      "Habit not found"
    );
  });

  it("should throw an error if trying to archive a non-existent habit", async () => {
    const invalidHabitId = new mongoose.Types.ObjectId();
    await expect(archiveHabitService(userId, invalidHabitId)).rejects.toThrow(
      "Habit not found"
    );
  });

  // unarchive habit tests
  it("should unarchive a habit successfully", async () => {
    await archiveHabitService(userId, habit._id); // first archive it

    const unarchivedHabit = await unarchiveHabitService(userId, habit._id);

    expect(unarchivedHabit).toBeDefined();
    expect(unarchivedHabit.archived).toBe(false);
  });

  it("should not allow unarchiving a habit that belongs to another user", async () => {
    await archiveHabitService(userId, habit._id); // first archive it
    await expect(
      unarchiveHabitService(anotherUserId, habit._id)
    ).rejects.toThrow("Habit not found");
  });

  it("should throw an error if trying to unarchive a non-existent habit", async () => {
    const invalidHabitId = new mongoose.Types.ObjectId();
    await expect(unarchiveHabitService(userId, invalidHabitId)).rejects.toThrow(
      "Habit not found"
    );
  });
});
