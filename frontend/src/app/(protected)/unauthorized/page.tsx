"use client";

import { useDepartmentInfo } from "@/hooks/usePermissions";
import { ArrowLeft, Home, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();
  const { department, permissions } = useDepartmentInfo();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full">
              <ShieldAlert className="w-16 h-16 text-red-600 dark:text-red-400" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-gray-900 dark:text-white">
            Access Denied
          </h1>

          {/* Message */}
          <p className="text-center text-lg text-gray-600 dark:text-gray-300 mb-8">
            You don't have the required permissions to access this page.
          </p>

          {/* Department Info */}
          {department && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 mb-8">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Your Department
              </h2>
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {department}
              </p>

              {permissions.length > 0 && (
                <>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Your Permissions
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {permissions.slice(0, 8).map((permission: string) => (
                      <span
                        key={permission}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                      >
                        {permission}
                      </span>
                    ))}
                    {permissions.length > 8 && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300">
                        +{permissions.length - 8} more
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Help Text */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Need access?</strong> Contact your system administrator or
              department manager to request the necessary permissions.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>

            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex-1"
            >
              <Home className="w-4 h-4" />
              Return to Home
            </Link>
          </div>

          {/* Additional Help */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              If you believe this is a mistake, please contact support at{" "}
              <a
                href="mailto:support@example.com"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                support@example.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
