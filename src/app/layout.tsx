import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { ClientProviders, ContextLink, RoleProjection } from "../components/command-surface";
import { AppMark, ContextBar } from "../components/atlas";
import "./globals.css";
import { IBM_Plex_Mono, IBM_Plex_Sans, IBM_Plex_Sans_Condensed } from "next/font/google";

const display = IBM_Plex_Sans_Condensed({ subsets: ["latin"], variable: "--font-display", weight: ["400", "500", "600", "700"] });
const body = IBM_Plex_Sans({ subsets: ["latin"], variable: "--font-body", weight: ["400", "500", "600", "700"] });
const mono = IBM_Plex_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["400", "500", "600"] });

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
const investigateDestinations: ReadonlyArray<readonly [string, string]> = [["Graph", "/graph"], ["Portfolio", "/portfolio"]];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} ${mono.variable}`}>
        <Suspense fallback={<p className="panel">Loading incident context…</p>}>
          <ClientProviders>
            <a className="skip-link" href="#main">Skip to content</a>
            <div className="shell">
              <aside className="rail" aria-label="Product navigation">
                <ContextLink className="rail-brand" href="/incidents"><AppMark /><span><h2>HydraCut</h2><small>forensic graph atlas</small></span></ContextLink>
                <div className="rail-group"><p className="rail-label">Respond</p><nav aria-label="Respond"><ContextLink className="rail-link" href="/incidents"><span className="rail-index">01</span>Incidents</ContextLink></nav></div>
                <div className="rail-group"><p className="rail-label">Investigate</p><nav aria-label="Investigate">{investigateDestinations.map(([label, href], index) => <ContextLink className="rail-link" key={href} href={href}><span className="rail-index">0{index + 2}</span>{label}</ContextLink>)}</nav></div>
                <div className="rail-group"><p className="rail-label">Ingest / Prove</p><nav aria-label="Ingest and prove">{destinations.slice(2, 4).map(([label, href], index) => <ContextLink className="rail-link" key={href} href={href}><span className="rail-index">0{index + 4}</span>{label}</ContextLink>)}</nav></div>
                <div className="rail-group"><p className="rail-label">Operate</p><nav aria-label="Operate"><ContextLink className="rail-link" href="/system"><span className="rail-index">06</span>System</ContextLink></nav></div>
              </aside>
              <main className="main" id="main" tabIndex={-1}><div className="main-inner"><ContextBar /><RoleProjection />{children}</div></main>
            </div>
            <nav className="mobile-nav" aria-label="Mobile product navigation"><ContextLink href="/">Home</ContextLink><ContextLink href="/incidents">Incidents</ContextLink><ContextLink href="/portfolio">Portfolio</ContextLink><ContextLink href="/imports">Imports</ContextLink><ContextLink href="/proof">Proof</ContextLink><details className="mobile-more"><summary>More</summary><div><ContextLink href="/system">System</ContextLink><ContextLink href="/graph">Graph</ContextLink></div></details></nav>
          </ClientProviders>
        </Suspense>
      </body>
    </html>
  );
}
