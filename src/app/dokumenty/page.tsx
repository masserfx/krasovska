import AppHeader from "@/components/AppHeader";
import DocViewer from "@/components/docs/DocViewer";

export default function DokumentyPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader activeTab="dokumenty" />
      <DocViewer />
    </div>
  );
}
