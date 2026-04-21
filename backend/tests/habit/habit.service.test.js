import mongoose from "mongoose";
import Habit from "../../src/models/habit.model.js";
import { createHabitService } from "../../src/services/habit.services.js";

// habit service tests
describe("createHabitService", () => {
  it("should create a habit successfully", async () => {
    const userId = new mongoose.Types.ObjectId();

    const habitData = {
      title: "Drink Water",
      description: "Stay Hydrated",
      startDate: new Date(),
      frequency: {
        type: "daily",
      },
      evaluationType: "boolean",
      targetType: "atLeast",
      targetValue: null,
      targetUnit: null,
    };

    const habit = await createHabitService(userId, habitData);

    expect(habit).toBeDefined();
    expect(habit.title).toBe("Drink Water");

    expect(habit.user.toString()).toBe(userId.toString());
    expect(habit.archived).toBe(false); // default check
  });

  it("should save habit in database", async () => {
    const userId = new mongoose.Types.ObjectId();

    const habitData = {
      title: "Morning Run",
      startDate: new Date(),
      frequency: {
        type: "daily",
      },
      evaluationType: "boolean",
      targetType: "atLeast",
    };

    const createdHabit = await createHabitService(userId, habitData);
    const foundHabit = await Habit.findById(createdHabit._id);

    expect(foundHabit).not.toBeNull();
    expect(foundHabit.title).toBe("Morning Run");
    expect(foundHabit.user.toString()).toBe(userId.toString());
  });

  it("should fail if the title is missing", async () => {
    const userId = new mongoose.Types.ObjectId();

    const habitData = {
      startDate: new Date(),
      evaluationType: "boolean",
      targetType: "atLeast",
    };

    await expect(createHabitService(userId, habitData)).rejects.toThrow();
  });

  it("should fail if evaluationType is invalid", async () => {
    const userId = new mongoose.Types.ObjectId();

    const habitData = {
      title: "Invalid Habit",
      startDate: new Date(),
      evaluationType: "invalid-type", // wrong enum
      targetType: "atLeast",
    };

    await expect(createHabitService(userId, habitData)).rejects.toThrow();
  });
});
