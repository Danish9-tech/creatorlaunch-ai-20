const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  setLoading(false);

  if (error) {
    toast({ title: "Sign in failed", description: error.message, variant: "destructive" });
    return;
  }

  toast({ title: "Welcome back!" });
  
  // Small delay to ensure session is written to localStorage
  setTimeout(() => {
    navigate(from, { replace: true });
  }, 500);
};
