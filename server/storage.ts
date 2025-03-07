import type { Computer, Update, ComputerUpdate } from "@shared/schema";

export interface IStorage {
  getAllComputers(): Promise<Computer[]>;
  getComputerByName(name: string): Promise<Computer | undefined>;
  getAllUpdates(): Promise<Update[]>;
  getNonCompliantComputers(): Promise<Computer[]>;
  getUpdateStatus(updateId: string): Promise<{total: number, needed: number, installed: number, failed: number}>;
  getComplianceStats(): Promise<{compliant: number, noncompliant: number, total: number}>;
  syncData(computers: any[], updates: any[]): Promise<void>;
}

export class MemStorage implements IStorage {
  private computers: Map<number, Computer>;
  private updates: Map<number, Update>;
  private computerUpdates: Map<number, ComputerUpdate>;
  private currentId: number;

  constructor() {
    this.computers = new Map();
    this.updates = new Map();
    this.computerUpdates = new Map();
    this.currentId = 1;
  }

  async getAllComputers(): Promise<Computer[]> {
    return Array.from(this.computers.values());
  }

  async getComputerByName(name: string): Promise<Computer | undefined> {
    return Array.from(this.computers.values()).find(c => c.computerName === name);
  }

  async getAllUpdates(): Promise<Update[]> {
    return Array.from(this.updates.values());
  }

  async getNonCompliantComputers(): Promise<Computer[]> {
    return Array.from(this.computers.values())
      .filter(c => (c.neededCount || 0) > 0 || (c.failedCount || 0) > 0);
  }

  async getUpdateStatus(updateId: string): Promise<{total: number, needed: number, installed: number, failed: number}> {
    const update = Array.from(this.updates.values()).find(u => u.updateId === updateId);
    if (!update) throw new Error("Update not found");

    const statuses = Array.from(this.computerUpdates.values())
      .filter(cu => cu.updateId === update.id);

    return {
      total: this.computers.size,
      needed: statuses.filter(s => s.status === "Needed").length,
      installed: statuses.filter(s => s.status === "Installed").length,
      failed: statuses.filter(s => s.status === "Failed").length
    };
  }

  async getComplianceStats(): Promise<{compliant: number, noncompliant: number, total: number}> {
    const computers = Array.from(this.computers.values());
    const compliant = computers.filter(c => 
      (c.neededCount || 0) === 0 && (c.failedCount || 0) === 0
    ).length;

    return {
      compliant,
      noncompliant: computers.length - compliant,
      total: computers.length
    };
  }

  async syncData(computers: any[], updates: any[]): Promise<void> {
    // Clear existing data
    this.computers.clear();
    this.updates.clear();
    this.computerUpdates.clear();

    // Insert new data
    computers.forEach((c, idx) => {
      this.computers.set(idx + 1, {
        id: idx + 1,
        computerName: c.FullDomainName,
        ipAddress: c.IPAddress,
        osVersion: c.OSVersion,
        lastSyncTime: new Date(c.LastSyncTime),
        lastReportedStatusTime: new Date(c.LastReportedStatusTime),
        neededCount: 0,
        installedCount: 0,
        failedCount: 0,
        isOnline: true
      });
    });

    updates.forEach((u, idx) => {
      this.updates.set(idx + 1, {
        id: idx + 1,
        updateId: u.UpdateId,
        title: u.Title,
        description: u.Description,
        classification: u.Classification,
        severity: u.SeverityRating,
        isApproved: u.IsApproved,
        releaseDate: new Date()
      });
    });
  }
}

export const storage = new MemStorage();