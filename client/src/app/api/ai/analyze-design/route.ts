import { NextRequest, NextResponse } from "next/server";

// OpenAI veya başka bir AI servisini kullanarak görsel analizi yapabilirsiniz
// Şu an için demo amaçlı basit bir analiz yapıyoruz

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, prompt, description } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Görsel URL'si gereklidir" },
        { status: 400 }
      );
    }

    // TODO: Gerçek AI analizi için OpenAI Vision API veya benzeri bir servis kullanılabilir
    // Şu an için prompt ve description'dan tahmin yapıyoruz

    const analysis = await analyzeDesign(imageUrl, prompt, description);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Design analysis error:", error);
    return NextResponse.json(
      { error: "Tasarım analizi yapılamadı" },
      { status: 500 }
    );
  }
}

async function analyzeDesign(
  imageUrl: string,
  prompt?: string,
  description?: string
): Promise<any> {
  // Prompt ve description'dan anahtar kelimeleri çıkararak analiz yapıyoruz
  const text = `${prompt || ""} ${description || ""}`.toLowerCase();

  const analysis: any = {
    fabricType: "",
    color: "",
    classification: "",
    gender: "",
    size: "",
    pattern: "",
    accessories: "",
    season: "",
  };

  // Kumaş türü analizi
  if (text.includes("pamuk") || text.includes("cotton")) {
    analysis.fabricType = "%100 Pamuk";
  } else if (text.includes("polyester")) {
    analysis.fabricType = "%100 Polyester";
  } else if (text.includes("jean") || text.includes("denim")) {
    analysis.fabricType = "Denim";
  } else if (text.includes("yün") || text.includes("wool")) {
    analysis.fabricType = "Yün";
  } else if (text.includes("ipek") || text.includes("silk")) {
    analysis.fabricType = "İpek";
  }

  // Renk analizi
  if (text.includes("siyah") || text.includes("black")) {
    analysis.color = "Siyah";
  } else if (text.includes("beyaz") || text.includes("white")) {
    analysis.color = "Beyaz";
  } else if (text.includes("mavi") || text.includes("blue")) {
    analysis.color = "Mavi";
  } else if (text.includes("kırmızı") || text.includes("red")) {
    analysis.color = "Kırmızı";
  } else if (text.includes("yeşil") || text.includes("green")) {
    analysis.color = "Yeşil";
  } else if (text.includes("lacivert") || text.includes("navy")) {
    analysis.color = "Lacivert";
  } else if (text.includes("gri") || text.includes("gray") || text.includes("grey")) {
    analysis.color = "Gri";
  }

  // Klasman analizi
  if (text.includes("luxury") || text.includes("lüks") || text.includes("premium")) {
    analysis.classification = "LUXURY";
  } else if (text.includes("fashion") || text.includes("moda")) {
    analysis.classification = "FASHION";
  } else if (text.includes("basic") || text.includes("temel")) {
    analysis.classification = "BASIC";
  } else {
    analysis.classification = "PREMIUM";
  }

  // Cinsiyet analizi
  if (text.includes("erkek") || text.includes("male") || text.includes("men")) {
    analysis.gender = "MALE";
  } else if (text.includes("kadın") || text.includes("female") || text.includes("women")) {
    analysis.gender = "FEMALE";
  } else if (text.includes("çocuk") || text.includes("kid") || text.includes("child")) {
    analysis.gender = "KIDS";
  } else {
    analysis.gender = "UNISEX";
  }

  // Beden analizi
  if (text.includes("xs")) {
    analysis.size = "XS";
  } else if (text.includes("small") || text.includes("küçük")) {
    analysis.size = "S";
  } else if (text.includes("medium") || text.includes("orta")) {
    analysis.size = "M";
  } else if (text.includes("large") || text.includes("büyük")) {
    analysis.size = "L";
  } else if (text.includes("xl")) {
    analysis.size = "XL";
  } else if (text.includes("xxl")) {
    analysis.size = "XXL";
  } else {
    analysis.size = "M";
  }

  // Kalıp analizi
  if (text.includes("slim") || text.includes("dar")) {
    analysis.pattern = "SLIM_FIT";
  } else if (text.includes("regular") || text.includes("normal")) {
    analysis.pattern = "REGULAR_FIT";
  } else if (text.includes("oversize") || text.includes("bol")) {
    analysis.pattern = "OVERSIZE";
  } else if (text.includes("loose")) {
    analysis.pattern = "LOOSE_FIT";
  } else if (text.includes("body")) {
    analysis.pattern = "BODY_FIT";
  } else {
    analysis.pattern = "REGULAR_FIT";
  }

  // Aksesuar analizi
  const accessories = [];
  if (text.includes("fermuar") || text.includes("zipper") || text.includes("zip")) {
    accessories.push("Fermuar");
  }
  if (text.includes("düğme") || text.includes("button")) {
    accessories.push("Düğme");
  }
  if (text.includes("cep") || text.includes("pocket")) {
    accessories.push("Cep");
  }
  if (text.includes("kapüşon") || text.includes("hood")) {
    accessories.push("Kapüşon");
  }
  if (accessories.length > 0) {
    analysis.accessories = accessories.join(", ");
  }

  // Sezon analizi
  const currentYear = new Date().getFullYear();
  if (text.includes("yaz") || text.includes("summer") || text.includes("ilkbahar") || text.includes("spring")) {
    analysis.season = `İlkbahar-Yaz ${currentYear}`;
  } else if (text.includes("kış") || text.includes("winter") || text.includes("sonbahar") || text.includes("fall") || text.includes("autumn")) {
    analysis.season = `Sonbahar-Kış ${currentYear}`;
  } else {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 8) {
      analysis.season = `İlkbahar-Yaz ${currentYear}`;
    } else {
      analysis.season = `Sonbahar-Kış ${currentYear}`;
    }
  }

  // Simüle edilmiş gecikme (gerçek AI analizi için)
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return analysis;
}
