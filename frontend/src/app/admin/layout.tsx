import AdminSidebar from "../components/AdminSidebar";
import AdminTopbar from "../components/AdminTopbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="-mt-[136px] !w-full !max-w-full !px-0">
      <div className="min-h-screen flex bg-gray-50">
        {/* Left sidebar */}
        <AdminSidebar />
        <div className="flex-1 flex flex-col ml-55 transition-all duration-300">
          {/* Top bar */}
          <AdminTopbar />

          {/* Page content */}
          <main className="p-6 flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
