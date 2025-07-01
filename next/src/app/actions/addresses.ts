"use server";

import { db } from "../../db";
import { usersAddresses } from "../../schema";
import { and, eq } from "drizzle-orm";

export type AddressInput = {
  userId: number;
  addressType: "HOME" | "INVOICE" | "POST" | "WORK";
  validFrom: Date;
  postCode: string;
  city: string;
  countryCode: string;
  street: string;
  buildingNumber: string;
};

// Create Address
export async function createAddress(input: AddressInput) {
  // Basic validation
  if (!input.userId || !input.addressType || !input.validFrom) {
    return { error: "User, address type, and valid from are required." };
  }
  try {
    const [address] = await db.insert(usersAddresses).values(input).returning();
    return { address };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

// Get paginated addresses for a user
export async function getAddresses(userId: number, page = 1, pageSize = 10) {
  if (!userId) return { error: "User ID is required." };
  const offset = (page - 1) * pageSize;
  const data = await db
    .select()
    .from(usersAddresses)
    .where(eq(usersAddresses.userId, userId))
    .limit(pageSize)
    .offset(offset);
  const totalResult = await db.execute<{ count: string }>(
    `SELECT COUNT(*) as count FROM users_addresses WHERE user_id = ${Number(userId)}`
  );
  const total = Number(
    (totalResult as unknown as Array<{ count: string }>)[0]?.count || 0
  );
  return { data, total };
}

// Update Address (by composite PK)
export async function updateAddress(
  userId: number,
  addressType: "HOME" | "INVOICE" | "POST" | "WORK",
  validFrom: Date,
  input: Partial<AddressInput>
) {
  if (!userId || !addressType || !validFrom)
    return { error: "Composite key required." };
  try {
    const [address] = await db
      .update(usersAddresses)
      .set(input)
      .where(
        and(
          eq(usersAddresses.userId, userId),
          eq(usersAddresses.addressType, addressType),
          eq(usersAddresses.validFrom, validFrom)
        )
      )
      .returning();
    return { address };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

// Delete Address (by composite PK)
export async function deleteAddress(
  userId: number,
  addressType: "HOME" | "INVOICE" | "POST" | "WORK",
  validFrom: Date
) {
  if (!userId || !addressType || !validFrom)
    return { error: "Composite key required." };
  try {
    await db
      .delete(usersAddresses)
      .where(
        and(
          eq(usersAddresses.userId, userId),
          eq(usersAddresses.addressType, addressType),
          eq(usersAddresses.validFrom, validFrom)
        )
      );
    return { success: true };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
}
