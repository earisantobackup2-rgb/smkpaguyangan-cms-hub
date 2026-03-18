import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { MapPin, Phone, Mail, Send, RefreshCw } from "lucide-react";
import { getSchoolInfo } from "@/lib/supabase-helpers";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState, useCallback, useEffect } from "react";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi").max(100),
  email: z.string().trim().email("Email tidak valid").max(255),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(1, "Pesan wajib diisi").max(2000),
});

function generateCaptcha() {
  const a = Math.floor(Math.random() * 20) + 1;
  const b = Math.floor(Math.random() * 20) + 1;
  return { question: `${a} + ${b} = ?`, answer: a + b };
}

export default function KontakPage() {
  const { data: info = {} } = useQuery({ queryKey: ["schoolInfo"], queryFn: getSchoolInfo });

  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [captcha, setCaptcha] = useState(generateCaptcha);
  const [captchaInput, setCaptchaInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  const refreshCaptcha = useCallback(() => {
    setCaptcha(generateCaptcha());
    setCaptchaInput("");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate captcha
    if (parseInt(captchaInput) !== captcha.answer) {
      setErrors({ captcha: "Jawaban captcha salah" });
      refreshCaptcha();
      return;
    }

    // Validate form
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSending(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: result.data.name,
      email: result.data.email,
      subject: result.data.subject || null,
      message: result.data.message,
    });
    setSending(false);

    if (error) {
      toast.error("Gagal mengirim pesan. Silakan coba lagi.");
      return;
    }

    toast.success("Pesan berhasil dikirim! Terima kasih.");
    setForm({ name: "", email: "", subject: "", message: "" });
    refreshCaptcha();
  };

  const items = [
    { icon: MapPin, label: "Alamat", value: info.address || "-" },
    { icon: Phone, label: "Telepon", value: info.phone || "-" },
    { icon: Mail, label: "Email", value: info.email || "-" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-8">Kontak</h1>

        <div className="grid gap-6 sm:grid-cols-3 max-w-3xl mb-12">
          {items.map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-xl bg-card shadow-card p-6 text-center">
              <Icon className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-sm mb-1">{label}</h3>
              <p className="text-sm text-muted-foreground">{value}</p>
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <div className="rounded-xl bg-card shadow-card p-6 max-w-2xl">
          <h2 className="text-xl font-bold mb-6">Kirim Pesan</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Nama <span className="text-destructive">*</span></Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nama lengkap"
                />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
              </div>
              <div>
                <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@contoh.com"
                />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="subject">Subjek</Label>
              <Input
                id="subject"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Topik pesan"
              />
            </div>

            <div>
              <Label htmlFor="message">Pesan <span className="text-destructive">*</span></Label>
              <Textarea
                id="message"
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Tulis pesan Anda di sini..."
              />
              {errors.message && <p className="text-xs text-destructive mt-1">{errors.message}</p>}
            </div>

            {/* Math Captcha */}
            <div className="rounded-lg border bg-muted/50 p-4">
              <Label className="mb-2 block">Verifikasi: Berapa hasil dari <span className="font-bold text-primary">{captcha.question}</span></Label>
              <div className="flex items-center gap-2">
                <Input
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  placeholder="Jawaban"
                  className="w-32"
                  type="number"
                />
                <Button type="button" variant="ghost" size="icon" onClick={refreshCaptcha} title="Ganti soal">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              {errors.captcha && <p className="text-xs text-destructive mt-1">{errors.captcha}</p>}
            </div>

            <Button type="submit" disabled={sending} className="w-full sm:w-auto">
              {sending ? "Mengirim..." : (
                <><Send className="h-4 w-4 mr-2" /> Kirim Pesan</>
              )}
            </Button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
