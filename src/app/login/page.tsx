"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase';
import { Brain } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Verificar se já está autenticado
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/');
      }
    };

    checkUser();

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Gradiente de fundo diagonal */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#1d4ed8] to-[#22c55e]" />
      
      {/* Bolhas desfocadas no fundo */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-[#1d4ed8] rounded-full opacity-20 blur-[120px] animate-pulse" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-[#8b5cf6] rounded-full opacity-20 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#22c55e] rounded-full opacity-15 blur-[90px] animate-pulse" style={{ animationDelay: '2s' }} />
      
      {/* Cartão com efeito glassmorphism */}
      <div className="relative max-w-md w-full backdrop-blur-xl bg-[#0b1120]/30 border border-cyan-400/30 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-[#007BFF] to-[#00FF88] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/50">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Nexo</h1>
          <p className="text-xl text-gray-200 mb-2">Sempre + Estudo.</p>
          <p className="text-sm text-gray-300">Entre ou crie sua conta para continuar</p>
        </div>

        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#3B82F6',
                  brandAccent: '#2563EB',
                  brandButtonText: 'white',
                  defaultButtonBackground: '#1A1A1A',
                  defaultButtonBackgroundHover: '#2A2A2A',
                  defaultButtonBorder: '#374151',
                  defaultButtonText: 'white',
                  dividerBackground: '#374151',
                  inputBackground: '#1A1A1A',
                  inputBorder: '#374151',
                  inputBorderHover: '#3B82F6',
                  inputBorderFocus: '#3B82F6',
                  inputText: 'white',
                  inputLabelText: '#D1D5DB',
                  inputPlaceholder: '#6B7280',
                  messageText: '#D1D5DB',
                  messageTextDanger: '#EF4444',
                  anchorTextColor: '#3B82F6',
                  anchorTextHoverColor: '#2563EB',
                },
                space: {
                  spaceSmall: '4px',
                  spaceMedium: '8px',
                  spaceLarge: '16px',
                  labelBottomMargin: '8px',
                  anchorBottomMargin: '4px',
                  emailInputSpacing: '4px',
                  socialAuthSpacing: '4px',
                  buttonPadding: '10px 15px',
                  inputPadding: '10px 15px',
                },
                fontSizes: {
                  baseBodySize: '14px',
                  baseInputSize: '14px',
                  baseLabelSize: '14px',
                  baseButtonSize: '14px',
                },
                borderWidths: {
                  buttonBorderWidth: '1px',
                  inputBorderWidth: '1px',
                },
                radii: {
                  borderRadiusButton: '12px',
                  buttonBorderRadius: '12px',
                  inputBorderRadius: '12px',
                },
              },
            },
            className: {
              container: 'auth-container',
              button: 'auth-button',
              input: 'auth-input',
            },
          }}
          providers={[]}
          localization={{
            variables: {
              sign_in: {
                email_label: 'E-mail',
                password_label: 'Senha',
                email_input_placeholder: 'Digite seu e-mail',
                password_input_placeholder: 'Digite sua senha',
                button_label: 'Entrar',
                loading_button_label: 'Entrando...',
                social_provider_text: 'Entrar com {{provider}}',
                link_text: 'Já tem uma conta? Entre',
              },
              sign_up: {
                email_label: 'E-mail',
                password_label: 'Senha',
                email_input_placeholder: 'Digite seu e-mail',
                password_input_placeholder: 'Digite sua senha',
                button_label: 'Criar conta',
                loading_button_label: 'Criando conta...',
                social_provider_text: 'Criar conta com {{provider}}',
                link_text: 'Não tem uma conta? Cadastre-se',
              },
              forgotten_password: {
                email_label: 'E-mail',
                password_label: 'Senha',
                email_input_placeholder: 'Digite seu e-mail',
                button_label: 'Enviar instruções',
                loading_button_label: 'Enviando...',
                link_text: 'Esqueceu sua senha?',
              },
            },
          }}
        />
      </div>
    </div>
  );
}
