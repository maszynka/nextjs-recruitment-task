"use server";

import { db } from "../../db";
import { users } from "../../schema";
import { eq } from "drizzle-orm";
import { handleDbAction } from "../../utils/handleDbAction";
import { DEFAULT_PAGE_SIZE } from "../constants";

// Type for user input
export type UserInput = {
  firstName?: string;
  lastName: string;
  initials?: string;
  email: string;
  status?: "ACTIVE" | "INACTIVE";
};

// Create User
export async function createUser(input: UserInput) {
  return handleDbAction(async () => {
    if (!input.lastName || !input.email) {
      return { error: "Last name and email are required." };
    }
    const [user] = await db.insert(users).values(input).returning();
    return { user };
  });
}

// Get paginated users
export async function getUsers(page = 1, pageSize = DEFAULT_PAGE_SIZE) {
  return handleDbAction(async () => {
    const offset = (page - 1) * pageSize;
    const data = await db.select().from(users).limit(pageSize).offset(offset);
    const totalResult = await db.execute<{ rows: { count: string }[] }>(
      `SELECT COUNT(*) as count FROM users`
    );
    const firstRow = totalResult.rows[0];
    const total = Number(
      (firstRow as unknown as { count: string })?.count || 0
    );
    return { data, total };
  });
}

// Update User
export async function updateUser(id: number, input: Partial<UserInput>) {
  return handleDbAction(async () => {
    if (!id) return { error: "User ID is required." };
    const [user] = await db
      .update(users)
      .set(input)
      .where(eq(users.id, id))
      .returning();
    return { user };
  });
}

// Delete User
export async function deleteUser(id: number) {
  return handleDbAction(async () => {
    if (!id) return { error: "User ID is required." };
    await db.delete(users).where(eq(users.id, id));
    return { success: true };
  });
}
