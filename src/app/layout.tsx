import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { ClientProviders, ContextLink, RoleProjection, RoleSwitcher } from "../components/command-surface";
import "./globals.css";

export const metadata: Metadata = {
  title: "HydraCut Incident Command",
  description: "Proof-carrying portfolio dependency remediation verification.",
};

const destinations = [
  ["Incidents", "/incidents"],
  ["Portfolio", "/portfolio"],
  ["Imports", "/imports"],
  ["Proof", "/proof"],
  ["System", "/system"],
] as const;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={<p className="panel">Loading incident context…</p>}>
          <ClientProviders>
            <a className="skip-link" href="#main">Skip to content</a>
            <div className="shell">
              <aside className="rail" aria-label="Product navigation">
                <p className="accent">HydraDB native proof</p>
                <h2>HydraCut</h2>
                <p className="muted">powered by CampaignRadius</p>
                <nav className="stack">
                  {destinations.map(([label, href]) => <ContextLink key={href} href={href}>{label}</ContextLink>)}
                </nav>
                <RoleSwitcher />
              </aside>
              <main className="main" id="main" tabIndex={-1}><RoleProjection />{children}</main>
            </div>
            <nav className="mobile-nav" aria-label="Mobile product navigation">{destinations.slice(0, 4).map(([label, href]) => <ContextLink key={href} href={href}>{label}</ContextLink>)}</nav>
          </ClientProviders>
        </Suspense>
      </body>
    </html>
  );
}
