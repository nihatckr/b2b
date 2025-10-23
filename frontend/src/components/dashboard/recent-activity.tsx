"use client";

import { toRelativeTime } from "@/lib/date-utils";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface User {
  name: string;
  email: string;
}

interface Activity {
  id: string;
  type: "order" | "sample" | "user" | "collection";
  title: string;
  description: string;
  user?: User;
  timestamp: string;
  status?: string;
}

interface RecentActivityProps {
  activities: Activity[];
  loading?: boolean;
}

const getActivityIcon = (type: string): string => {
  switch (type) {
    case "order":
      return "📦";
    case "sample":
      return "🎨";
    case "user":
      return "👤";
    case "collection":
      return "📁";
    default:
      return "📌";
  }
};

const getStatusColor = (
  status?: string
): "default" | "secondary" | "outline" => {
  if (!status) return "default";

  const statusLower = status.toLowerCase();
  if (statusLower.includes("complete") || statusLower.includes("delivered"))
    return "default";
  if (statusLower.includes("pending") || statusLower.includes("requested"))
    return "secondary";
  if (statusLower.includes("production")) return "outline";
  return "default";
};

export function RecentActivity({ activities, loading }: RecentActivityProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Son Aktiviteler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Son Aktiviteler</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Henüz aktivite yok
            </p>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-lg">
                    {getActivityIcon(activity.type)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium leading-none">
                      {activity.title}
                    </p>
                    {activity.status && (
                      <Badge
                        variant={getStatusColor(activity.status)}
                        className="ml-2"
                      >
                        {activity.status}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {activity.description}
                  </p>
                  {activity.user && (
                    <p className="text-xs text-muted-foreground">
                      {activity.user.name} ({activity.user.email})
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {toRelativeTime(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
