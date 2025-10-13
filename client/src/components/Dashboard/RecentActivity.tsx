"use client";

import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface Activity {
  id: string;
  type: "order" | "sample" | "user" | "collection";
  title: string;
  description: string;
  user?: {
    name: string;
    email: string;
  };
  timestamp: string;
  status?: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

const getActivityIcon = (type: string) => {
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

const getStatusColor = (status?: string) => {
  if (!status) return "default";

  const statusLower = status.toLowerCase();
  if (statusLower.includes("complete") || statusLower.includes("delivered"))
    return "default";
  if (statusLower.includes("pending") || statusLower.includes("requested"))
    return "secondary";
  if (statusLower.includes("production")) return "outline";
  return "default";
};

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No recent activity
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
                      by {activity.user.name}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.timestamp), {
                      addSuffix: true,
                    })}
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
