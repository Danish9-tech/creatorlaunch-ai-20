import { Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center relative z-10 px-4 max-w-2xl"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="mx-auto w-20 h-20 rounded-3xl gradient-primary flex items-center justify-center mb-8 glow-primary"
        >
          <Rocket className="w-10 h-10 text-primary-foreground" />
        </motion.div>

        <h1 className="text-5xl md:text-6xl font-display font-bold mb-4">
          Creator<span className="text-gradient">Launch</span> AI
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-lg mx-auto">
          Create, optimize, market, and launch digital products across 7+ marketplaces — powered by AI.
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <Button
            className="gradient-primary text-primary-foreground btn-animate font-display font-semibold text-lg px-8 py-6"
            onClick={() => navigate("/signup")}
          >
            Get Started Free
          </Button>
          <Button
            variant="outline"
            className="btn-animate font-display font-semibold text-lg px-8 py-6"
            onClick={() => navigate("/signin")}
          >
            Sign In
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Index;
