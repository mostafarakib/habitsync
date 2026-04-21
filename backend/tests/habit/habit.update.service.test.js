import mongoose from "mongoose";
import Habit from "../../src/models/habit.model.js";
import {
  createHabitService,
  updateHabitService,
} from "../../src/services/habit.services.js";

describe("updateHabitService", () => {
  let userId;
  let habit;

  beforeEach(async () => {
    userId = new mongoose.Types.ObjectId();

    habit = await createHabitService(userId, {
      title: "Read Books",
      description: "Read 30 minutes daily",
      startDate: new Date(),
      frequency: {
        type: "daily",
      },
      evaluationType: "boolean",
      targetType: "atLeast",
      targetValue: null,
      targetUnit: null,
    });
  });

  it("should update a habit successfully", async () => {
    const updateData = {
      title: "Read More Books",
      description: "Read 1 hour daily",
    };

    const updatedHabit = await updateHabitService(
      userId,
      habit._id,
      updateData
    );

    expect(updatedHabit).toBeDefined();
    expect(updatedHabit.title).toBe("Read More Books");
    expect(updatedHabit.description).toBe("Read 1 hour daily");
  });

  it("should throw an error if habit not found", async () => {
    const invalidHabitId = new mongoose.Types.ObjectId();
    const updateData = {
      title: "Non-existent Habit",
    };

    await expect(
      updateHabitService(userId, invalidHabitId, updateData)
    ).rejects.toThrow("Habit not found");
  });

  it("should throw an error if user tries to update another user's habit", async () => {
    const anotherUserId = new mongoose.Types.ObjectId();
    const updateData = {
      title: "Unauthorized Update",
    };

    await expect(
      updateHabitService(anotherUserId, habit._id, updateData)
    ).rejects.toThrow("Habit not found");
  });

  it("should validate update data", async () => {
    const invalidUpdateData = {
      evaluationType: "invalidType",
    };

    await expect(
      updateHabitService(userId, habit._id, invalidUpdateData)
    ).rejects.toThrow();
  });

  it("should not allow updating archived status through update service", async () => {
    const updateData = {
      archived: true,
    };
    const updatedHabit = await updateHabitService(
      userId,
      habit._id,
      updateData
    );

    expect(updatedHabit.archived).toBe(false); // archived status should not change
  });

  it("should not allow updating user field", async () => {
    const anotherUserId = new mongoose.Types.ObjectId();
    const updateData = {
      user: anotherUserId,
    };
    const updatedHabit = await updateHabitService(
      userId,
      habit._id,
      updateData
    );
    expect(updatedHabit.user.toString()).toBe(userId.toString()); // user field should not change
  });

  it("should allow partial updates", async () => {
    const updateData = {
      description: "Updated description only",
    };
    const updatedHabit = await updateHabitService(
      userId,
      habit._id,
      updateData
    );
    expect(updatedHabit.title).toBe("Read Books"); // title should remain unchanged
    expect(updatedHabit.description).toBe("Updated description only"); // description should be updated
  });
});
