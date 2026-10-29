import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthContext } from "../src/contexts/AuthContext";
export default function LoginScreen() {
  const router = useRouter();
  const {
    user,
    loading: authLoading,
    signIn,
    signInWithGoogle,
  } = useAuthContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Validação básica
    if (!email.trim() || !password.trim()) {
      Alert.alert("Campos obrigatórios", "Preencha email e senha.");
      return;
    }

    try {
      setLoading(true);
      await signIn(email.trim(), password);
      // Sucesso! O `_layout.tsx` redirecionará automaticamente para "/"
    } catch (error: any) {
      // Exibe o erro traduzido do Firebase
      Alert.alert("Erro ao fazer login", error.message || "Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      // O fluxo OAuth é assíncrono — o usuário verá o browser abrir
    } catch (error: any) {
      Alert.alert(
        "Erro ao fazer login com Google",
        error.message || "Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text className="mt-4 text-gray-600">Verificando autenticação...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        contentContainerClassName="flex-1"
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 bg-gray-50 px-6 justify-center">
          {/* Cabeçalho */}
          <View className="mb-8">
            <Text className="text-4xl font-bold text-gray-800 mb-2">
              Bem-vindo! 👋
            </Text>
            <Text className="text-base text-gray-600">
              Faça login para acessar suas tarefas
            </Text>
          </View>

          {/* Formulário de Email/Senha */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Email
            </Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-800"
              placeholder="seu@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Senha
            </Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-800"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          {/* Botão de Login com Email/Senha */}
          <TouchableOpacity
            className={`rounded-xl py-4 mb-4 ${
              loading ? "bg-indigo-400" : "bg-indigo-600"
            }`}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white text-center text-base font-semibold">
                Entrar
              </Text>
            )}
          </TouchableOpacity>

          {/* Divisor */}
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="mx-4 text-gray-500 text-sm">OU</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          {/* Botão de Login com Google */}
          <TouchableOpacity
            className="bg-white border border-gray-300 rounded-xl py-4 mb-6 flex-row items-center justify-center"
            onPress={handleGoogleLogin}
            disabled={loading}
          >
            <Text className="text-2xl mr-3">🔍</Text>
            <Text className="text-gray-800 text-base font-semibold">
              Entrar com Google
            </Text>
          </TouchableOpacity>

          {/* Link para Cadastro */}
          <View className="flex-row items-center justify-center">
            <Text className="text-gray-600 text-sm">Não tem uma conta? </Text>
            <TouchableOpacity
              onPress={() => router.push("/register")}
              disabled={loading}
            >
              <Text className="text-indigo-600 text-sm font-semibold">
                Cadastre-se
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
