import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { showSuccess, showError } from "@/lib/toast-helpers";

interface LandingPage {
  id: string;
  name: string;
  url: string;
  description: string | null;
  status: string;
  created_at: string;
}

export default function LandingPageLibrary() {
  const { user } = useAuth();
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchLandingPages();
    }
  }, [user]);

  const fetchLandingPages = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("landing_pages")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLandingPages(data || []);
    } catch (error: any) {
      console.error("Error fetching landing pages:", error);
      showError(error.message || "Failed to fetch landing pages");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this landing page?")) return;

    try {
      const { error } = await supabase
        .from("landing_pages")
        .delete()
        .eq("id", id);

      if (error) throw error;

      showSuccess("Landing page deleted successfully");
      fetchLandingPages();
    } catch (error: any) {
      console.error("Error deleting landing page:", error);
      showError(error.message || "Failed to delete landing page");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">Loading landing pages...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Landing Page Library</h1>
          <p className="text-muted-foreground">
            Manage landing pages used across your campaigns and ads
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Landing Page
        </Button>
      </div>

      {landingPages.length === 0 && (
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">No landing pages yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first landing page to use across campaigns
            </p>
            <Button size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Landing Page
            </Button>
          </div>
        </div>
      )}

      {landingPages.length > 0 && (
        <div className="border rounded-sm">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium">Name</th>
                <th className="text-left p-4 font-medium">URL</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Notes</th>
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {landingPages.map((page) => (
                <tr key={page.id} className="border-t hover:bg-muted/30">
                  <td className="p-4 font-medium">{page.name}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <span className="text-primary">{page.url.substring(0, 50)}{page.url.length > 50 ? "..." : ""}</span>
                      <a href={page.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 text-primary" />
                      </a>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant={page.status === "Active" ? "default" : "secondary"}>
                      {page.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {page.description || "—"}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => handleDelete(page.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
