"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconBuilding, IconSettings, IconUsers } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthProvider";

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const isAdmin = user?.role === "ADMIN";
  const isCompanyOwner = user?.role === "COMPANY_OWNER";
  const canManageCompany = isAdmin || isCompanyOwner;
  const canManageEmployees = isAdmin || isCompanyOwner;

  const settingsCards = [
    {
      title: "Company Management",
      description: "Manage company information, settings and configurations",
      icon: IconBuilding,
      url: isAdmin ? "/admin/companies" : "/dashboard/company",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      visible: canManageCompany,
    },
    {
      title: "User Management",
      description: isAdmin
        ? "Manage all users across the platform"
        : "Manage company employees and their permissions",
      icon: IconUsers,
      url: isAdmin ? "/admin/users" : "/dashboard/employees",
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      visible: canManageEmployees,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gray-100 rounded-lg">
            <IconSettings className="h-6 w-6 text-gray-700" />
          </div>
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
        <p className="text-gray-500">
          Manage your system settings and configurations
        </p>
      </div>

      {/* Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsCards
          .filter((card) => card.visible)
          .map((card, index) => {
            const Icon = card.icon;
            return (
              <Card
                key={index}
                className="hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => router.push(card.url)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${card.bgColor}`}>
                      <Icon className={`h-6 w-6 ${card.color}`} />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Open →
                    </Button>
                  </div>
                  <CardTitle className="text-xl">{card.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">{card.description}</p>
                </CardContent>
              </Card>
            );
          })}
      </div>

      {/* Info Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <IconSettings className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">
                Settings Overview
              </h3>
              <p className="text-sm text-blue-800">
                {isAdmin
                  ? "As an administrator, you have full access to all system settings including user management, company management, and platform configurations."
                  : isCompanyOwner
                  ? "As a company owner, you can manage your company settings and employee accounts."
                  : "Contact your administrator or company owner to request changes to settings."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
