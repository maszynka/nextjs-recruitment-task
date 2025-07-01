"use server";

import { db } from "../../db";
import { users } from "../../schema";
import { eq } from "drizzle-orm";

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
  // Basic validation
  if (!input.lastName || !input.email) {
    return { error: "Last name and email are required." };
  }
  try {
    const [user] = await db.insert(users).values(input).returning();
    return { user };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

// Get paginated users
export async function getUsers(page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize;
  const data = await db.select().from(users).limit(pageSize).offset(offset);
  const totalResult = await db.execute<{ count: string }>(
    `SELECT COUNT(*) as count FROM users`
  );
  const total = Number(
    (totalResult as unknown as Array<{ count: string }>)[0]?.count || 0
  );
  return { data, total };
}

// Update User
export async function updateUser(id: number, input: Partial<UserInput>) {
  if (!id) return { error: "User ID is required." };
  try {
    const [user] = await db
      .update(users)
      .set(input)
      .where(eq(users.id, id))
      .returning();
    return { user };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

// Delete User
export async function deleteUser(id: number) {
  if (!id) return { error: "User ID is required." };
  try {
    await db.delete(users).where(eq(users.id, id));
    return { success: true };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
}
