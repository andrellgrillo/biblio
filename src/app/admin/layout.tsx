import Sidebar from "@/components/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <div className="print:hidden">
        <Sidebar variant="admin" />
      </div>
      <main className="ml-64 print:ml-0 min-h-screen p-8 print:p-0 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}
