import AdminSidebar from "../components/AdminSidebar";
import AdminTopbar from "../components/AdminTopbar";
import ProtectedAdmin from "@/components/ProtectedAdmin";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedAdmin>
      <div className="fixed inset-0 z-50 !w-full !max-w-full !px-0 bg-gray-50 overflow-hidden">
        <div className="h-screen flex bg-gray-50">
          {/* Left sidebar */}
          <AdminSidebar />
          <div className="flex-1 flex flex-col ml-64 transition-all duration-300">
            {/* Top bar */}
            <AdminTopbar />

            {/* Page content */}
            <main className="p-6 flex-1 overflow-auto">{children}</main>
          </div>
        </div>
      </div>
    </ProtectedAdmin>
  );
}
