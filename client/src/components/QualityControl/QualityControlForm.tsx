"use client";

import { AlertCircle, Camera, CheckCircle2, XCircle } from "lucide-react";
import React, { useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Progress } from "../ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";

interface QualityControlFormProps {
  productionTrackingId: number;
  onSubmit: (data: QualityControlData) => void;
  onCancel: () => void;
}

interface QualityControlData {
  checkDate: string;
  result: string;
  score: number;
  notes: string;
  photos: string[];
  fabricDefects: number;
  sewingDefects: number;
  measureDefects: number;
  finishingDefects: number;
}

export function QualityControlForm({
  productionTrackingId,
  onSubmit,
  onCancel,
}: QualityControlFormProps) {
  const [formData, setFormData] = useState<QualityControlData>({
    checkDate: new Date().toISOString().split("T")[0],
    result: "PENDING",
    score: 0,
    notes: "",
    photos: [],
    fabricDefects: 0,
    sewingDefects: 0,
    measureDefects: 0,
    finishingDefects: 0,
  });

  // Auto-calculate score based on defects
  React.useEffect(() => {
    const totalDefects =
      formData.fabricDefects +
      formData.sewingDefects +
      formData.measureDefects +
      formData.finishingDefects;

    // Score formula: 100 - (defects * 5), minimum 0
    const calculatedScore = Math.max(0, 100 - totalDefects * 5);
    setFormData((prev) => ({ ...prev, score: calculatedScore }));

    // Auto-determine result based on score
    if (calculatedScore >= 90) {
      setFormData((prev) => ({ ...prev, result: "PASSED" }));
    } else if (calculatedScore >= 70) {
      setFormData((prev) => ({ ...prev, result: "CONDITIONAL_PASS" }));
    } else if (calculatedScore < 70 && totalDefects > 0) {
      setFormData((prev) => ({ ...prev, result: "FAILED" }));
    }
  }, [
    formData.fabricDefects,
    formData.sewingDefects,
    formData.measureDefects,
    formData.finishingDefects,
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const resultIcon = {
    PASSED: CheckCircle2,
    FAILED: XCircle,
    CONDITIONAL_PASS: AlertCircle,
    PENDING: AlertCircle,
  };

  const ResultIcon =
    resultIcon[formData.result as keyof typeof resultIcon] || AlertCircle;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quality Control Inspection</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Check Date */}
          <div className="space-y-2">
            <Label htmlFor="checkDate">Inspection Date</Label>
            <Input
              id="checkDate"
              type="date"
              value={formData.checkDate}
              onChange={(e) =>
                setFormData({ ...formData, checkDate: e.target.value })
              }
              required
            />
          </div>

          {/* Defect Categories */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">
              Defect Count by Category
            </Label>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fabricDefects">🧵 Fabric Defects</Label>
                <Input
                  id="fabricDefects"
                  type="number"
                  min="0"
                  value={formData.fabricDefects}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fabricDefects: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sewingDefects">🪡 Sewing Defects</Label>
                <Input
                  id="sewingDefects"
                  type="number"
                  min="0"
                  value={formData.sewingDefects}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sewingDefects: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="measureDefects">📏 Measurement Defects</Label>
                <Input
                  id="measureDefects"
                  type="number"
                  min="0"
                  value={formData.measureDefects}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      measureDefects: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="finishingDefects">✨ Finishing Defects</Label>
                <Input
                  id="finishingDefects"
                  type="number"
                  min="0"
                  value={formData.finishingDefects}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      finishingDefects: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Auto-calculated Score */}
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Quality Score</Label>
              <div className="flex items-center gap-2">
                <ResultIcon
                  className={`h-5 w-5 ${
                    formData.result === "PASSED"
                      ? "text-green-600"
                      : formData.result === "FAILED"
                      ? "text-red-600"
                      : "text-amber-600"
                  }`}
                />
                <Badge
                  className={
                    formData.result === "PASSED"
                      ? "bg-green-100 text-green-700"
                      : formData.result === "FAILED"
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-700"
                  }
                >
                  {formData.result}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Defects:</span>
                <span className="font-medium">
                  {formData.fabricDefects +
                    formData.sewingDefects +
                    formData.measureDefects +
                    formData.finishingDefects}
                </span>
              </div>
              <Progress value={formData.score} className="h-3" />
              <p className="text-2xl font-bold text-center">
                {formData.score}/100
              </p>
            </div>
          </div>

          {/* Manual Result Override */}
          <div className="space-y-2">
            <Label htmlFor="result">Final Result (optional override)</Label>
            <Select
              value={formData.result}
              onValueChange={(value) =>
                setFormData({ ...formData, result: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">⏳ Pending</SelectItem>
                <SelectItem value="PASSED">✅ Passed</SelectItem>
                <SelectItem value="CONDITIONAL_PASS">
                  ⚠️ Conditional Pass
                </SelectItem>
                <SelectItem value="FAILED">❌ Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Inspector Notes</Label>
            <Textarea
              id="notes"
              placeholder="Detailed quality inspection notes..."
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={4}
            />
          </div>

          {/* Photo Upload (Placeholder) */}
          <div className="space-y-2">
            <Label>Inspection Photos</Label>
            <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
              <Camera className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Photo upload coming soon</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Submit Quality Report</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
