import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const computers = pgTable("computers", {
  id: serial("id").primaryKey(),
  computerName: text("computer_name").notNull(),
  ipAddress: text("ip_address"),
  osVersion: text("os_version"),
  lastSyncTime: timestamp("last_sync_time"),
  lastReportedStatusTime: timestamp("last_reported_status_time"),
  neededCount: integer("needed_count").default(0),
  installedCount: integer("installed_count").default(0),
  failedCount: integer("failed_count").default(0),
  isOnline: boolean("is_online").default(true)
});

export const updates = pgTable("updates", {
  id: serial("id").primaryKey(),
  updateId: text("update_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  classification: text("classification"),
  severity: text("severity"),
  isApproved: boolean("is_approved").default(false),
  releaseDate: timestamp("release_date")
});

export const computerUpdates = pgTable("computer_updates", {
  id: serial("id").primaryKey(),
  computerId: integer("computer_id").notNull(),
  updateId: integer("update_id").notNull(),
  status: text("status").notNull(), // Needed, Installed, Failed
  installationDate: timestamp("installation_date")
});

export const insertComputerSchema = createInsertSchema(computers).omit({ 
  id: true 
});

export const insertUpdateSchema = createInsertSchema(updates).omit({
  id: true
});

export const insertComputerUpdateSchema = createInsertSchema(computerUpdates).omit({
  id: true
});

export type Computer = typeof computers.$inferSelect;
export type Update = typeof updates.$inferSelect;
export type ComputerUpdate = typeof computerUpdates.$inferSelect;
export type InsertComputer = z.infer<typeof insertComputerSchema>;
export type InsertUpdate = z.infer<typeof insertUpdateSchema>;
export type InsertComputerUpdate = z.infer<typeof insertComputerUpdateSchema>;
