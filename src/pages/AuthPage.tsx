import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

const emailSchema = z.string().email("Email inválido");
const passwordSchema = z.string().min(6, "A palavra-passe deve ter pelo menos 6 caracteres");
const nameSchema = z.string().min(2, "O nome deve ter pelo menos 2 caracteres").optional();

type AuthMode = "login" | "signup" | "forgot" | "reset";

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, signUp, isAuthenticated, isLoading, resetPassword, updatePassword } = useAuth();
  
  const modeFromUrl = searchParams.get("mode");
  const initialMode = modeFromUrl === "reset" ? "reset" : "login";
  
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [authMode, setAuthMode] = useState<AuthMode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    if (isAuthenticated && !isLoading && authMode !== "reset") {
      navigate("/dashboard");
    }
  }, [isAuthenticated, isLoading, navigate, authMode]);

  const validateForm = () => {
    let isValid = true;
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setNameError("");
    
    if (authMode === "forgot") {
      const emailResult = emailSchema.safeParse(email);
      if (!emailResult.success) {
        setEmailError(emailResult.error.errors[0].message);
        isValid = false;
      }
      return isValid;
    }
    
    if (authMode === "reset") {
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
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      setEmailError(emailResult.error.errors[0].message);
      isValid = false;
    }
    
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      setPasswordError(passwordResult.error.errors[0].message);
      isValid = false;
    }
    
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
          setActiveTab("login");
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#011612]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#45fd94]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#011612] text-[#cfe8e1] font-sans antialiased overflow-hidden relative">
      {/* Decorative Blurs */}
      <div className="absolute -top-48 -left-48 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(69,253,148,0.15)_0%,rgba(9,83,68,0)_70%)] blur-[80px] pointer-events-none z-0" />
      <div className="absolute -bottom-48 -right-48 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(93,220,177,0.1)_0%,rgba(6,48,42,0)_70%)] blur-[80px] pointer-events-none z-0" />

      {/* LEFT SIDE: Visual Brand Anchor */}
      <div className="relative hidden md:flex md:w-1/2 lg:w-3/5 h-full min-h-screen flex-col justify-between p-12 overflow-hidden bg-[#00110e]">
        {/* Brand Logo */}
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#45fd94] flex items-center justify-center shadow-[0_0_15px_rgba(69,253,148,0.3)]">
              <Bot className="h-6 w-6 text-[#011612] font-bold" />
            </div>
            <span className="text-xl lg:text-2xl font-extrabold text-[#45fd94] tracking-tighter">Kinjani AI</span>
          </Link>
        </div>

        {/* Abstract High-Tech Visual */}
        <div className="absolute inset-0 z-0">
          <img 
            alt="Kinjani AI Neural Visual" 
            className="w-full h-full object-cover opacity-60 mix-blend-screen" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDVbU6S-xzOFMoG46gVVOGPU0dyXDAkxr7O-4KTAM8e_QMAfTCyHLi7Vhl81KbMiQftjbCyucooAlBY2REDmgJZj0bhDbdpiNbd_3Q6T6ZPjl3k2Z43HYGW04S16WWLmjnLzVbnI5dKNwhUGNh3WHnvTj8F1MJLqI76D-gQOYpUAixnF-_b1DCPmYT-RwK8a53zVyV1NL0IVxMqJEHRb0cmwC-XxQ0R6M-lCDkD5dNVr0qq0eDZSFDD4P87AxP4aUJYxUYDDsI-dPDa"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#00110e] via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#00110e] via-transparent to-transparent"></div>
        </div>

        {/* Tagline */}
        <div className="relative z-10 max-w-lg mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-[#021f1b] bg-[#095344]"></div>
              <div className="w-8 h-8 rounded-full border-2 border-[#021f1b] bg-[#45fd94] flex items-center justify-center text-xs text-[#011612] font-bold"><Sparkles className="h-3 w-3" /></div>
            </div>
            <span className="text-xs font-semibold tracking-widest text-[#aacbc4]">TRUSTED BY 10k+ CREATORS</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4">Fabricate the future of <span className="text-[#45fd94]">AI workflows</span>.</h2>
          <p className="text-[#aacbc4] leading-relaxed">Join the elite lab where high-fidelity neural networks meet organic precision. Your next breakthrough starts here.</p>
        </div>

        {/* Stats Footer */}
        <div className="relative z-10 flex gap-12 border-t border-[#095344]/30 pt-8">
          <div>
            <div className="text-xl font-bold text-[#45fd94]">99.9%</div>
            <div className="text-xs tracking-wider text-[#aacbc4]/60">UPTIME GUARANTEED</div>
          </div>
          <div>
            <div className="text-xl font-bold text-[#45fd94]">2.4ms</div>
            <div className="text-xs tracking-wider text-[#aacbc4]/60">AVG LATENCY</div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Auth Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 relative z-10 min-h-screen bg-[#021713]">
        {/* Mobile Logo */}
        <div className="md:hidden flex items-center gap-2 mb-12">
          <div className="w-8 h-8 rounded-lg bg-[#45fd94] flex items-center justify-center">
            <Bot className="h-5 w-5 text-[#011612]" />
          </div>
          <span className="text-xl font-extrabold text-[#45fd94] tracking-tighter">Kinjani AI</span>
        </div>

        <div className="w-full max-w-md bg-[#021f1b]/60 backdrop-blur-xl border border-[#095344]/30 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">
              {authMode === "forgot" ? "Recuperar senha" : authMode === "reset" ? "Definir nova senha" : activeTab === "login" ? "Welcome Back" : "Criar Conta"}
            </h1>
            <p className="text-sm text-[#aacbc4]">
              {authMode === "forgot" 
                ? "Insira seu email para recuperar o acesso" 
                : authMode === "reset" 
                  ? "Defina uma nova palavra-passe forte" 
                  : activeTab === "login" 
                    ? "Log in to your workspace to continue building." 
                    : "Cadastre-se na fábrica de inteligência"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {authMode !== "forgot" && authMode !== "reset" && activeTab === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-xs tracking-wider text-[#aacbc4]">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#aacbc4]/40" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Seu nome"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10 bg-[#081f1b] border-[#095344]/30 focus:border-[#45fd94] text-white rounded-xl"
                  />
                </div>
                {nameError && <p className="text-xs text-red-400">{nameError}</p>}
              </div>
            )}

            {authMode !== "reset" && (
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs tracking-wider text-[#aacbc4]">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#aacbc4]/40" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-[#081f1b] border-[#095344]/30 focus:border-[#45fd94] text-white rounded-xl"
                    required
                  />
                </div>
                {emailError && <p className="text-xs text-red-400">{emailError}</p>}
              </div>
            )}

            {authMode !== "forgot" && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-xs tracking-wider text-[#aacbc4]">Password</Label>
                  {authMode === "login" && (
                    <button
                      type="button"
                      onClick={() => setAuthMode("forgot")}
                      className="text-xs text-[#45fd94] hover:underline"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#aacbc4]/40" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-[#081f1b] border-[#095344]/30 focus:border-[#45fd94] text-white rounded-xl"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aacbc4]/40 hover:text-[#45fd94] transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordError && <p className="text-xs text-red-400">{passwordError}</p>}
              </div>
            )}

            {authMode === "reset" && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-xs tracking-wider text-[#aacbc4]">Confirmar Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#aacbc4]/40" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 bg-[#081f1b] border-[#095344]/30 focus:border-[#45fd94] text-white rounded-xl"
                    required
                  />
                </div>
                {confirmPasswordError && <p className="text-xs text-red-400">{confirmPasswordError}</p>}
              </div>
            )}

            {authMode !== "forgot" && authMode !== "reset" && (
              <div className="flex bg-[#081f1b] border border-[#095344]/30 rounded-xl p-1 justify-around text-xs font-semibold uppercase tracking-wider mb-6">
                <button
                  type="button"
                  onClick={() => { setActiveTab("login"); setAuthMode("login"); }}
                  className={`flex-1 py-2 text-center rounded-lg transition-all ${activeTab === "login" ? "bg-[#45fd94] text-[#011612]" : "text-[#aacbc4] hover:text-white"}`}
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab("signup"); setAuthMode("signup"); }}
                  className={`flex-1 py-2 text-center rounded-lg transition-all ${activeTab === "signup" ? "bg-[#45fd94] text-[#011612]" : "text-[#aacbc4] hover:text-white"}`}
                >
                  Registrar
                </button>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-[#45fd94] hover:bg-[#30a684] text-[#011612] font-bold rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_20px_-5px_rgba(69,253,148,0.4)] transition-all active:scale-[0.98]"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#011612] border-t-transparent" />
              ) : (
                <>
                  <span>{authMode === "forgot" ? "Enviar Link" : authMode === "reset" ? "Reset Password" : activeTab === "login" ? "Enter Workspace" : "Create Account"}</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          {authMode === "forgot" && (
            <button
              onClick={() => setAuthMode("login")}
              className="w-full mt-4 text-center text-sm text-[#45fd94] hover:underline"
            >
              Voltar para o Login
            </button>
          )}

          {/* Status Indicator */}
          <div className="mt-12 flex justify-center items-center gap-3 py-2 px-4 rounded-full bg-[#095344]/10 border border-[#095344]/20 w-max mx-auto">
            <div className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#45fd94] opacity-75 animate-ping"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#45fd94]"></span>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-[#5ddcb1]">System Operational</span>
          </div>
        </div>
      </div>
    </div>
  );
}
