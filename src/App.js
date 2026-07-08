// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { Toaster } from "sonner";
// import { AuthProvider } from "@/context/AuthContext";
// import ProtectedRoute from "@/components/ProtectedRoute";
// import AppLayout from "@/components/AppLayout";
// import Login from "@/pages/Login";
// import Dashboard from "@/pages/Dashboard";
// import Customers from "@/pages/Customers";
// import CustomerDetail from "@/pages/CustomerDetail";
// import Invoices from "@/pages/Invoices";
// import InvoiceNew from "@/pages/InvoiceNew";
// import InvoiceDetail from "@/pages/InvoiceDetail";
// import PassportMaker from "@/pages/PassportMaker";
// import PhotoTools from "@/pages/PhotoTools";
// import PdfTools from "@/pages/PdfTools";
// import AiStudio from "@/pages/AiStudio";
// import Reports from "@/pages/Reports";
// import PrintQueue from "@/pages/PrintQueue";
// import Settings from "@/pages/Settings";
// import "@/App.css";

// function App() {
//   return (
//     <BrowserRouter>
//       <AuthProvider>
//         <Toaster position="top-right" richColors />
//         <Routes>
//           <Route path="/login" element={<Login />} />
//           <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
//             <Route path="/" element={<Navigate to="/dashboard" replace />} />
//             <Route path="/dashboard" element={<Dashboard />} />
//             <Route path="/customers" element={<Customers />} />
//             <Route path="/customers/:id" element={<CustomerDetail />} />
//             <Route path="/invoices" element={<Invoices />} />
//             <Route path="/invoices/new" element={<InvoiceNew />} />
//             <Route path="/invoices/:id" element={<InvoiceDetail />} />
//             <Route path="/passport" element={<PassportMaker />} />
//             <Route path="/photo-tools" element={<PhotoTools />} />
//             <Route path="/pdf-tools" element={<PdfTools />} />
//             <Route path="/ai-studio" element={<AiStudio />} />
//             <Route path="/reports" element={<Reports />} />
//             <Route path="/print-queue" element={<PrintQueue />} />
//             <Route path="/settings" element={<Settings />} />
//           </Route>
//           <Route path="*" element={<Navigate to="/dashboard" replace />} />
//         </Routes>
//       </AuthProvider>
//     </BrowserRouter>
//   );
// }

// export default App;




import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Customers from "@/pages/Customers";
import CustomerDetail from "@/pages/CustomerDetail";
import Invoices from "@/pages/Invoices";
import InvoiceNew from "@/pages/InvoiceNew";
import InvoiceDetail from "@/pages/InvoiceDetail";
import PassportMaker from "@/pages/PassportMaker";
import MultiPhotoPassport from "@/pages/ Multiphotopassport";
import PhotoTools from "@/pages/PhotoTools";
import PdfTools from "@/pages/PdfTools";
import AiStudio from "@/pages/AiStudio";
import Reports from "@/pages/Reports";
import PrintQueue from "@/pages/PrintQueue";
import Settings from "@/pages/Settings";
import "@/App.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" richColors />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/customers/:id" element={<CustomerDetail />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/invoices/new" element={<InvoiceNew />} />
            <Route path="/invoices/:id" element={<InvoiceDetail />} />
            <Route path="/passport" element={<PassportMaker />} />
            <Route path="/passport/multi" element={<MultiPhotoPassport />} />
            <Route path="/photo-tools" element={<PhotoTools />} />
            <Route path="/pdf-tools" element={<PdfTools />} />
            <Route path="/ai-studio" element={<AiStudio />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/print-queue" element={<PrintQueue />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;


