import {
  pgTable,
  serial,
  varchar,
  timestamp,
  primaryKey,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";

export const userStatusEnum = pgEnum("status", ["ACTIVE", "INACTIVE"]);
export const addressTypeEnum = pgEnum("address_type", [
  "HOME",
  "INVOICE",
  "POST",
  "WORK",
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name", { length: 60 }),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  initials: varchar("initials", { length: 30 }),
  email: varchar("email", { length: 100 }).notNull().unique(),
  status: userStatusEnum("status").notNull().default("ACTIVE"),
  createdAt: timestamp("created_at", { withTimezone: false })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: false })
    .notNull()
    .defaultNow(),
});

export const usersAddresses = pgTable(
  "users_addresses",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    addressType: addressTypeEnum("address_type").notNull(),
    validFrom: timestamp("valid_from", { withTimezone: false }).notNull(),
    postCode: varchar("post_code", { length: 6 }).notNull(),
    city: varchar("city", { length: 60 }).notNull(),
    countryCode: varchar("country_code", { length: 3 }).notNull(),
    street: varchar("street", { length: 100 }).notNull(),
    buildingNumber: varchar("building_number", { length: 60 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: false })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: false })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.userId, table.addressType, table.validFrom],
    }),
  })
);
