import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

/**
 * ProtectedRoute — wraps all auth-gated routes.
 * Redirects unauthenticated users to /signin.
 * Passes the Supabase session through context.
 */
export function ProtectedRoute() {
  const location = useLocation();
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    // No Supabase configured — skip auth check (dev/demo mode)
    if (!supabase) {
      setSession(null);
      return;
    }

    // Get the initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Still loading — show branded spinner
  if (session === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full gradient-primary animate-pulse" />
          <p className="text-sm text-muted-foreground animate-pulse">Authenticating...</p>
        </div>
      </div>
    );
  }

  // No Supabase configured — allow access (demo/local mode)
  if (!supabase) {
    return <Outlet />;
  }

  // Not logged in — redirect to sign in, preserve intended destination
  if (!session) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Authenticated — render child routes
  return <Outlet />;
}
