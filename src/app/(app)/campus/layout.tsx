import { RequireRole } from "@/components/auth/require-role";

/** Campus étudiant. Le personnel peut le consulter (prévisualisation). */
export default function CampusLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole allow={["student", "super_admin", "founder", "director", "dean", "academic_secretariat"]}>{children}</RequireRole>
  );
}
