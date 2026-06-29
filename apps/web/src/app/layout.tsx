import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers } from "@/lib/apollo";
import "@/styles/globals.css";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "FollowBrief",
  description: "GraphQL-first AI follow-up assistant"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
