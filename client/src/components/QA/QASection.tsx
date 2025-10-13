"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { showToast } from "@/lib/toast";
import { MessageCircle, Send } from "lucide-react";
import { useState } from "react";

interface Question {
  id: number;
  question: string;
  answer?: string | null;
  isAnswered: boolean;
  customer: {
    firstName?: string | null;
    lastName?: string | null;
    name?: string | null;
  };
}

interface QASectionProps {
  collectionId: number;
  questions: Question[];
  canAsk: boolean;
  canAnswer: boolean;
  onAsk?: () => void;
  onAnswer?: () => void;
}

export function QASection({
  collectionId,
  questions,
  canAsk,
  canAnswer,
  onAsk,
  onAnswer,
}: QASectionProps) {
  const [newQuestion, setNewQuestion] = useState("");
  const [answeringId, setAnsweringId] = useState<number | null>(null);
  const [answerText, setAnswerText] = useState("");

  const handleAskQuestion = () => {
    if (!newQuestion.trim()) {
      showToast("Soru yazın", "error");
      return;
    }
    // TODO: Call mutation
    showToast("Soru gönderildi!", "success");
    setNewQuestion("");
    onAsk?.();
  };

  const handleAnswer = () => {
    if (!answerText.trim()) {
      showToast("Cevap yazın", "error");
      return;
    }
    // TODO: Call mutation
    showToast("Cevap gönderildi!", "success");
    setAnsweringId(null);
    setAnswerText("");
    onAnswer?.();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Soru & Cevap ({questions.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Ask Question Form */}
        {canAsk && (
          <div className="space-y-2 p-4 bg-muted rounded-lg">
            <Textarea
              placeholder="Sorunuzu yazın..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              rows={2}
            />
            <Button size="sm" onClick={handleAskQuestion}>
              <Send className="mr-2 h-4 w-4" />
              Soru Gönder
            </Button>
          </div>
        )}

        {/* Questions List */}
        {questions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Henüz soru yok. İlk soruyu siz sorun!
          </p>
        ) : (
          <div className="space-y-4">
            {questions.map((q) => (
              <div key={q.id} className="border rounded-lg p-4 space-y-2">
                <div className="font-medium">{q.question}</div>
                <div className="text-xs text-muted-foreground">
                  {q.customer.firstName}{" "}
                  {q.customer.lastName || q.customer.name}
                </div>

                {q.isAnswered && q.answer ? (
                  <div className="bg-green-50 p-3 rounded">
                    <div className="font-semibold text-sm text-green-900 mb-1">
                      ✓ Cevap:
                    </div>
                    <div className="text-sm">{q.answer}</div>
                  </div>
                ) : canAnswer ? (
                  answeringId === q.id ? (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Cevabınızı yazın..."
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleAnswer}>
                          Cevapla
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setAnsweringId(null)}
                        >
                          İptal
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setAnsweringId(q.id)}
                    >
                      Cevapla
                    </Button>
                  )
                ) : (
                  <div className="text-sm text-yellow-600">
                    ⏳ Cevap bekleniyor
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
