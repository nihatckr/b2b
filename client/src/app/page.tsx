"use client";

import { Button } from "@/components/ui/button";
import { PUBLIC_PLATFORM_STATS_QUERY } from "@/lib/graphql/queries";
import {
  Activity,
  ArrowRight,
  Award,
  BarChart3,
  Check,
  Clock,
  Droplet,
  Factory,
  Globe,
  Leaf,
  MessageSquare,
  Package,
  ShoppingCart,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Zap
} from "lucide-react";
import Link from "next/link";
import { useQuery } from "urql";

export default function Home() {
  const [{ data, fetching, error }] = useQuery({
    query: PUBLIC_PLATFORM_STATS_QUERY,
  });

  const stats = data?.publicPlatformStats;

  // Debug logging
  console.log("🔍 Landing Page Debug:", {
    fetching,
    hasData: !!data,
    hasStats: !!stats,
    error: error?.message,
    platformFeatures: stats?.platformFeatures?.length || 0,
    testimonials: stats?.testimonials?.length || 0,
    hasGrowthMetrics: !!stats?.growthMetrics,
    hasRecentActivity: !!stats?.recentActivity,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-blue-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ProtexFlow
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Giriş Yap</Button>
            </Link>
            <Link href="/signup">
              <Button>Ücretsiz Başla</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
            <Sparkles className="inline h-4 w-4 mr-2" />
            Yeni Nesil Tekstil Platformu
          </div>
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
            Moda Üretimini
            <br />
            Dijitalleştiriyoruz
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Üreticiler ve alıcıları buluşturan, sürdürülebilir ve şeffaf tedarik
            zinciri yönetimi için yapay zeka destekli akıllı ekosistem.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8">
                Platforma Katıl
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8">
              Demo İzle
            </Button>
          </div>

          {/* Quick Stats Banner */}
          {!fetching && stats && (
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <Package className="h-8 w-8 text-blue-600 mb-2 mx-auto" />
                <div className="text-3xl font-bold text-gray-900">{stats.totalProducts}</div>
                <div className="text-sm text-gray-500">Ürün Modeli</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <Factory className="h-8 w-8 text-green-600 mb-2 mx-auto" />
                <div className="text-3xl font-bold text-gray-900">{stats.activeManufacturers}</div>
                <div className="text-sm text-gray-500">Aktif Üretici</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <ShoppingCart className="h-8 w-8 text-purple-600 mb-2 mx-auto" />
                <div className="text-3xl font-bold text-gray-900">{stats.totalOrders}</div>
                <div className="text-sm text-gray-500">Sipariş</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <Users className="h-8 w-8 text-orange-600 mb-2 mx-auto" />
                <div className="text-3xl font-bold text-gray-900">{stats.activeWorkshops}</div>
                <div className="text-sm text-gray-500">Atölye</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Ecosystem Overview */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Ekosistem Özeti</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Global tedarik zincirinde şeffaflık, hız ve sürdürülebilirlik için
            entegre çözümler sunuyoruz.
          </p>

          {!fetching && stats && (
            <div className="grid md:grid-cols-3 gap-8">
              {/* Collections by Gender */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                  Koleksiyon Dağılımı
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Erkek Giyim</span>
                    <span className="font-bold text-blue-600">
                      {stats.collectionsByGender.men} model
                    </span>
                  </div>
                  <div className="w-full bg-white rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${
                          (stats.collectionsByGender.men /
                            stats.totalCollections) *
                          100
                        }%`,
                      }}
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Kadın Giyim</span>
                    <span className="font-bold text-pink-600">
                      {stats.collectionsByGender.women} model
                    </span>
                  </div>
                  <div className="w-full bg-white rounded-full h-2">
                    <div
                      className="bg-pink-600 h-2 rounded-full"
                      style={{
                        width: `${
                          (stats.collectionsByGender.women /
                            stats.totalCollections) *
                          100
                        }%`,
                      }}
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Unisex</span>
                    <span className="font-bold text-purple-600">
                      {stats.collectionsByGender.unisex} model
                    </span>
                  </div>
                  <div className="w-full bg-white rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{
                        width: `${
                          (stats.collectionsByGender.unisex /
                            stats.totalCollections) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Collections by Category */}
              <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-8 border border-green-200">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Package className="h-6 w-6 text-green-600" />
                  Kategori Dağılımı
                </h3>
                <div className="space-y-3">
                  {stats.collectionsByCategory.map((cat: any) => (
                    <div key={cat.category} className="bg-white rounded-lg p-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-gray-800">
                          {cat.category}
                        </span>
                        <span className="text-green-600 font-bold">
                          {cat.count}
                        </span>
                      </div>
                      <div className="flex gap-2 text-xs text-gray-500">
                        <span>E: {cat.men}</span>
                        <span>K: {cat.women}</span>
                        <span>U: {cat.unisex}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Features */}
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8 border border-orange-200">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-orange-600" />
                  Akıllı Özellikler
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-orange-600 mt-1" />
                    <div>
                      <div className="font-semibold text-gray-800">
                        AI Görsel Analiz
                      </div>
                      <div className="text-sm text-gray-600">
                        Otomatik ürün tanıma
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-orange-600 mt-1" />
                    <div>
                      <div className="font-semibold text-gray-800">
                        Üretim Takibi
                      </div>
                      <div className="text-sm text-gray-600">
                        7 aşamalı tracking
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-orange-600 mt-1" />
                    <div>
                      <div className="font-semibold text-gray-800">
                        Kalite Kontrol
                      </div>
                      <div className="text-sm text-gray-600">
                        Otomatik raporlama
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-orange-600 mt-1" />
                    <div>
                      <div className="font-semibold text-gray-800">
                        Gerçek Zamanlı Mesajlaşma
                      </div>
                      <div className="text-sm text-gray-600">
                        Anlık iletişim
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Sustainability Metrics */}
      {!fetching && stats && (
        <section className="py-20 px-6 bg-gradient-to-br from-green-50 to-teal-50">
          <div className="container mx-auto">
            <h2 className="text-4xl font-bold text-center mb-4 flex items-center justify-center gap-3">
              <Leaf className="h-10 w-10 text-green-600" />
              Sürdürülebilirlik Verileri
            </h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Çevreye duyarlı üretim süreçleri ile geleceği inşa ediyoruz.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <Leaf className="h-12 w-12 text-green-600 mb-4" />
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {stats.sustainability.carbonFootprintReduction}%
                </div>
                <div className="text-gray-700 font-semibold">
                  Karbon Ayak İzi Azaltımı
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  2024 yılı baz alınarak
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <Globe className="h-12 w-12 text-blue-600 mb-4" />
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {stats.sustainability.recycledMaterialUsage}%
                </div>
                <div className="text-gray-700 font-semibold">
                  Geri Dönüştürülmüş Kumaş
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  Toplam üretimde
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <Droplet className="h-12 w-12 text-cyan-600 mb-4" />
                <div className="text-4xl font-bold text-cyan-600 mb-2">
                  {(stats.sustainability.waterSavedLiters / 1000).toFixed(0)}K
                </div>
                <div className="text-gray-700 font-semibold">
                  Su Tasarrufu (Litre)
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  Akıllı üretim teknikleri ile
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <Award className="h-12 w-12 text-purple-600 mb-4" />
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  {stats.sustainability.gotsChronumCertified}
                </div>
                <div className="text-gray-700 font-semibold">
                  Sertifikalı Ürün
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  GOTS, OEKO-TEX, GRS
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Platform Features */}
      {!fetching && stats && stats.platformFeatures && (
        <section className="py-20 px-6 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="container mx-auto">
            <h2 className="text-4xl font-bold text-center mb-4">
              Güçlü Özellikler, Kolay Kullanım
            </h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Tekstil üretim süreçlerinizi dijitalleştiren, kolaylaştıran ve hızlandıran özellikleri keşfedin
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {stats.platformFeatures.map((feature: any, index: number) => {
                const IconComponent =
                  feature.icon === "Sparkles" ? Sparkles :
                  feature.icon === "TrendingUp" ? TrendingUp :
                  feature.icon === "Award" ? Award :
                  feature.icon === "MessageSquare" ? MessageSquare :
                  feature.icon === "Factory" ? Factory :
                  feature.icon === "Leaf" ? Leaf : Sparkles;

                return (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:-translate-y-1"
                  >
                    <div className="bg-gradient-to-br from-blue-100 to-purple-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                      <IconComponent className="h-7 w-7 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Growth Metrics */}
      {!fetching && stats && stats.growthMetrics && (
        <section className="py-20 px-6 bg-white">
          <div className="container mx-auto">
            <h2 className="text-4xl font-bold text-center mb-4 flex items-center justify-center gap-3">
              <BarChart3 className="h-10 w-10 text-blue-600" />
              Platform Başarı Metrikleri
            </h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Rakamlarla ProtexFlow'un büyüyen ekosistemi
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {stats.growthMetrics.monthlyGrowthRate >= 0 ? '+' : ''}{stats.growthMetrics.monthlyGrowthRate}%
                </div>
                <div className="text-sm text-gray-600 font-medium flex items-center justify-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Aylık Büyüme
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200 text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {stats.growthMetrics.totalTransactionVolume}
                </div>
                <div className="text-sm text-gray-600 font-medium flex items-center justify-center gap-2">
                  <Package className="h-4 w-4" />
                  Tamamlanan İşlem
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200 text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  {stats.growthMetrics.avgDeliveryDays}
                </div>
                <div className="text-sm text-gray-600 font-medium flex items-center justify-center gap-2">
                  <Clock className="h-4 w-4" />
                  Ortalama Teslimat (gün)
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-200 text-center">
                <div className="text-4xl font-bold text-orange-600 mb-2">
                  %{stats.growthMetrics.customerSatisfactionRate}
                </div>
                <div className="text-sm text-gray-600 font-medium flex items-center justify-center gap-2">
                  <Star className="h-4 w-4" />
                  Müşteri Memnuniyeti
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Recent Activity Feed */}
      {!fetching && stats && stats.recentActivity && (
        <section className="py-20 px-6 bg-gradient-to-br from-slate-50 to-gray-50">
          <div className="container mx-auto">
            <h2 className="text-4xl font-bold text-center mb-4 flex items-center justify-center gap-3">
              <Activity className="h-10 w-10 text-blue-600" />
              Canlı Platform Aktivitesi
            </h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Platformda gerçek zamanlı neler oluyor?
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 text-center">
                <Zap className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-800 mb-1">
                  {stats.recentActivity.activeProductionsNow}
                </div>
                <div className="text-sm text-gray-600">Aktif Üretim</div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 text-center">
                <Package className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-800 mb-1">
                  {stats.recentActivity.newCollectionsThisWeek}
                </div>
                <div className="text-sm text-gray-600">Yeni Koleksiyon (Bu Hafta)</div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 text-center">
                <Check className="h-8 w-8 text-green-500 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-800 mb-1">
                  {stats.recentActivity.completedOrdersThisMonth}
                </div>
                <div className="text-sm text-gray-600">Tamamlanan Sipariş (Bu Ay)</div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 text-center">
                <Factory className="h-8 w-8 text-purple-500 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-800 mb-1">
                  {stats.recentActivity.newManufacturersThisMonth}
                </div>
                <div className="text-sm text-gray-600">Yeni Üretici (Bu Ay)</div>
              </div>
            </div>

            {/* Latest Collections */}
            {stats.recentActivity.latestCollections && stats.recentActivity.latestCollections.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold text-center mb-6">Son Eklenen Koleksiyonlar</h3>
                <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {stats.recentActivity.latestCollections.map((collection: any, index: number) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="font-semibold text-gray-800 mb-2 truncate">
                        {collection.name}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {collection.gender}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Customer Testimonials */}
      {!fetching && stats && stats.testimonials && stats.testimonials.length > 0 && (
        <section className="py-20 px-6 bg-white">
          <div className="container mx-auto">
            <h2 className="text-4xl font-bold text-center mb-4 flex items-center justify-center gap-3">
              <MessageSquare className="h-10 w-10 text-blue-600" />
              Müşterilerimiz Ne Diyor?
            </h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Binlerce mutlu kullanıcıdan geri bildirimler
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {stats.testimonials.map((testimonial: any, index: number) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 shadow-lg border border-blue-100"
                >
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">
                    "{testimonial.comment}"
                  </p>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="font-bold text-gray-800">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Supplier Network Map */}
      {!fetching && stats && (
        <section className="py-20 px-6 bg-white">
          <div className="container mx-auto">
            <h2 className="text-4xl font-bold text-center mb-4 flex items-center justify-center gap-3">
              <Globe className="h-10 w-10 text-blue-600" />
              Global Tedarikçi Ağı
            </h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              {stats.suppliersByCountry.length} ülkede{" "}
              {stats.activeManufacturers} aktif üreticiyle çalışıyoruz.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.suppliersByCountry.map((country: any) => (
                <div
                  key={country.country}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800">
                      {country.country}
                    </h3>
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {country.count} üretici
                    </span>
                  </div>
                  <div className="space-y-2">
                    {country.companies.slice(0, 3).map((company: any) => (
                      <div
                        key={company.name}
                        className="bg-white rounded-lg p-3 text-sm"
                      >
                        <div className="font-semibold text-gray-800">
                          {company.name}
                        </div>
                        {company.city && (
                          <div className="text-gray-500">{company.city}</div>
                        )}
                      </div>
                    ))}
                    {country.companies.length > 3 && (
                      <div className="text-sm text-gray-500 text-center pt-2">
                        +{country.companies.length - 3} daha fazla
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Dijital Dönüşüme Hazır Mısınız?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Üretim süreçlerinizi optimize edin, maliyetleri düşürün ve
            sürdürülebilirliği artırın.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Ücretsiz Dene
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 bg-transparent border-white text-white hover:bg-white hover:text-blue-600"
            >
              İletişime Geç
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gray-900 text-gray-300">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-6 w-6 text-blue-400" />
                <span className="text-xl font-bold text-white">ProtexFlow</span>
              </div>
              <p className="text-sm">
                Tekstil endüstrisinin dijital geleceği için yapay zeka destekli
                akıllı platform.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/features">Özellikler</Link>
                </li>
                <li>
                  <Link href="/pricing">Fiyatlandırma</Link>
                </li>
                <li>
                  <Link href="/docs">Dokümantasyon</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Şirket</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/about">Hakkımızda</Link>
                </li>
                <li>
                  <Link href="/blog">Blog</Link>
                </li>
                <li>
                  <Link href="/contact">İletişim</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Yasal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/privacy">Gizlilik</Link>
                </li>
                <li>
                  <Link href="/terms">Kullanım Koşulları</Link>
                </li>
                <li>
                  <Link href="/security">Güvenlik</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            © 2025 ProtexFlow. Tüm hakları saklıdır.
          </div>
        </div>
      </footer>
    </div>
  );
}
