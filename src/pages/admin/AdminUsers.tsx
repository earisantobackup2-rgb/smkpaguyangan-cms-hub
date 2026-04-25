import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, KeyRound, Shield, MailCheck } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type AppRole = "administrator" | "admin";

type AdminUser = {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  role: AppRole | null;
};

async function callAdminFn(action: string, payload: Record<string, unknown> = {}) {
  const { data, error } = await supabase.functions.invoke("admin-users", {
    body: { action, ...payload },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}

export default function AdminUsers() {
  const qc = useQueryClient();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [myRole, setMyRole] = useState<AppRole | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [pwdUser, setPwdUser] = useState<AdminUser | null>(null);
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null);
  const [resetUser, setResetUser] = useState<AdminUser | null>(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [form, setForm] = useState({ email: "", password: "", role: "admin" as AppRole });
  const [newPassword, setNewPassword] = useState("");

  // Get current user + role
  useQuery({
    queryKey: ["me-role"],
    queryFn: async () => {
      const { data: s } = await supabase.auth.getUser();
      const uid = s.user?.id ?? null;
      setCurrentUserId(uid);
      if (!uid) return null;
      const { data } = await supabase.rpc("get_user_role", { _user_id: uid });
      setMyRole((data as AppRole) ?? null);
      return data;
    },
  });

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const data = await callAdminFn("list");
      return (data?.users as AdminUser[]) ?? [];
    },
    enabled: myRole === "administrator",
  });

  const isAdministrator = myRole === "administrator";

  if (myRole !== null && !isAdministrator) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold font-heading">Kelola Pengguna</h1>
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">
          <p className="font-semibold">Akses Ditolak</p>
          <p className="mt-1">Hanya peran <b>Administrator</b> yang dapat mengakses halaman ini.</p>
        </div>
      </div>
    );
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await callAdminFn("create", form);
      toast.success("Pengguna berhasil dibuat");
      setCreateOpen(false);
      setForm({ email: "", password: "", role: "admin" });
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (err: any) {
      toast.error("Gagal: " + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRoleChange(user: AdminUser, role: AppRole) {
    try {
      await callAdminFn("update_role", { user_id: user.id, role });
      toast.success("Peran diperbarui");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (err: any) {
      toast.error("Gagal: " + err.message);
    }
  }

  async function handlePasswordReset(e: React.FormEvent) {
    e.preventDefault();
    if (!pwdUser) return;
    setSubmitting(true);
    try {
      await callAdminFn("update_password", { user_id: pwdUser.id, password: newPassword });
      toast.success("Password berhasil diubah");
      setPwdUser(null);
      setNewPassword("");
    } catch (err: any) {
      toast.error("Gagal: " + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteUser) return;
    try {
      await callAdminFn("delete", { user_id: deleteUser.id });
      toast.success("Pengguna dihapus");
      setDeleteUser(null);
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (err: any) {
      toast.error("Gagal: " + err.message);
    }
  }

  async function handleSendResetLink() {
    if (!resetUser) return;
    setResetLoading(true);
    try {
      await callAdminFn("send_reset_link", {
        user_id: resetUser.id,
        redirect_to: `${window.location.origin}/reset-password`,
      });
      toast.success(`Tautan reset dikirim ke ${resetUser.email}`);
      setResetUser(null);
    } catch (err: any) {
      toast.error("Gagal: " + err.message);
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold font-heading">Kelola Pengguna</h1>
          <p className="text-sm text-muted-foreground">Atur akun admin dan peran aksesnya.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Tambah Pengguna
        </Button>
      </div>

      <div className="rounded-lg border bg-card overflow-x-auto">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground"><Loader2 className="inline h-4 w-4 animate-spin mr-2" />Memuat...</div>
        ) : error ? (
          <div className="p-6 text-sm text-destructive">Gagal memuat: {(error as Error).message}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Peran</TableHead>
                <TableHead>Login Terakhir</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">
                    {u.email}
                    {u.id === currentUserId && <Badge variant="secondary" className="ml-2">Anda</Badge>}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={u.role ?? ""}
                      onValueChange={(v) => handleRoleChange(u, v as AppRole)}
                      disabled={u.id === currentUserId}
                    >
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="— belum ada —" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="administrator">
                          <span className="flex items-center gap-2"><Shield className="h-3.5 w-3.5" /> Administrator</span>
                        </SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString("id-ID") : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setResetUser(u)} title="Kirim Tautan Reset Password">
                        <MailCheck className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setPwdUser(u)} title="Ubah Password">
                        <KeyRound className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteUser(u)}
                        disabled={u.id === currentUserId}
                        title="Hapus"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    Belum ada pengguna.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Pengguna Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <div>
              <Label>Peran</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as AppRole })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="administrator">Administrator (akses penuh)</SelectItem>
                  <SelectItem value="admin">Admin (CMS biasa)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Batal</Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Password dialog */}
      <Dialog open={!!pwdUser} onOpenChange={(o) => !o && setPwdUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ubah Password — {pwdUser?.email}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-400">
              ⚠️ Mengubah password langsung melewati verifikasi email. Untuk keamanan, lebih disarankan menggunakan tombol <b>Kirim Tautan Reset</b> agar pengguna mengatur sendiri password barunya.
            </div>
            <div>
              <Label htmlFor="np">Password Baru</Label>
              <Input id="np" type="password" minLength={8} required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              <p className="text-xs text-muted-foreground mt-1">Minimal 8 karakter.</p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPwdUser(null)}>Batal</Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Send reset link dialog */}
      <AlertDialog open={!!resetUser} onOpenChange={(o) => !o && setResetUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kirim tautan reset password?</AlertDialogTitle>
            <AlertDialogDescription>
              Tautan reset password akan dikirim ke <b>{resetUser?.email}</b>.
              Tautan berlaku terbatas dan hanya bisa digunakan sekali. Pengguna akan
              membuka halaman aman untuk mengatur password baru sendiri.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={resetLoading}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); handleSendResetLink(); }} disabled={resetLoading}>
              {resetLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Kirim Tautan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete dialog */}
      <AlertDialog open={!!deleteUser} onOpenChange={(o) => !o && setDeleteUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus pengguna ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Akun <b>{deleteUser?.email}</b> akan dihapus permanen dan tidak bisa login lagi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}