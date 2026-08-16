import { useContext } from "react";
import { AdminDataContext } from "./adminDataContextInstance";

export function useAdminData() {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error("useAdminData must be used within AdminDataProvider");
  return ctx;
}
