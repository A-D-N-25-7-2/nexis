import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import UploadModal from "../upload/UploadModal";

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Header
        onMenuClick={() => setIsSidebarOpen((prev) => !prev)}
        onUploadClick={() => setIsUploadOpen(true)}
      />

      <div className="flex pt-14">
        {/* Sidebar — hidden on mobile */}
        <div className="hidden md:block ">
          <Sidebar isOpen={isSidebarOpen} />
        </div>

        {/* Main content */}
        <main
          className={`flex-1 transition-all duration-300 p-4 md:p-6
            pb-20 md:pb-6 min-w-0 overflow-x-hidden
            ${isSidebarOpen ? "md:ml-56" : "md:ml-16"}
          `}
        >
          {children}
        </main>
      </div>

      {/* Bottom nav — mobile only */}
      <div className="md:hidden">
        <BottomNav onUploadClick={() => setIsUploadOpen(true)} />
      </div>

      {isUploadOpen && <UploadModal onClose={() => setIsUploadOpen(false)} />}
    </div>
  );
};

export default Layout;
