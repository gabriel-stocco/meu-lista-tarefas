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

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp, loading: authLoading } = useAuthContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert("Campos obrigatórios", "Preencha todos os campos.");
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Senha muito curta",
        "A senha deve ter pelo menos 6 caracteres.",
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        "Senhas não coincidem",
        "As senhas digitadas são diferentes.",
      );
      return;
    }

    try {
      setLoading(true);
      await signUp(email.trim(), password);
    } catch (error: any) {
      Alert.alert("Erro ao criar conta", error.message || "Tente novamente.");
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
          <View className="mb-8">
            <Text className="text-4xl font-bold text-gray-800 mb-2">
              Criar conta 🚀
            </Text>
            <Text className="text-base text-gray-600">
              Cadastre-se para começar a organizar suas tarefas
            </Text>
          </View>

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
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Confirmar senha
            </Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-800"
              placeholder="Digite a senha novamente"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            className={`rounded-xl py-4 mb-6 ${
              loading ? "bg-indigo-400" : "bg-indigo-600"
            }`}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white text-center text-base font-semibold">
                Criar conta
              </Text>
            )}
          </TouchableOpacity>

          <View className="flex-row items-center justify-center">
            <Text className="text-gray-600 text-sm">Já tem uma conta? </Text>
            <TouchableOpacity onPress={() => router.back()} disabled={loading}>
              <Text className="text-indigo-600 text-sm font-semibold">
                Entrar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
