"use client";

import { useEffect, useState } from "react";
import { apiClient, Report } from "../../../lib/api";
import {
  Shield,
  ShieldAlert,
  CheckCircle,
  Search,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ReportsModerationPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchReports = async () => {
    try {
      const response = await apiClient.getReports();
      setReports(response.items || []);
    } catch {
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleResolve = async (id: string) => {
    try {
      const notes = window.prompt(
        "Resolution details (e.g. User warned, content removed):",
      );
      if (notes === null) return;
      await apiClient.resolveReport(id, notes || "Resolved by admin");
      toast.success("Report resolved");
      fetchReports();
    } catch {
      toast.error("Failed to resolve report");
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      const reason = window.prompt("Dismiss reason (optional):");
      if (reason === null) return;
      await apiClient.dismissReport(id, reason || "Dismissed by admin");
      toast.success("Report dismissed");
      fetchReports();
    } catch {
      toast.error("Failed to dismiss report");
    }
  };

  const filteredReports = reports.filter(
    (r) =>
      r.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.status?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text">Content Moderation</h1>
          <p className="text-text-secondary mt-1">
            Review user reports and take necessary actions.
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted h-5 w-5" />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full sm:w-64 bg-card border border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 text-text outline-none transition-all"
          />
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 bg-inactive-card rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-text-muted" />
            </div>
            <h3 className="text-lg font-medium text-text">
              {searchTerm ? "No matching reports" : "No active reports"}
            </h3>
            <p className="text-text-secondary mt-1">
              {searchTerm
                ? "No report matches this search."
                : "The platform is safe and sound! There are no reports to moderate."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-inactive-card border-b border-border text-text-secondary text-sm">
                  <th className="p-4 font-medium">Type & Target</th>
                  <th className="p-4 font-medium">Reason</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Reported At</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr
                    key={report.id}
                    className="border-b border-border hover:bg-active-card/30 transition-colors group"
                  >
                    <td className="p-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-orange/10 flex items-center justify-center mr-3 text-orange font-bold">
                          <ShieldAlert size={20} />
                        </div>
                        <div>
                          <p className="font-medium text-text capitalize">
                            {report.targetType}
                          </p>
                          <p className="text-xs text-text-muted font-mono">
                            {report.targetId?.substring(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-text line-clamp-2 max-w-xs">
                        {report.reason}
                      </p>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          report.status === "PENDING"
                            ? "bg-orange/10 text-orange"
                            : report.status === "RESOLVED"
                              ? "bg-green/10 text-green"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-text-secondary">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      {report.status === "PENDING" && (
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleResolve(report.id)}
                            className="flex items-center px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition-colors text-sm font-medium"
                          >
                            <CheckCircle className="w-4 h-4 mr-1.5" />
                            Resolve
                          </button>
                          <button
                            onClick={() => handleDismiss(report.id)}
                            className="flex items-center px-3 py-1.5 bg-text-muted/20 text-text hover:bg-text-muted hover:text-white rounded-lg transition-colors text-sm font-medium"
                          >
                            <XCircle className="w-4 h-4 mr-1.5" />
                            Dismiss
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
