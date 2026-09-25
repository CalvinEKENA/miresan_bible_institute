import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { getPublicSettings, primaryEmail } from "@/data/public-settings";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getPublicSettings();
  return (
    <>
      <SiteHeader phones={settings.phones} email={primaryEmail(settings)} />
      <main id="contenu">{children}</main>
      <SiteFooter settings={settings} />
    </>
  );
}
