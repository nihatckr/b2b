import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, FolderTree, Globe, XCircle } from "lucide-react";

interface CategoryStatsProps {
  stats: {
    total: number;
    active: number;
    inactive: number;
    byLevel: Array<{
      level: string;
      count: number;
    }>;
  };
}

export function CategoryStats({ stats }: CategoryStatsProps) {
  const levelLabels: Record<string, string> = {
    ROOT: "Ana Kategori",
    MAIN: "Ana Grup",
    SUB: "Alt Grup",
    DETAIL: "Detay",
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Categories */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Toplam Kategori</CardTitle>
          <FolderTree className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            Tüm standart kategoriler
          </p>
        </CardContent>
      </Card>

      {/* Active Categories */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Aktif</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {stats.active}
          </div>
          <p className="text-xs text-muted-foreground">
            Kullanılabilir kategoriler
          </p>
        </CardContent>
      </Card>

      {/* Inactive Categories */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pasif</CardTitle>
          <XCircle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {stats.inactive}
          </div>
          <p className="text-xs text-muted-foreground">
            Devre dışı kategoriler
          </p>
        </CardContent>
      </Card>

      {/* By Level */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Seviyeler</CardTitle>
          <Globe className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {stats.byLevel.map((item) => (
              <div key={item.level} className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  {levelLabels[item.level] || item.level}:
                </span>
                <span className="font-medium">{item.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
