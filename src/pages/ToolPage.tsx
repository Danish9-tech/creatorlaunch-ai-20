import { useParams, Navigate } from "react-router-dom";
import { getToolBySlug } from "@/config/tools";
import { GenericToolPage } from "@/components/GenericToolPage";

const ToolPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const tool = slug ? getToolBySlug(slug) : undefined;

  if (!tool) return <Navigate to="/dashboard" replace />;

  return <GenericToolPage tool={tool} />;
};

export default ToolPage;
