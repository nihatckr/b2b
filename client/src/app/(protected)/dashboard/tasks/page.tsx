"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { AlertCircle, ChevronDown, Clock, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { useQuery } from "urql";

const TASKS_QUERY = `
  query MyTasks($status: String, $type: String, $priority: String) {
    myTasks(status: $status, type: $type, priority: $priority) {
      id
      title
      description
      status
      priority
      type
      dueDate
      completedAt
      user {
        id
        name
        firstName
        lastName
      }
      assignedTo {
        id
        name
        firstName
        lastName
      }
      collection {
        id
        name
      }
      sample {
        id
        sampleNumber
      }
      order {
        id
        orderNumber
      }
      createdAt
    }
  }
`;

interface Task {
  id: number;
  title: string;
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  type: string;
  dueDate?: string;
  completedAt?: string;
  user: {
    id: number;
    name?: string;
    firstName?: string;
    lastName?: string;
  };
  assignedTo?: {
    id: number;
    name?: string;
    firstName?: string;
    lastName?: string;
  };
  collection?: {
    id: number;
    name: string;
  };
  sample?: {
    id: number;
    sampleNumber: string;
  };
  order?: {
    id: number;
    orderNumber: string;
  };
  createdAt: string;
}

const priorityColors = {
  LOW: "bg-blue-100 text-blue-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HIGH: "bg-red-100 text-red-800",
};

const statusColors = {
  TODO: "bg-gray-100 text-gray-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const statusLabels = {
  TODO: "Yapılacak",
  IN_PROGRESS: "Devam Ediyor",
  COMPLETED: "Tamamlandı",
  CANCELLED: "İptal Edildi",
};

const priorityLabels = {
  LOW: "Düşük",
  MEDIUM: "Orta",
  HIGH: "Yüksek",
};

function TaskRow({ task }: { task: Task }) {
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue =
    dueDate && dueDate < new Date() && task.status !== "COMPLETED";

  const getUserName = (user?: {
    name?: string;
    firstName?: string;
    lastName?: string;
  }) => {
    if (!user) return "-";
    return user.name || `${user.firstName} ${user.lastName}`.trim();
  };

  return (
    <TableRow>
      <TableCell className="font-medium max-w-xs truncate">
        <div>
          <p className="font-semibold truncate">{task.title}</p>
          {task.description && (
            <p className="text-xs text-gray-500 truncate">{task.description}</p>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge className={priorityColors[task.priority]}>
          {priorityLabels[task.priority]}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge className={statusColors[task.status]}>
          {statusLabels[task.status]}
        </Badge>
      </TableCell>
      <TableCell className="text-sm">
        {dueDate ? (
          <div className="flex items-center gap-1">
            {isOverdue ? (
              <AlertCircle className="w-4 h-4 text-red-500" />
            ) : (
              <Clock className="w-4 h-4 text-gray-400" />
            )}
            <span className={isOverdue ? "text-red-600 font-semibold" : ""}>
              {format(dueDate, "dd MMM", { locale: tr })}
            </span>
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </TableCell>
      <TableCell className="text-sm">
        {task.collection ? (
          <span className="px-2 py-1 bg-gray-100 rounded text-xs">
            {task.collection.name}
          </span>
        ) : task.sample ? (
          <span className="px-2 py-1 bg-gray-100 rounded text-xs">
            {task.sample.sampleNumber}
          </span>
        ) : task.order ? (
          <span className="px-2 py-1 bg-gray-100 rounded text-xs">
            {task.order.orderNumber}
          </span>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </TableCell>
      <TableCell className="text-sm">{getUserName(task.assignedTo)}</TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => alert(`Düzenleme: ${task.title}`)}>
              Düzenle
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => alert(`Detaylar: ${task.title}`)}>
              Detayları Gör
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => alert(`Silme: ${task.title}`)}
            >
              Sil
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

export default function TasksPage() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<"dueDate" | "priority" | "created">(
    "dueDate"
  );

  const [result] = useQuery({
    query: TASKS_QUERY,
    variables: {
      status: statusFilter || undefined,
      priority: priorityFilter || undefined,
    },
  });

  let tasks = result.data?.myTasks || [];
  const isLoading = result.fetching;
  const error = result.error;

  // Sort tasks
  tasks = [...tasks].sort((a: Task, b: Task) => {
    if (sortBy === "priority") {
      const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    if (sortBy === "dueDate") {
      const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      return aDate - bDate;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Calculate stats
  const stats = {
    total: tasks.length,
    todo: tasks.filter((t: Task) => t.status === "TODO").length,
    inProgress: tasks.filter((t: Task) => t.status === "IN_PROGRESS").length,
    completed: tasks.filter((t: Task) => t.status === "COMPLETED").length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">Görevler yüklenirken hata oluştu</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Görevlerim</h1>
          <p className="text-gray-600 mt-1">
            Toplam {stats.total} görev (
            <span className="text-blue-600">{stats.todo} Yapılacak</span>,{" "}
            <span className="text-yellow-600">{stats.inProgress} Devam</span>,{" "}
            <span className="text-green-600">{stats.completed} Tamamlandı</span>
            )
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Yeni Görev
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Toplam Görev
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Yapılacak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{stats.todo}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Devam Ediyor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">
              {stats.inProgress}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Tamamlandı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {stats.completed}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="">Tüm Durumlar</option>
          <option value="TODO">Yapılacak</option>
          <option value="IN_PROGRESS">Devam Ediyor</option>
          <option value="COMPLETED">Tamamlandı</option>
          <option value="CANCELLED">İptal Edildi</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="">Tüm Öncelikler</option>
          <option value="LOW">Düşük</option>
          <option value="MEDIUM">Orta</option>
          <option value="HIGH">Yüksek</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value as "dueDate" | "priority" | "created")
          }
          className="px-3 py-2 border border-gray-300 rounded-md text-sm ml-auto"
        >
          <option value="dueDate">Son Tarihine Göre</option>
          <option value="priority">Önceliğe Göre</option>
          <option value="created">Oluşturma Tarihine Göre</option>
        </select>
      </div>

      {/* DataTable */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-80">Başlık</TableHead>
                <TableHead className="w-28">Öncelik</TableHead>
                <TableHead className="w-32">Durum</TableHead>
                <TableHead className="w-28">Son Tarih</TableHead>
                <TableHead className="w-40">İlişkili</TableHead>
                <TableHead className="w-32">Atanan Kişi</TableHead>
                <TableHead className="w-12 text-right">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-gray-500">Görev bulunamadı</p>
                  </TableCell>
                </TableRow>
              ) : (
                tasks.map((task: Task) => <TaskRow key={task.id} task={task} />)
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
