import { useParams, Navigate } from "react-router-dom";
import { getToolBySlug } from "@/config/tools";
import { GenericToolPage } from "@/components/GenericToolPage";

const ToolPage = () => {
  const { toolId, slug } = useParams<{ toolId: string; slug: string }>();
  const toolSlug = toolId || slug;
  const tool = toolSlug ? getToolBySlug(toolSlug) : undefined;
  if (!tool) return <Navigate to="/dashboard" replace />;
  return <GenericToolPage tool={tool} />;
};

export default ToolPage;
