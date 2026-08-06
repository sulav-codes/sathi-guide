"use client";

import { useEffect, useState } from "react";
import { apiClient } from "../../../lib/api";
import { CheckCircle, XCircle, Search, User } from "lucide-react";
import toast from "react-hot-toast";

export default function GuidesVerificationPage() {
  const [guides, setGuides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pendingGuideIds, setPendingGuideIds] = useState<Set<string>>(
    () => new Set(),
  );

  const fetchGuides = async () => {
    try {
      const response = await apiClient.getPendingGuides();
      // Adjust based on actual backend response structure. Assuming { data: [] }
      setGuides(response.data || []);
    } catch (error) {
      toast.error("Failed to load pending guides");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuides();
  }, []);

  const handleApprove = async (id: string) => {
    setPendingGuideIds((current) => {
      const next = new Set(current);
      next.add(id);
      return next;
    });

    try {
      await apiClient.approveGuide(id);
      toast.success("Guide approved successfully");
      await fetchGuides();
    } catch (error) {
      toast.error("Failed to approve guide");
    } finally {
      setPendingGuideIds((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
    }
  };

  const handleReject = async (id: string) => {
    setPendingGuideIds((current) => {
      const next = new Set(current);
      next.add(id);
      return next;
    });

    try {
      const reason = window.prompt("Reason for rejection:");
      if (reason === null) return;
      await apiClient.rejectGuide(id, reason || "Does not meet guidelines");
      toast.success("Guide rejected successfully");
      await fetchGuides();
    } catch (error) {
      toast.error("Failed to reject guide");
    } finally {
      setPendingGuideIds((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
    }
  };

  const filteredGuides = guides.filter(
    (g) =>
      g.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.id.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text">Guide Verification</h1>
          <p className="text-text-secondary mt-1">
            Review and approve new guide applications.
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted h-5 w-5" />
          <input
            type="text"
            placeholder="Search pending guides..."
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
        ) : filteredGuides.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 bg-inactive-card rounded-full flex items-center justify-center mb-4">
              <User className="h-8 w-8 text-text-muted" />
            </div>
            <h3 className="text-lg font-medium text-text">
              {searchTerm ? "No matching guides" : "No pending guides"}
            </h3>
            <p className="text-text-secondary mt-1">
              {searchTerm
                ? "No pending guide matches this search."
                : "All caught up! There are no guide applications waiting for review."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-inactive-card border-b border-border text-text-secondary text-sm">
                  <th className="p-4 font-medium">Applicant</th>
                  <th className="p-4 font-medium">Documents</th>
                  <th className="p-4 font-medium">Applied Date</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGuides.map((guide) => {
                  const isPending = pendingGuideIds.has(guide.id);

                  return (
                    <tr
                      key={guide.id}
                      className="border-b border-border hover:bg-active-card/30 transition-colors group"
                    >
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3 text-primary font-bold">
                            {guide.user?.email?.[0].toUpperCase() || "U"}
                          </div>
                          <div>
                            <p className="font-medium text-text">
                              {guide.user?.email || "Unknown User"}
                            </p>
                            <p className="text-xs text-text-muted">
                              ID: {guide.id.substring(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          {guide.documents?.length || 0} files
                        </span>
                      </td>
                      <td className="p-4 text-sm text-text-secondary">
                        {new Date(guide.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleApprove(guide.id)}
                            disabled={isPending}
                            className="flex items-center px-3 py-1.5 bg-green/10 text-green hover:bg-green hover:text-white rounded-lg transition-colors text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <CheckCircle className="w-4 h-4 mr-1.5" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(guide.id)}
                            disabled={isPending}
                            className="flex items-center px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <XCircle className="w-4 h-4 mr-1.5" />
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
