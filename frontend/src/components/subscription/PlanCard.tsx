"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Lock } from "lucide-react";

interface PlanCardProps {
  name: string;
  price: string;
  period: string;
  features: string[];
  current?: boolean;
  recommended?: boolean;
  onUpgrade?: () => void;
  disabled?: boolean;
}

export function PlanCard({
  name,
  price,
  period,
  features,
  current,
  recommended,
  onUpgrade,
  disabled,
}: PlanCardProps) {
  return (
    <Card
      className={`relative ${recommended ? "border-2 border-primary" : ""}`}
    >
      {recommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary">Önerilen</Badge>
        </div>
      )}

      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {name}
          {current && <Badge variant="secondary">Mevcut Plan</Badge>}
        </CardTitle>
        <CardDescription>
          <span className="text-3xl font-bold text-foreground">{price}</span>
          <span className="text-muted-foreground">/{period}</span>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        {current ? (
          <Button className="w-full" variant="outline" disabled>
            Aktif Plan
          </Button>
        ) : (
          <Button
            className="w-full"
            onClick={onUpgrade}
            disabled={disabled}
            variant={recommended ? "default" : "outline"}
          >
            {disabled && <Lock className="h-4 w-4 mr-2" />}
            {disabled ? "Yakında" : "Planı Seç"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
