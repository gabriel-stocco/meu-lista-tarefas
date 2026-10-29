import { useState, useEffect, useCallback } from "react";
import {
  signInWithEmailAndPassword as firebaseSignIn,
  createUserWithEmailAndPassword as firebaseSignUp,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
  type User,
} from "firebase/auth";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { auth } from "../services/firebaseConfig";
import { AuthUser, UseAuthReturn } from "../types/auth";

/**
 * Configura o WebBrowser para fechar automaticamente após autenticação.
 */
WebBrowser.maybeCompleteAuthSession();

/**
 * Hook customizado para autenticação com Firebase.
 */
export function useAuth(): UseAuthReturn {
  /**
   * Usuário autenticado ou null se não houver sessão.

   */
  const [user, setUser] = useState<AuthUser | null>(null);

  /**
   * Indica se o estado de autenticação ainda está sendo verificado.
   */
  const [loading, setLoading] = useState(true);

  // ─────────────────────────────────────────────────────────────────
  // GOOGLE SIGN-IN (expo-auth-session)
  // ─────────────────────────────────────────────────────────────────

  /**
   * Configuração do Google OAuth usando expo-auth-session.
   */
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    // Para builds de produção (EAS), adicione:
    // iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;

      // Cria uma credencial do Google usando o id_token recebido
      const credential = GoogleAuthProvider.credential(id_token);

      // Faz login no Firebase usando a credencial do Google
      signInWithCredential(auth, credential).catch((error: any) => {
        console.error("Erro ao fazer login com Google:", error);
        alert("Erro ao fazer login com Google. Tente novamente.");
      });
    }
  }, [response]);

  /**
   * Registra o listener de mudanças no estado de autenticação.
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser: User | null) => {
        if (firebaseUser) {
          // Usuário está autenticado — mapeamos para nosso tipo
          const mappedUser: AuthUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          };
          setUser(mappedUser);
        } else {
          // Usuário não está autenticado
          setUser(null);
        }
        setLoading(false); // Verificação inicial concluída
      },
    );

    // Cleanup: remove o listener quando o componente desmonta
    return unsubscribe;
  }, []);

  /**
   * Faz login com email e senha.
   */
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      await firebaseSignIn(auth, email, password);
      // Sucesso! O onAuthStateChanged atualizará o estado automaticamente
    } catch (error: any) {
      console.error("Erro ao fazer login:", error);
      // Traduz o código de erro do Firebase para mensagem amigável
      const message = getErrorMessage(error.code);
      throw new Error(message);
    }
  }, []);

  /**
   * Cria uma nova conta com email e senha.
   */
  const signUp = useCallback(async (email: string, password: string) => {
    try {
      await firebaseSignUp(auth, email, password);
      // Sucesso! Firebase já faz login automaticamente + onAuthStateChanged atualiza estado
    } catch (error: any) {
      console.error("Erro ao criar conta:", error);
      const message = getErrorMessage(error.code);
      throw new Error(message);
    }
  }, []);

  /**
   * Inicia o fluxo de login com Google.
   */
  const signInWithGoogle = useCallback(async () => {
    if (!request) {
      alert("Configuração do Google ainda não está pronta. Aguarde...");
      return;
    }
    await promptAsync();
  }, [request, promptAsync]);

  /**
   * Faz logout, limpando a sessão do Firebase.
   */
  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
      // Sucesso! O onAuthStateChanged atualizará o estado para null
    } catch (error: any) {
      console.error("Erro ao fazer logout:", error);
      alert("Erro ao sair. Tente novamente.");
    }
  }, []);

  return {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  };
}
/**
 * Traduz códigos de erro do Firebase para mensagens amigáveis em português.
 */
function getErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    "auth/user-not-found": "Email não cadastrado.",
    "auth/wrong-password": "Senha incorreta.",
    "auth/email-already-in-use": "Este email já está em uso.",
    "auth/weak-password": "A senha deve ter pelo menos 6 caracteres.",
    "auth/invalid-email": "Email inválido.",
    "auth/too-many-requests":
      "Muitas tentativas. Tente novamente mais tarde ou redefina sua senha.",
    "auth/network-request-failed": "Erro de conexão. Verifique sua internet.",
  };

  return messages[code] || "Erro ao processar sua solicitação.";
}
