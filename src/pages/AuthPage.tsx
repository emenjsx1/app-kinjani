import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import logoDark from "@/assets/logo-dark.png";

// Validation schemas
const emailSchema = z.string().email("Email inválido");
const passwordSchema = z.string().min(6, "A palavra-passe deve ter pelo menos 6 caracteres");
const nameSchema = z.string().min(2, "O nome deve ter pelo menos 2 caracteres").optional();

type AuthMode = "login" | "signup" | "forgot" | "reset";

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, signUp, isAuthenticated, isLoading, resetPassword, updatePassword } = useAuth();
  
  // Check if we're in reset mode (user clicked link from email)
  const modeFromUrl = searchParams.get("mode");
  const initialMode = modeFromUrl === "reset" ? "reset" : "login";
  
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [authMode, setAuthMode] = useState<AuthMode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  
  // Error states
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [nameError, setNameError] = useState("");

  // Redirect if already authenticated (except in reset mode)
  useEffect(() => {
    if (isAuthenticated && !isLoading && authMode !== "reset") {
      navigate("/dashboard");
    }
  }, [isAuthenticated, isLoading, navigate, authMode]);

  const validateForm = () => {
    let isValid = true;
    
    // Reset errors
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setNameError("");
    
    if (authMode === "forgot") {
      // Only validate email for forgot password
      const emailResult = emailSchema.safeParse(email);
      if (!emailResult.success) {
        setEmailError(emailResult.error.errors[0].message);
        isValid = false;
      }
      return isValid;
    }
    
    if (authMode === "reset") {
      // Validate new password and confirmation
      const passwordResult = passwordSchema.safeParse(password);
      if (!passwordResult.success) {
        setPasswordError(passwordResult.error.errors[0].message);
        isValid = false;
      }
      
      if (password !== confirmPassword) {
        setConfirmPasswordError("As palavras-passe não coincidem");
        isValid = false;
      }
      return isValid;
    }
    
    // Validate email
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      setEmailError(emailResult.error.errors[0].message);
      isValid = false;
    }
    
    // Validate password
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      setPasswordError(passwordResult.error.errors[0].message);
      isValid = false;
    }
    
    // Validate name for signup
    if (activeTab === "signup" && fullName) {
      const nameResult = nameSchema.safeParse(fullName);
      if (!nameResult.success) {
        setNameError(nameResult.error.errors[0].message);
        isValid = false;
      }
    }
    
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      if (authMode === "forgot") {
        const { error } = await resetPassword(email);
        if (!error) {
          setAuthMode("login");
          setEmail("");
        }
      } else if (authMode === "reset") {
        const { error } = await updatePassword(password);
        if (!error) {
          navigate("/dashboard");
        }
      } else if (activeTab === "login") {
        const { error } = await signIn(email, password);
        if (!error) {
          navigate("/dashboard");
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        if (!error) {
          // Stay on page and show success message (email confirmation needed)
          setActiveTab("login");
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToLogin = () => {
    setAuthMode("login");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rich-black via-dark-green to-bangladesh-green">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-caribbean-green"></div>
      </div>
    );
  }

  // Forgot password form
  if (authMode === "forgot") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rich-black via-dark-green to-bangladesh-green p-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--caribbean-green)/0.2),transparent_50%)]" />
        
        {/* Header with logo and theme toggle */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <Link to="/">
            <img src={logoDark} alt="KINJA AI" className="h-10 w-auto" />
          </Link>
          <ThemeToggle />
        </div>
        
        <Card className="relative w-full max-w-md bg-card/95 backdrop-blur-sm border-border/50 shadow-2xl">
          <CardHeader className="text-center space-y-2 pb-2">
            <CardTitle className="text-xl">Recuperar palavra-passe</CardTitle>
            <CardDescription>
              Introduza o seu email para receber um link de recuperação
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    autoComplete="email"
                  />
                </div>
                {emailError && <p className="text-sm text-destructive">{emailError}</p>}
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-caribbean-green hover:bg-mountain-meadow text-rich-black font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-rich-black border-t-transparent" />
                ) : (
                  <>
                    Enviar link de recuperação
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={handleBackToLogin}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Reset password form (after clicking email link)
  if (authMode === "reset") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rich-black via-dark-green to-bangladesh-green p-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--caribbean-green)/0.2),transparent_50%)]" />
        
        {/* Header with logo and theme toggle */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <Link to="/">
            <img src={logoDark} alt="KINJA AI" className="h-10 w-auto" />
          </Link>
          <ThemeToggle />
        </div>
        
        <Card className="relative w-full max-w-md bg-card/95 backdrop-blur-sm border-border/50 shadow-2xl">
          <CardHeader className="text-center space-y-2 pb-2">
            <CardTitle className="text-xl">Definir nova palavra-passe</CardTitle>
            <CardDescription>
              Introduza a sua nova palavra-passe
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nova palavra-passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar palavra-passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10"
                    autoComplete="new-password"
                  />
                </div>
                {confirmPasswordError && <p className="text-sm text-destructive">{confirmPasswordError}</p>}
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-caribbean-green hover:bg-mountain-meadow text-rich-black font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-rich-black border-t-transparent" />
                ) : (
                  <>
                    Atualizar palavra-passe
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rich-black via-dark-green to-bangladesh-green p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--caribbean-green)/0.2),transparent_50%)]" />
      
      {/* Header with logo and theme toggle */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
        <Link to="/">
          <img src={logoDark} alt="KINJA AI" className="h-10 w-auto" />
        </Link>
        <ThemeToggle />
      </div>
      
      <Card className="relative w-full max-w-md bg-card/95 backdrop-blur-sm border-border/50 shadow-2xl">
        <CardHeader className="text-center space-y-2 pb-2">
          <CardTitle className="text-xl">
            {activeTab === "login" ? "Bem-vindo de volta" : "Criar conta"}
          </CardTitle>
          <CardDescription>
            {activeTab === "login" 
              ? "Entre na sua conta para continuar" 
              : "Comece a criar agentes de IA e sites"}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "signup")}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Registar</TabsTrigger>
            </TabsList>
            
            <form onSubmit={handleSubmit}>
              <TabsContent value="signup" className="space-y-4 mt-0">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="O seu nome"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {nameError && <p className="text-sm text-destructive">{nameError}</p>}
                </div>
              </TabsContent>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      autoComplete="email"
                    />
                  </div>
                  {emailError && <p className="text-sm text-destructive">{emailError}</p>}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Palavra-passe</Label>
                    {activeTab === "login" && (
                      <button
                        type="button"
                        onClick={() => setAuthMode("forgot")}
                        className="text-sm text-caribbean-green hover:underline"
                      >
                        Esqueceu a senha?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      autoComplete={activeTab === "login" ? "current-password" : "new-password"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-caribbean-green hover:bg-mountain-meadow text-rich-black font-semibold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-rich-black border-t-transparent" />
                  ) : (
                    <>
                      {activeTab === "login" ? "Entrar" : "Criar conta"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Tabs>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>
              {activeTab === "login" 
                ? "Não tem uma conta? " 
                : "Já tem uma conta? "}
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === "login" ? "signup" : "login")}
                className="text-caribbean-green hover:underline font-medium"
              >
                {activeTab === "login" ? "Registe-se" : "Entre aqui"}
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
