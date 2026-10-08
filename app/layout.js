import "./globals.css";
import { LegalSiteFooter } from "./legal/LegalPage";
import OfflineRegistration from "./offline/OfflineRegistration";

export const metadata = {
  metadataBase: new URL("https://hallium.vercel.app"),
  title: {
    default: "Hallim | Structured Korean",
    template: "%s | Hallim",
  },
  description: "Structured Korean learning with guided curriculum, listening, review, measurable progress, and adaptive practice.",
  openGraph: {
    title: "Hallim | Structured Korean",
    description: "A structured Korean curriculum with measurable progress and adaptive practice.",
    type: "website",
    url: "https://hallium.vercel.app",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body><a className="skipToContent" href="#main-content">Skip to main content</a><div id="main-content">{children}</div><LegalSiteFooter /><OfflineRegistration /></body>
    </html>
  );
}
