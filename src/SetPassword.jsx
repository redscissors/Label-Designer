import { useState } from "react";
import { Layers } from "lucide-react";
import { supabase } from "./lib/supabase.js";

// Shown when a user arrives via an invite or password-reset link. They are
// already authenticated by the link; this lets them set a real password so they
// can sign in normally afterwards.
export default function SetPassword({ email, onDone, onCancel }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (password.length < 6) { setErr("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setErr("Passwords don't match."); return; }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      onDone();
    } catch (x) {
      setErr(x.message || "Could not set password");
    } finally {
      setBusy(false);
    }
  };

  const inp = "ft-field w-full rounded-full border border-slate-200 px-4 h-12 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus:ring-offset-2 focus:ring-offset-[#FDFCF8] focus:border-transparent transition";

  return (
    <div className="relative h-screen flex items-center justify-center bg-slate-50 p-6 overflow-hidden" style={{ fontFamily: "'Nunito', ui-sans-serif, system-ui, sans-serif" }}>
      <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 bg-[#5D7052]/15 blur-3xl" style={{ borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" }} />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 -right-20 w-[28rem] h-[28rem] bg-[#C18C5D]/15 blur-3xl" style={{ borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%" }} />

      <div className="relative w-full max-w-sm bg-white border border-slate-200 rounded-[2rem] rounded-tl-[3.5rem] p-7 ft-lift">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 shadow-[0_4px_16px_-4px_rgba(93,112,82,0.4)]"><Layers size={22} className="text-white" /></div>
          <div>
            <div className="ft-display text-xl font-bold leading-none">Set your password</div>
            <div className="text-xs text-slate-400 mt-1">{email ? email : "Create a password to finish setting up"}</div>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">New password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inp} autoComplete="new-password" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Confirm password</label>
            <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inp} autoComplete="new-password" />
          </div>

          {err && <div className="text-sm text-red-600 bg-red-50 rounded-2xl px-4 py-2.5">{err}</div>}

          <button type="submit" disabled={busy} className="w-full rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-bold h-12 transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-[0_4px_20px_-2px_rgba(93,112,82,0.25)]">
            {busy ? "Saving…" : "Set password & continue"}
          </button>
        </form>

        {onCancel && (
          <button onClick={onCancel} className="w-full text-center text-xs text-slate-400 mt-4 hover:text-slate-600">
            Sign out
          </button>
        )}
      </div>
    </div>
  );
}
