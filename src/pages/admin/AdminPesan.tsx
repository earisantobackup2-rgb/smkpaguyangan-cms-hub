import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Mail, MailOpen, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Database } from "@/integrations/supabase/types";

type Message = Database["public"]["Tables"]["contact_messages"]["Row"];

export default function AdminPesan() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Message | null>(null);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["admin-contact-messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contact_messages").update({ is_read: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-contact-messages"] }),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contact_messages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-contact-messages"] });
      toast.success("Pesan dihapus");
    },
  });

  const openMessage = (msg: Message) => {
    setSelected(msg);
    if (!msg.is_read) markRead.mutate(msg.id);
  };

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Pesan Masuk</h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} pesan belum dibaca` : "Semua pesan sudah dibaca"}
          </p>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Memuat...</p>
      ) : messages.length === 0 ? (
        <p className="text-muted-foreground">Belum ada pesan masuk.</p>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-left p-3 font-medium">Nama</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">Subject</th>
                <th className="text-left p-3 font-medium hidden lg:table-cell">Tanggal</th>
                <th className="text-right p-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((msg) => (
                <tr
                  key={msg.id}
                  className={`border-t hover:bg-muted/30 transition-colors ${!msg.is_read ? "bg-primary/5" : ""}`}
                >
                  <td className="p-3">
                    {msg.is_read ? (
                      <MailOpen className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Badge variant="default" className="text-xs px-1.5 py-0.5">Baru</Badge>
                    )}
                  </td>
                  <td className="p-3">
                    <p className={`${!msg.is_read ? "font-semibold" : ""}`}>{msg.name}</p>
                    <p className="text-xs text-muted-foreground">{msg.email}</p>
                  </td>
                  <td className="p-3 hidden md:table-cell text-muted-foreground">
                    {msg.subject || "-"}
                  </td>
                  <td className="p-3 hidden lg:table-cell text-muted-foreground">
                    {new Date(msg.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="p-3 text-right space-x-1">
                    <button
                      onClick={() => openMessage(msg)}
                      className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      <Eye className="h-3 w-3" /> Lihat
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Hapus pesan ini?")) deleteMut.mutate(msg.id);
                      }}
                      className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected?.subject || "Tanpa Subjek"}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Dari</p>
                  <p className="font-medium">{selected.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <a href={`mailto:${selected.email}`} className="font-medium text-primary hover:underline">
                    {selected.email}
                  </a>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Tanggal</p>
                  <p className="font-medium">
                    {new Date(selected.created_at).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <div className="rounded-lg bg-muted/50 p-4 text-sm whitespace-pre-wrap">
                {selected.message}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
