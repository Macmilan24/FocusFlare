import { Toaster } from "sonner"; // Or from "@/components/ui/sonner"

export default function PlatformRootLayout({
  // Renamed for clarity
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Toaster richColors position="top-right" />
    </>
  );
}
