"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { showToast } from "@/lib/toast";
import { Star } from "lucide-react";
import { useState } from "react";

interface Review {
  id: number;
  rating: number;
  comment?: string | null;
  isApproved: boolean;
  customer: {
    firstName?: string | null;
    lastName?: string | null;
  };
  createdAt: string;
}

interface ReviewSectionProps {
  collectionId: number;
  reviews: Review[];
  averageRating: number;
  canReview: boolean;
  onReview?: () => void;
}

export function ReviewSection({
  collectionId,
  reviews,
  averageRating,
  canReview,
  onReview,
}: ReviewSectionProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleSubmitReview = () => {
    if (rating < 1 || rating > 5) {
      showToast("1-5 arası puan verin", "error");
      return;
    }
    // TODO: Call mutation
    showToast("Değerlendirmeniz gönderildi!", "success");
    setShowForm(false);
    setComment("");
    setRating(5);
    onReview?.();
  };

  const renderStars = (rating: number, interactive: boolean = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && setRating(star)}
            disabled={!interactive}
            className={interactive ? "cursor-pointer" : ""}
          >
            <Star
              className={`h-5 w-5 ${
                star <= rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400" />
            Değerlendirmeler
          </CardTitle>
          {averageRating > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                {averageRating.toFixed(1)}
              </span>
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-muted-foreground">
                ({reviews.length} değerlendirme)
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Review Form */}
        {canReview &&
          (showForm ? (
            <div className="space-y-3 p-4 bg-muted rounded-lg">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Puanınız
                </label>
                {renderStars(rating, true)}
              </div>
              <Textarea
                placeholder="Yorumunuz (opsiyonel)..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2">
                <Button onClick={handleSubmitReview}>Gönder</Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  İptal
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setShowForm(true)}>
              <Star className="mr-2 h-4 w-4" />
              Değerlendirme Yap
            </Button>
          ))}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Henüz değerlendirme yok
          </p>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="font-medium">
                      {review.customer.firstName} {review.customer.lastName}
                    </div>
                    {renderStars(review.rating)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString("tr-TR")}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-muted-foreground">
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
