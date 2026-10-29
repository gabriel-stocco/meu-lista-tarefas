import "../global.css";

import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuthContext } from "../src/contexts/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const { user, loading } = useAuthContext();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      // Ainda verificando o estado de autenticação inicial — não redireciona
      return;
    }

    // Verifica se a rota atual é de autenticação (login ou register)
    const inAuthGroup = segments[0] === "login" || segments[0] === "register";

    if (!user && !inAuthGroup) {
      // Usuário NÃO logado tentando acessar rota protegida → redireciona para login
      router.replace("/login");
    } else if (user && inAuthGroup) {
      // Usuário JÁ logado tentando acessar login/register → redireciona para home
      router.replace("/");
    }
  }, [user, loading, segments]);

  return (
    <Stack
      screenOptions={{
        // Cor de fundo do header — mesma em todas as telas
        headerStyle: { backgroundColor: "#4f46e5" }, // indigo-600

        // Cor do texto e ícones do header (título, botão voltar)
        headerTintColor: "#ffffff",

        // Estilo do título no header
        headerTitleStyle: { fontWeight: "bold" },

        // Cor de fundo da área de conteúdo (abaixo do header)
        contentStyle: { backgroundColor: "#f9fafb" }, // gray-50
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "📋 Minhas Tarefas",
        }}
      />
      <Stack.Screen
        name="form"
        options={{
          // Título padrão — sobrescrito dinamicamente em app/form.tsx
          // usando `navigation.setOptions({ title: '...' })`
          title: "Nova Tarefa",
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          title: "👤 Meu Perfil",
        }}
      />
      <Stack.Screen
        name="login"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
