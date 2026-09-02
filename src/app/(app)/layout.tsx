import { SiteHeader } from "@/components/site-header";
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader app />
      <main className="container py-8 sm:py-10">{children}</main>
    </>
  );
}
