import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";

/**
 * /reset-password
 *
 * Page that handles Supabase password recovery links.
 * Supabase puts a session token in the URL hash with `type=recovery`.
 * We listen for the PASSWORD_RECOVERY auth event, then let the user set
 * a new password using `supabase.auth.updateUser({ password })`.
 */
export default function ResetPassword() {
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [validToken, setValidToken] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    let resolved = false;

    // Listen for the PASSWORD_RECOVERY event Supabase fires when the
    // recovery link is opened. This is the safe way to detect a valid token.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "PASSWORD_RECOVERY" && session) {
          resolved = true;
          setValidToken(true);
          setUserEmail(session.user.email ?? null);
          setVerifying(false);
        }
      }
    );

    // Fallback: check if we already have a recovery session (page reload)
    const hash = window.location.hash;
    const isRecoveryHash = hash.includes("type=recovery");

    supabase.auth.getSession().then(({ data }) => {
      if (resolved) return;
      if (data.session && isRecoveryHash) {
        setValidToken(true);
        setUserEmail(data.session.user.email ?? null);
      }
      // Give the auth listener a brief moment to fire
      setTimeout(() => {
        if (!resolved) setVerifying(false);
      }, 1500);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password minimal 8 karakter");
      return;
    }
    if (password !== confirm) {
      toast.error("Konfirmasi password tidak sama");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (error) {
      toast.error("Gagal: " + error.message);
      return;
    }
    toast.success("Password berhasil diperbarui. Silakan login kembali.");
    await supabase.auth.signOut();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary px-4">
      <div className="w-full max-w-md rounded-xl bg-card shadow-card p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-3">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold font-heading">Atur Password Baru</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Buat password baru untuk akun Anda.
          </p>
        </div>

        {verifying ? (
          <div className="flex flex-col items-center py-8 text-muted-foreground text-sm">
            <Loader2 className="h-5 w-5 animate-spin mb-2" />
            Memverifikasi tautan...
          </div>
        ) : !validToken ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
              <p className="font-semibold">Tautan tidak valid atau sudah kedaluwarsa.</p>
              <p className="mt-1 text-xs">
                Silakan minta tautan reset password baru dari halaman login atau administrator.
              </p>
            </div>
            <Button className="w-full" onClick={() => navigate("/admin/login")}>
              Kembali ke Login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {userEmail && (
              <p className="text-sm text-muted-foreground">
                Akun: <span className="font-medium text-foreground">{userEmail}</span>
              </p>
            )}
            <div>
              <Label htmlFor="np">Password Baru</Label>
              <Input
                id="np"
                type="password"
                minLength={8}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <p className="text-xs text-muted-foreground mt-1">Minimal 8 karakter.</p>
            </div>
            <div>
              <Label htmlFor="cp">Konfirmasi Password</Label>
              <Input
                id="cp"
                type="password"
                minLength={8}
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Simpan Password Baru
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}