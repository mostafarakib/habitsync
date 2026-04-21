import mongoose from "mongoose";
import Habit from "../../src/models/habit.model.js";
import {
  createHabitService,
  getHabitByIdService,
  getHabitsByUserService,
  archiveHabitService,
} from "../../src/services/habit.services.js";

describe("Habit Services - Read Operations", () => {
  let userId;
  let anotherUserId;

  let habit1;
  let habit2;

  beforeEach(async () => {
    userId = new mongoose.Types.ObjectId();
    anotherUserId = new mongoose.Types.ObjectId();

    habit1 = await createHabitService(userId, {
      title: "Morning Exercise",
      description: "Daily workout",
      startDate: new Date(),
      frequency: { type: "daily" },
      evaluationType: "boolean",
      targetType: "atLeast",
    });

    habit2 = await createHabitService(userId, {
      title: "Evening Walk",
      description: "Relaxing walk in the evening",
      startDate: new Date(),
      frequency: { type: "daily" },
      evaluationType: "boolean",
      targetType: "atLeast",
    });

    // Create a habit for another user to test access control
    await createHabitService(anotherUserId, {
      title: "Read Books",
      description: "Read 30 minutes daily",
      startDate: new Date(),
      frequency: { type: "daily" },
      evaluationType: "boolean",
      targetType: "atLeast",
    });
  });

  // get habit by ID tests
  it("should return a habit by ID for the owner", async () => {
    const foundHabit = await getHabitByIdService(userId, habit1._id);

    expect(foundHabit).toBeDefined();
    expect(foundHabit.title).toBe("Morning Exercise");
    expect(foundHabit.user.toString()).toBe(userId.toString());
  });

  it("should not allow access to a habit that belongs to another user", async () => {
    await expect(
      getHabitByIdService(anotherUserId, habit1._id)
    ).rejects.toThrow("Habit not found");
  });

  it("should throw error if habit is not found", async () => {
    const invalidHabitId = new mongoose.Types.ObjectId();
    await expect(getHabitByIdService(userId, invalidHabitId)).rejects.toThrow(
      "Habit not found"
    );
  });

  // get habits by user tests
  it("should return all habits for a user", async () => {
    const foundHabits = await getHabitsByUserService(userId);

    expect(foundHabits.length).toBe(2);
    const titles = foundHabits.map((h) => h.title);

    expect(titles).toContain("Morning Exercise");
    expect(titles).toContain("Evening Walk");
  });

  it("should not return another user's habits", async () => {
    const foundHabits = await getHabitsByUserService(anotherUserId);

    expect(foundHabits.length).toBe(1);
    expect(foundHabits[0].title).toBe("Read Books");
  });

  it("should return an empty array if user has no habits", async () => {
    const newUserId = new mongoose.Types.ObjectId();
    const foundHabits = await getHabitsByUserService(newUserId);

    expect(foundHabits.length).toBe(0);
  });

  // get archived habits tests

  it("should return all habits including archived by default", async () => {
    await archiveHabitService(userId, habit1._id);

    const foundHabits = await getHabitsByUserService(userId);

    expect(foundHabits.length).toBe(2);
  });

  it('should return only archived habits if "archived=true" is passed to getHabitsByUserService', async () => {
    await archiveHabitService(userId, habit1._id);
    const foundHabits = await getHabitsByUserService(userId, {
      archived: true,
    });

    expect(foundHabits.length).toBe(1);
    expect(foundHabits[0].title).toBe("Morning Exercise");
  });

  it('should return only active habits if "archived=false" is passed to getHabitsByUserService', async () => {
    await archiveHabitService(userId, habit1._id);
    const foundHabits = await getHabitsByUserService(userId, {
      archived: false,
    });

    expect(foundHabits.length).toBe(1);
    expect(foundHabits[0].title).toBe("Evening Walk");
  });
});
