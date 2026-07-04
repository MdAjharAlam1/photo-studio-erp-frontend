import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Aperture } from "@phosphor-icons/react";

export default function Login() {
  const { user, login, register, formatApiError } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "owner@studio.com", password: "Owner@123", name: "" });
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") {
        await login(form.email, form.password);
        toast.success("Welcome back");
      } else {
        await register({ email: form.email, password: form.password, name: form.name || "User", role: "staff" });
        toast.success("Account created");
      }
      nav("/dashboard");
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left visual pane */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-zinc-900 text-white relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-[#0052FF] flex items-center justify-center">
            <Aperture size={24} weight="bold" />
          </div>
          <div>
            <div className="font-heading font-semibold">Studio ERP</div>
            <div className="text-[10px] tracking-[0.2em] uppercase text-zinc-400">Passport & Print</div>
          </div>
        </div>
        <div className="relative z-10">
          <h1 className="font-heading text-5xl font-semibold tracking-tight leading-tight">
            Run your <span className="text-[#7DA7FF]">photo studio</span><br />
            like a factory floor.
          </h1>
          <p className="mt-6 text-zinc-400 max-w-md leading-relaxed">
            Passport photos, GST invoices, layout builder and customer history —
            purpose-built for studios, CSC centers and print shops.
          </p>
          <div className="mt-8 flex gap-6 text-xs tracking-[0.2em] uppercase text-zinc-500">
            <div><div className="text-white font-heading text-2xl mb-1">8</div>Step Wizard</div>
            <div><div className="text-white font-heading text-2xl mb-1">GST</div>Ready</div>
            <div><div className="text-white font-heading text-2xl mb-1">A4/4×6</div>Layouts</div>
          </div>
        </div>
        <img
          src="https://images.unsplash.com/photo-1617463874381-85b513b3e991?crop=entropy&cs=srgb&fm=jpg&w=1600&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
      </div>

      {/* Right form pane */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-[#FAFAFA]">
        <form onSubmit={submit} className="w-full max-w-md space-y-5" data-testid="auth-form">
          <div>
            <div className="label-uppercase mb-2">{mode === "login" ? "Sign in" : "Create account"}</div>
            <h2 className="font-heading text-3xl font-semibold tracking-tight">
              {mode === "login" ? "Welcome back" : "Get started"}
            </h2>
            <p className="text-zinc-500 text-sm mt-1">
              {mode === "login"
                ? "Access your studio dashboard, customers and print queue."
                : "New team member? Register below."}
            </p>
          </div>

          {mode === "register" && (
            <div>
              <label className="label-uppercase block mb-1">Full name</label>
              <input
                data-testid="input-name"
                required
                className="w-full h-10 px-3 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
          )}

          <div>
            <label className="label-uppercase block mb-1">Email</label>
            <input
              data-testid="input-email"
              type="email"
              required
              className="w-full h-10 px-3 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label className="label-uppercase block mb-1">Password</label>
            <input
              data-testid="input-password"
              type="password"
              required
              className="w-full h-10 px-3 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            data-testid="submit-btn"
            disabled={busy}
            className="w-full h-11 bg-[#0052FF] hover:bg-[#0040CC] text-white rounded-md font-medium transition disabled:opacity-60"
          >
            {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>

          <div className="text-center text-sm text-zinc-500">
            {mode === "login" ? (
              <>New here?{" "}
                <button type="button" data-testid="switch-register" className="text-[#0052FF] font-medium" onClick={() => setMode("register")}>Create an account</button>
              </>
            ) : (
              <>Already have an account?{" "}
                <button type="button" data-testid="switch-login" className="text-[#0052FF] font-medium" onClick={() => setMode("login")}>Sign in</button>
              </>
            )}
          </div>

          <div className="pt-6 border-t border-zinc-200 text-xs text-zinc-500 font-mono">
            demo: owner@studio.com / Owner@123
          </div>
        </form>
      </div>
    </div>
  );
}
