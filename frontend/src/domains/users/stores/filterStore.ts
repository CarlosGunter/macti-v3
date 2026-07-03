import { create } from "zustand";
import type { UserStatus } from "../types";

interface FilterStore {
  statusFilter: UserStatus | null;
  setStatusFilter: (status: UserStatus | null) => void;
}

export const useFilterStore = create<FilterStore>((set) => ({
  statusFilter: null,
  setStatusFilter: (status) => set({ statusFilter: status }),
}));
