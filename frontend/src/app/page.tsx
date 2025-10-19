"use client";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BarChart3,
  Check,
  Globe,
  Layers,
  Palette,
  Shield,
  Users,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function Home() {
  const { data: session } = useSession();

  // Authenticated users go to dashboard
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-block bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 text-sm font-medium text-blue-300">
                  ✨ Tekstil Üretim Platformu
                </div>
                <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                  Üretimi Basitleştirin,
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                    {" "}
                    Verimliliği Artırın
                  </span>
                </h1>
                <p className="text-xl text-slate-300 leading-relaxed max-w-lg">
                  Koleksiyondan üretim izlemesine kadar tüm süreçleri yönetin.
                  Üreticiler ve müşteriler için entegre bir platform.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/auth/signup">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Ücretsiz Başlayın
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-slate-600 text-white hover:bg-slate-700/50"
                  >
                    Giriş Yap
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-700">
                <div>
                  <div className="text-3xl font-bold text-white">100+</div>
                  <p className="text-sm text-slate-400">Aktif Firma</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">5000+</div>
                  <p className="text-sm text-slate-400">Günlük Siparişler</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">99%</div>
                  <p className="text-sm text-slate-400">Doğruluk Oranı</p>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative h-96 hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-3xl"></div>
              <div className="relative bg-slate-800/50 border border-slate-700 rounded-2xl p-8 backdrop-blur-sm h-full flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                    <Palette className="w-5 h-5 text-cyan-400" />
                    <span className="text-sm text-slate-300">
                      Koleksiyon Yönetimi
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                    <Layers className="w-5 h-5 text-blue-400" />
                    <span className="text-sm text-slate-300">
                      Üretim İzleme
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                    <span className="text-sm text-slate-300">
                      Analitik & Raporlar
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Güçlü Özellikler
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Tekstil üretim süreçlerini optimize etmek için tasarlanmış tüm
              araçlar
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Palette,
                title: "Koleksiyon Yönetimi",
                description:
                  "Sezonlar, kategoriler ve ürünleri düzenleyin. Tasarımları organize edin.",
              },
              {
                icon: Layers,
                title: "Üretim İzleme",
                description:
                  "Gerçek zamanlı üretim durum takibi. Her aşamayı monitör edin.",
              },
              {
                icon: BarChart3,
                title: "Analitik Paneli",
                description:
                  "Detaylı istatistikler ve raporlar. Verimliliği ölçün.",
              },
              {
                icon: Users,
                title: "İşbirliği Araçları",
                description: "Takım üyeleri ve müşterilerle kolay iletişim.",
              },
              {
                icon: Globe,
                title: "B2B Pazaryeri",
                description:
                  "Üreticiler ve alıcıları bağlayan dijital pazaryeri.",
              },
              {
                icon: Shield,
                title: "Güvenli Platform",
                description: "Kurumsal seviyede güvenlik ve veri koruması.",
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-xl bg-slate-700/50 border border-slate-600 hover:border-slate-500 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-300">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Kim İçin?</h2>
            <p className="text-xl text-slate-400">
              Farklı roller için özelleştirilmiş çözümler
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Üreticiler",
                items: [
                  "Üretim planlama ve izleme",
                  "Kalite kontrol yönetimi",
                  "Verimlilik raporları",
                  "Workshop yönetimi",
                ],
                color: "from-blue-500/10 to-blue-600/10",
                border: "border-blue-500/20",
              },
              {
                title: "Alıcı Firmalar",
                items: [
                  "Sipariş ve örnek yönetimi",
                  "Üretim durumu takibi",
                  "Tasarım yönetimi",
                  "Toplu sipariş işleme",
                ],
                color: "from-purple-500/10 to-purple-600/10",
                border: "border-purple-500/20",
              },
              {
                title: "Platform Yöneticileri",
                items: [
                  "Kullanıcı ve firma yönetimi",
                  "Platform analitikleri",
                  "Sistem ayarları",
                  "Raporlama araçları",
                ],
                color: "from-cyan-500/10 to-cyan-600/10",
                border: "border-cyan-500/20",
              },
            ].map((useCase, idx) => (
              <div
                key={idx}
                className={`p-8 rounded-xl bg-gradient-to-br ${useCase.color} border ${useCase.border}`}
              >
                <h3 className="text-2xl font-bold text-white mb-6">
                  {useCase.title}
                </h3>
                <ul className="space-y-3">
                  {useCase.items.map((item, itemIdx) => (
                    <li
                      key={itemIdx}
                      className="flex items-center gap-3 text-slate-300"
                    >
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-cyan-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Hemen Başlayın</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Tekstil üretim süreçlerinizi dijitalleştirin ve verimliliğinizi
            artırın
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50"
              >
                Ücretsiz Hesap Oluştur
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="mailto:info@textilepro.com">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-white text-white hover:bg-white/10"
              >
                Daha Fazla Bilgi
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto text-center text-slate-400">
          <p>&copy; 2025 Tekstil Üretim Platformu. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
}
