// import { Outlet, NavLink, useNavigate } from "react-router-dom";
// import { useAuth } from "@/context/AuthContext";
// import {
//   ChartBar, UsersThree, Receipt, IdentificationCard, GearSix, SignOut, Aperture,
//   Image as ImageIcon, File as FilePdf, ChartLine, Printer, Sparkle,
// } from "@phosphor-icons/react";

// const NavItem = ({ to, icon: Icon, label, testid }) => (
//   <NavLink
//     to={to}
//     data-testid={testid}
//     className={({ isActive }) =>
//       `flex items-center gap-3 px-4 py-2.5 rounded-md text-sm transition-colors ${
//         isActive
//           ? "bg-zinc-900 text-white"
//           : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
//       }`
//     }
//   >
//     <Icon size={18} weight="regular" />
//     <span>{label}</span>
//   </NavLink>
// );

// export default function AppLayout() {
//   const { user, logout } = useAuth();
//   const nav = useNavigate();

//   const handleLogout = async () => {
//     await logout();
//     nav("/login");
//   };

//   return (
//     <div className="min-h-screen bg-[#FAFAFA] flex">
//       {/* Sidebar */}
//       <aside className="w-64 shrink-0 bg-white border-r border-zinc-200 flex flex-col">
//         <div className="px-5 py-5 border-b border-zinc-200">
//           <div className="flex items-center gap-2">
//             <div className="w-8 h-8 rounded-md bg-[#0052FF] flex items-center justify-center">
//               <Aperture size={20} weight="bold" color="white" />
//             </div>
//             <div>
//               <div className="font-heading font-semibold text-sm">STUDIO ERP</div>
//               <div className="text-[10px] tracking-widest text-zinc-500 uppercase">Passport & Print</div>
//             </div>
//           </div>
//         </div>
//         <nav className="flex-1 p-3 space-y-1">
//           <div className="label-uppercase px-4 pt-2 pb-1">Workspace</div>
//           <NavItem to="/dashboard" icon={ChartBar} label="Dashboard" testid="nav-dashboard" />
//           <NavItem to="/passport" icon={IdentificationCard} label="Passport Maker" testid="nav-passport" />
//           <NavItem to="/ai-studio" icon={Sparkle} label="AI Studio" testid="nav-ai-studio" />
//           <NavItem to="/photo-tools" icon={ImageIcon} label="Photo Tools" testid="nav-photo-tools" />
//           <NavItem to="/pdf-tools" icon={FilePdf} label="PDF Tools" testid="nav-pdf-tools" />
//           <div className="label-uppercase px-4 pt-4 pb-1">Business</div>
//           <NavItem to="/customers" icon={UsersThree} label="Customers" testid="nav-customers" />
//           <NavItem to="/invoices" icon={Receipt} label="Invoices" testid="nav-invoices" />
//           <NavItem to="/reports" icon={ChartLine} label="Reports" testid="nav-reports" />
//           <NavItem to="/print-queue" icon={Printer} label="Print Queue" testid="nav-print-queue" />
//           <div className="label-uppercase px-4 pt-4 pb-1">System</div>
//           <NavItem to="/settings" icon={GearSix} label="Settings" testid="nav-settings" />
//         </nav>
//         <div className="p-3 border-t border-zinc-200">
//           <div className="flex items-center justify-between px-2 pb-2">
//             <div className="min-w-0">
//               <div className="text-sm font-medium truncate" data-testid="user-name">{user?.name}</div>
//               <div className="text-[10px] tracking-widest uppercase text-zinc-500">{user?.role}</div>
//             </div>
//             <button
//               onClick={handleLogout}
//               data-testid="logout-btn"
//               className="p-2 rounded-md hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900"
//               title="Logout"
//             >
//               <SignOut size={18} />
//             </button>
//           </div>
//         </div>
//       </aside>

//       {/* Main */}
//       <main className="flex-1 min-w-0">
//         <Outlet />
//       </main>
//     </div>
//   );
// }






import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  ChartBar, UsersThree, Receipt, IdentificationCard, GearSix, SignOut, Aperture,
  Image as ImageIcon, File as FilePdf, ChartLine, Printer, Sparkle, Stack,
} from "@phosphor-icons/react";

const NavItem = ({ to, icon: Icon, label, testid }) => (
  <NavLink
    to={to}
    data-testid={testid}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-2.5 rounded-md text-sm transition-colors ${
        isActive
          ? "bg-zinc-900 text-white"
          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
      }`
    }
  >
    <Icon size={18} weight="regular" />
    <span>{label}</span>
  </NavLink>
);

export default function AppLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const handleLogout = async () => {
    await logout();
    nav("/login");
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-white border-r border-zinc-200 flex flex-col">
        <div className="px-5 py-5 border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-[#0052FF] flex items-center justify-center">
              <Aperture size={20} weight="bold" color="white" />
            </div>
            <div>
              <div className="font-heading font-semibold text-sm">STUDIO ERP</div>
              <div className="text-[10px] tracking-widest text-zinc-500 uppercase">Passport & Print</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <div className="label-uppercase px-4 pt-2 pb-1">Workspace</div>
          <NavItem to="/dashboard" icon={ChartBar} label="Dashboard" testid="nav-dashboard" />
          <NavItem to="/passport" icon={IdentificationCard} label="Passport Maker" testid="nav-passport" />
          <NavItem to="/passport/multi" icon={Stack} label="Multi-Photo Passport" testid="nav-passport-multi" />
          <NavItem to="/ai-studio" icon={Sparkle} label="AI Studio" testid="nav-ai-studio" />
          <NavItem to="/photo-tools" icon={ImageIcon} label="Photo Tools" testid="nav-photo-tools" />
          <NavItem to="/pdf-tools" icon={FilePdf} label="PDF Tools" testid="nav-pdf-tools" />
          <div className="label-uppercase px-4 pt-4 pb-1">Business</div>
          <NavItem to="/customers" icon={UsersThree} label="Customers" testid="nav-customers" />
          <NavItem to="/invoices" icon={Receipt} label="Invoices" testid="nav-invoices" />
          <NavItem to="/reports" icon={ChartLine} label="Reports" testid="nav-reports" />
          <NavItem to="/print-queue" icon={Printer} label="Print Queue" testid="nav-print-queue" />
          <div className="label-uppercase px-4 pt-4 pb-1">System</div>
          <NavItem to="/settings" icon={GearSix} label="Settings" testid="nav-settings" />
        </nav>
        <div className="p-3 border-t border-zinc-200">
          <div className="flex items-center justify-between px-2 pb-2">
            <div className="min-w-0">
              <div className="text-sm font-medium truncate" data-testid="user-name">{user?.name}</div>
              <div className="text-[10px] tracking-widest uppercase text-zinc-500">{user?.role}</div>
            </div>
            <button
              onClick={handleLogout}
              data-testid="logout-btn"
              className="p-2 rounded-md hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900"
              title="Logout"
            >
              <SignOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
