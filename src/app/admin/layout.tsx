import Sidebar from "@/components/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <Sidebar variant="admin" />
      <main className="ml-64 min-h-screen p-8 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}
