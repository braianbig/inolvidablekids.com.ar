import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const legalRequests = sqliteTable("legal_requests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  type: text("type").notNull(),
  name: text("name").notNull(),
  contact: text("contact").notNull(),
  bookingReference: text("booking_reference"),
  message: text("message"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
