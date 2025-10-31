import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Copy, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { showSuccess, showError } from "@/lib/toast-helpers";

interface Link {
  id: string;
  link_name: string | null;
  link_type: string;
  base_url: string;
  full_url: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_at: string;
}

export default function Links() {
  const { user } = useAuth();
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchLinks();
    }
  }, [user]);

  const fetchLinks = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("links")
        .select("*")
        .eq("user_id", user.id)
        .eq("link_type", "manual")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLinks(data || []);
    } catch (error: any) {
      console.error("Error fetching links:", error);
      showError(error.message || "Failed to fetch links");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    showSuccess("URL copied to clipboard");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this link?")) return;

    try {
      const { error } = await supabase
        .from("links")
        .delete()
        .eq("id", id);

      if (error) throw error;

      showSuccess("Link deleted successfully");
      fetchLinks();
    } catch (error: any) {
      console.error("Error deleting link:", error);
      showError(error.message || "Failed to delete link");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">Loading links...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Links</h1>
          <p className="text-muted-foreground">
            Central tracking layer for all UTM-tracked links across channels
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Link
        </Button>
      </div>

      {links.length === 0 && (
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">No links yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first UTM-tracked link
            </p>
            <Button size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Link
            </Button>
          </div>
        </div>
      )}

      {links.length > 0 && (
        <div className="border rounded-sm">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium">Link Name</th>
                <th className="text-left p-4 font-medium">Source</th>
                <th className="text-left p-4 font-medium">Medium</th>
                <th className="text-left p-4 font-medium">Campaign</th>
                <th className="text-left p-4 font-medium">Destination URL</th>
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <tr key={link.id} className="border-t hover:bg-muted/30">
                  <td className="p-4 font-medium">{link.link_name || "—"}</td>
                  <td className="p-4">
                    <Badge variant="outline">{link.utm_source || "—"}</Badge>
                  </td>
                  <td className="p-4">
                    <Badge variant="outline">{link.utm_medium || "—"}</Badge>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {link.utm_campaign || "—"}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm truncate max-w-[200px]">
                        {link.base_url}
                      </span>
                      <a href={link.base_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 text-primary" />
                      </a>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => handleCopyUrl(link.full_url || link.base_url)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => handleDelete(link.id)}
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
