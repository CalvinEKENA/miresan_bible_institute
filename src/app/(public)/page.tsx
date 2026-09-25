import { Hero } from "@/components/public/home/hero";
import { Manifesto } from "@/components/public/home/manifesto";
import {
  AcademicLifeSection,
  AdmissionsSection,
  AudienceSection,
  ContactSection,
  GovernanceSection,
  KeyFacts,
  MinistrySection,
  NewsSection,
  ProgrammeSection,
} from "@/components/public/home/sections";
import { Triptych } from "@/components/public/home/triptych";
import { getPublicSettings, primaryEmail } from "@/data/public-settings";
import { SITE_URL } from "@/lib/env";

export default async function HomePage() {
  const settings = await getPublicSettings();
  const email = primaryEmail(settings);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: settings.name,
    alternateName: [settings.englishName, settings.shortName, settings.acronym],
    slogan: settings.motto.join(" • "),
    url: SITE_URL,
    logo: `${SITE_URL}/branding/logo-ib-miresan-384.webp`,
    email,
    telephone: settings.phones,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address.line,
      addressLocality: settings.address.city,
      addressCountry: "CM",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Hero settings={settings} />
      <Manifesto />
      <Triptych />
      <KeyFacts settings={settings} />
      <ProgrammeSection />
      <AudienceSection settings={settings} />
      <AcademicLifeSection settings={settings} />
      <MinistrySection />
      <GovernanceSection />
      <AdmissionsSection settings={settings} />
      <NewsSection settings={settings} />
      <ContactSection settings={settings} email={email} />
    </>
  );
}
