import Sidebar from "@/components/Sidebar";

export default function ReaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <Sidebar variant="reader" />
      <main className="ml-64 min-h-screen p-8 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}
