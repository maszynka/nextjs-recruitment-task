"use server";

import { db } from "../../db";
import { usersAddresses } from "../../schema";
import { eq } from "drizzle-orm";
import { handleDbAction } from "../../utils/handleDbAction";
import { DEFAULT_PAGE_SIZE } from "../constants";

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
  return handleDbAction(async () => {
    if (!input.userId || !input.addressType || !input.validFrom) {
      return { error: "User, address type, and valid from are required." };
    }
    const [address] = await db.insert(usersAddresses).values(input).returning();
    return { address };
  });
}

// Get paginated addresses for a user
export async function getAddresses(
  userId: number,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE
) {
  return handleDbAction(async () => {
    if (!userId) return { error: "User ID is required." };
    const offset = (page - 1) * pageSize;
    const data = await db
      .select()
      .from(usersAddresses)
      .where(eq(usersAddresses.userId, userId))
      .limit(pageSize)
      .offset(offset);
    const totalResult = await db.execute<{ rows: { count: string }[] }>(
      `SELECT COUNT(*) as count FROM users_addresses WHERE user_id = ${Number(userId)}`
    );
    const firstRow = totalResult.rows[0];
    const total = Number(
      (firstRow as unknown as { count: string })?.count || 0
    );
    return { data, total };
  });
}

// Update Address (by composite PK)
export async function updateAddress(
  userId: number,
  addressType: "HOME" | "INVOICE" | "POST" | "WORK",
  validFrom: Date,
  input: Partial<AddressInput>
) {
  return handleDbAction(async () => {
    if (!userId || !addressType || !validFrom)
      return { error: "Composite key required." };
    const [address] = await db
      .update(usersAddresses)
      .set(input)
      .where(eq(usersAddresses.userId, userId))
      .returning();
    return { address };
  });
}

// Delete Address (by composite PK)
export async function deleteAddress(
  userId: number,
  addressType: "HOME" | "INVOICE" | "POST" | "WORK",
  validFrom: Date
) {
  return handleDbAction(async () => {
    if (!userId || !addressType || !validFrom)
      return { error: "Composite key required." };
    await db.delete(usersAddresses).where(eq(usersAddresses.userId, userId));
    return { success: true };
  });
}
