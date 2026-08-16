import { useContext } from "react";
import { RolePreviewContext } from "./rolePreviewContextInstance";

export function useRolePreview() {
  const ctx = useContext(RolePreviewContext);
  if (!ctx) throw new Error("useRolePreview must be used within RolePreviewProvider");
  return ctx;
}
