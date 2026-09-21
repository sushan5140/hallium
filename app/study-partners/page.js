import PartnerStudio from "./PartnerStudio";

export const metadata = {
  title: "Study Partners — Hallium",
  description: "Local-only preview of complementary Korean learning partnerships, selective note sharing and mutual practice.",
  robots: { index: false, follow: false },
};

export default function StudyPartnersPage() {
  return <PartnerStudio />;
}
