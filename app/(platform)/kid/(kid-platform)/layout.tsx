"use client";

import { KidPlatformLayout } from "@/components/kid/kid-platform-layout";

// This layout is temporarily simplified to isolate the home page layout.
// It will be restored with a unified structure later.
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <KidPlatformLayout>
      {children}
    </KidPlatformLayout>
  );
}
