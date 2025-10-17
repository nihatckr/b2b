import axios from "axios";
import fs from "fs";

const OLLAMA_API_URL = process.env.OLLAMA_API_URL || "http://localhost:11434";
const VISION_MODEL = process.env.OLLAMA_VISION_MODEL || "llama3.2-vision"; // or "llava"

interface ProductAnalysisResult {
  productType: string;
  category: string;
  colors: string[];
  material: string;
  pattern: string;
  style: string;
  neckline?: string;
  sleeves?: string;
  fit?: string;
  details: string[];
  suggestedModels: Array<{
    variant: string;
    prompt: string;
  }>;
  designPrompt: string;
  rawResponse?: string;
}

/**
 * Analyze product image using Ollama Vision API
 * Supports llama3.2-vision, llava, or other vision models
 */
export async function analyzeProductWithOllama(
  imagePath: string,
  userNotes?: string
): Promise<ProductAnalysisResult> {
  try {
    // Read image and convert to base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString("base64");

    // Construct detailed prompt for product analysis
    const prompt = `Sen bir tekstil ve moda uzmanısın. Aşağıdaki ürün fotoğrafını detaylı bir şekilde analiz et ve şu bilgileri JSON formatında ver:

1. Ürün Tipi (T-Shirt, Pantolon, Etek, Ceket, vb.)
2. Kategori (Üst Giyim, Alt Giyim, vb.)
3. Renkler (görünen tüm renkler, liste halinde)
4. Malzeme (Pamuklu, Polyester, vb. - tahmin et)
5. Desen (Düz, Çizgili, Baskılı, vb.)
6. Stil (Casual, Formal, Sportif, vb.)
7. Yaka Tipi (varsa: Bisiklet Yaka, Polo Yaka, V Yaka, vb.)
8. Kol Tipi (varsa: Kısa Kollu, Uzun Kollu, Kolsuz, vb.)
9. Kalıp (Regular Fit, Slim Fit, Oversize, vb.)
10. Görsel Detaylar (en az 4 madde: baskı, cep, dikiş, logo, vb. detayları)

${userNotes ? `\nMüşteri Notu: ${userNotes}` : ""}

SADECE JSON formatında yanıt ver, başka açıklama ekleme:
{
  "productType": "...",
  "category": "...",
  "colors": ["...", "..."],
  "material": "...",
  "pattern": "...",
  "style": "...",
  "neckline": "...",
  "sleeves": "...",
  "fit": "...",
  "details": ["...", "...", "...", "..."]
}`;

    console.log("🤖 Ollama Vision analyzing product...");
    console.log("Model:", VISION_MODEL);
    console.log("API URL:", OLLAMA_API_URL);

    // Call Ollama API with vision model
    const response = await axios.post(
      `${OLLAMA_API_URL}/api/generate`,
      {
        model: VISION_MODEL,
        prompt: prompt,
        images: [base64Image],
        stream: false,
        options: {
          temperature: 0.3, // Lower temperature for more consistent JSON
          num_predict: 1000,
        },
      },
      {
        timeout: 60000, // 60 second timeout
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const rawResponse = response.data.response;
    console.log("📝 Ollama Raw Response:", rawResponse);

    // Parse JSON from response
    let analysisData: any;
    try {
      // Try to extract JSON from response (sometimes Ollama wraps it in markdown)
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0]);
      } else {
        analysisData = JSON.parse(rawResponse);
      }
    } catch (parseError) {
      console.error("❌ Failed to parse Ollama JSON response:", parseError);
      console.log("Raw response:", rawResponse);

      // Fallback: return structured dummy data with raw response
      return createFallbackResponse(rawResponse, userNotes);
    }

    // Generate suggested model variants and prompts
    const suggestedModels = [
      {
        variant: "Erkek",
        prompt: `Create a professional male model wearing ${analysisData.productType}, ${analysisData.fit}, ${analysisData.colors.join(" and ")} colors, ${analysisData.pattern} pattern`,
      },
      {
        variant: "Kadın",
        prompt: `Create a professional female model wearing ${analysisData.productType}, ${analysisData.fit}, ${analysisData.colors.join(" and ")} colors, ${analysisData.pattern} pattern`,
      },
      {
        variant: "Çocuk",
        prompt: `Create a professional kids model wearing ${analysisData.productType}, ${analysisData.fit}, ${analysisData.colors.join(" and ")} colors, ${analysisData.pattern} pattern`,
      },
    ];

    const designPrompt = `Generate high-resolution product mockup: ${analysisData.productType}, ${analysisData.style} style, ${analysisData.colors.join(", ")} colors, ${analysisData.pattern} pattern. ${userNotes || ""}`;

    const result: ProductAnalysisResult = {
      ...analysisData,
      suggestedModels,
      designPrompt,
      rawResponse,
    };

    console.log("✅ Ollama analysis completed successfully");
    return result;
  } catch (error: any) {
    console.error("❌ Ollama Vision API Error:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }

    // Check if Ollama is running
    if (error.code === "ECONNREFUSED") {
      throw new Error(
        "Ollama sunucusuna bağlanılamadı. Ollama'nın çalıştığından emin olun (http://localhost:11434)"
      );
    }

    throw new Error(`Ollama analiz hatası: ${error.message}`);
  }
}

/**
 * Fallback response when JSON parsing fails
 */
function createFallbackResponse(
  rawResponse: string,
  userNotes?: string
): ProductAnalysisResult {
  // Try to extract some basic info from text response
  const productType = extractProductType(rawResponse);
  const colors = extractColors(rawResponse);

  return {
    productType: productType || "Ürün",
    category: "Giyim",
    colors: colors.length > 0 ? colors : ["Bilinmiyor"],
    material: "Analiz edilemedi",
    pattern: "Analiz edilemedi",
    style: "Casual",
    fit: "Regular Fit",
    details: [
      "Otomatik analiz tamamlanamadı",
      "Manuel inceleme gerekiyor",
      rawResponse.substring(0, 100),
    ],
    suggestedModels: [
      {
        variant: "Erkek",
        prompt: `Male model wearing detected product, ${userNotes || "standard fit"}`,
      },
      {
        variant: "Kadın",
        prompt: `Female model wearing detected product, ${userNotes || "standard fit"}`,
      },
      {
        variant: "Çocuk",
        prompt: `Kids model wearing detected product, ${userNotes || "standard fit"}`,
      },
    ],
    designPrompt: `Product mockup: ${userNotes || "use detected attributes"}`,
    rawResponse,
  };
}

/**
 * Extract product type from text response
 */
function extractProductType(text: string): string | null {
  const types = [
    "t-shirt",
    "tişört",
    "pantolon",
    "jean",
    "etek",
    "ceket",
    "mont",
    "kazak",
    "sweatshirt",
    "gömlek",
    "elbise",
    "şort",
  ];

  const lowerText = text.toLowerCase();
  for (const type of types) {
    if (lowerText.includes(type)) {
      return type.charAt(0).toUpperCase() + type.slice(1);
    }
  }
  return null;
}

/**
 * Extract colors from text response
 */
function extractColors(text: string): string[] {
  const colors = [
    "beyaz",
    "siyah",
    "mavi",
    "kırmızı",
    "yeşil",
    "sarı",
    "turuncu",
    "mor",
    "pembe",
    "gri",
    "kahverengi",
    "lacivert",
  ];

  const foundColors: string[] = [];
  const lowerText = text.toLowerCase();

  for (const color of colors) {
    if (lowerText.includes(color)) {
      foundColors.push(color.charAt(0).toUpperCase() + color.slice(1));
    }
  }

  return foundColors;
}

/**
 * Check if Ollama is running and vision model is available
 */
export async function checkOllamaStatus(): Promise<{
  running: boolean;
  modelAvailable: boolean;
  availableModels: string[];
}> {
  try {
    // Check if Ollama is running
    const response = await axios.get(`${OLLAMA_API_URL}/api/tags`, {
      timeout: 5000,
    });

    const models = response.data.models || [];
    const availableModels = models.map((m: any) => m.name);
    const modelAvailable = availableModels.some((name: string) =>
      name.includes("vision") || name.includes("llava")
    );

    return {
      running: true,
      modelAvailable,
      availableModels,
    };
  } catch (error) {
    return {
      running: false,
      modelAvailable: false,
      availableModels: [],
    };
  }
}
