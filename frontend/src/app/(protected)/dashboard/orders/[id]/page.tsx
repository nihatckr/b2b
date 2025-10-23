import { OrderDetailClient } from "@/components/collections/OrderDetailClient";

import { notFound } from "next/navigation";

interface OrderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Helper function to decode Global ID or parse numeric ID
function decodeGlobalId(id: string): number | null {
  try {
    // First, URL decode the ID (in case it's encoded like T3JkZXI6MTO%3D)
    const decodedUrl = decodeURIComponent(id);

    // Check if it's a base64 encoded Global ID (contains letters and =)
    if (/[A-Za-z]/.test(decodedUrl) || decodedUrl.includes("=")) {
      const decoded = atob(decodedUrl);
      const [, numericId] = decoded.split(":");
      return parseInt(numericId);
    }
    // Otherwise it's already a numeric ID
    return parseInt(decodedUrl);
  } catch (error) {
    console.error("Decode error:", error);
    return null;
  }
}

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { id } = await params;
  // Decode Global ID or parse numeric ID
  const orderId = decodeGlobalId(id);

  if (!orderId || isNaN(orderId)) {
    notFound();
  }

  return <OrderDetailClient orderId={orderId} />;
}
