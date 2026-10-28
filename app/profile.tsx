/**
 * app/profile.tsx — Tela de Perfil do Usuário
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { File, Paths } from "expo-file-system";

import { useProfile } from "../src/hooks/useProfile";
import { CameraCapture } from "../src/components/CameraCapture";

/**
 * Tela de perfil do usuário com captura de foto.
 */
export default function ProfileScreen() {
  const router = useRouter();

  // Hook customizado que gerencia o estado do perfil no banco de dados
  const { profile, loading, saveProfile } = useProfile();
  /**
   * Estados controlados para os campos do formulário.
   * Começam vazios e são preenchidos pelo `useEffect` quando o perfil carrega.
   */
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  /**
   * Controla se a câmera está sendo exibida.
   * Quando `true`, `<CameraCapture>` é renderizado como overlay.
   */
  const [showCamera, setShowCamera] = useState(false);

  /** Indica que estamos salvando no banco (feedback visual no botão) */
  const [saving, setSaving] = useState(false);

  /**
   * Preenche os campos do formulário quando o perfil é carregado do banco.
   */
  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setEmail(profile.email);
      setPhotoUri(profile.photoUri);
    }
  }, [profile]); // Re-executa quando `profile` muda (após carregar ou salvar)

  /**
   * Processa a foto capturada pela câmera.
   
   * @param tempUri URI temporário da foto capturada (diretório cache/temporário)
   */
  const handlePhotoCapture = async (tempUri: string) => {
    try {
      // Gera um nome único usando timestamp (milissegundos desde 1970)
      const fileName = `profile-${Date.now()}.jpg`;

      /**
       * `Paths.document` é o diretório permanente do app.
       * iOS: /var/mobile/Containers/Data/Application/<UUID>/Documents/
       * Android: /data/user/0/<package>/files/
       
       */
      const destFile = new File(Paths.document, fileName);

      // Copia o arquivo do cache temporário para o diretório permanente
      new File(tempUri).copy(destFile);

      // Atualiza o estado local com o URI permanente
      setPhotoUri(destFile.uri);

      // Fecha a câmera
      setShowCamera(false);
    } catch (error) {
      console.error("Erro ao copiar foto:", error);
      Alert.alert(
        "Erro",
        "Não foi possível salvar a foto. Por favor, tente novamente.",
      );
    }
  };

  /**
   * Abre a câmera para capturar uma nova foto.
   */
  const handleOpenCamera = () => {
    setShowCamera(true);
  };

  /**
   * Fecha a câmera sem capturar foto.
   */
  const handleCloseCamera = () => {
    setShowCamera(false);
  };

  /**
   * Salva o perfil no banco de dados (cria ou atualiza).
   */
  const handleSave = async () => {
    setSaving(true);
    try {
      await saveProfile({
        name: name.trim(), // Remove espaços em branco do início/fim
        email: email.trim(),
        photoUri, // Pode ser null se não tiver foto
      });

      // Exibe confirmação de sucesso
      Alert.alert("Sucesso", "Perfil salvo com sucesso!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      Alert.alert(
        "Erro",
        "Não foi possível salvar o perfil. Por favor, tente novamente.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // ESTADO DE CARREGAMENTO
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Enquanto buscamos o perfil do banco, exibimos um spinner.
   * Isso evita o "flash" de um formulário vazio antes de preencher os dados.
   */
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text className="mt-3 text-gray-500 text-sm">Carregando perfil...</Text>
      </View>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDERIZAÇÃO DO FORMULÁRIO
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* FORMULÁRIO PRINCIPAL                                            */}
      {/* ═══════════════════════════════════════════════════════════════ */}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-gray-50"
      >
        <ScrollView
          className="flex-1"
          /**
           * IMPORTANTE: `contentContainerClassName` (não `className`!)
           * ScrollView tem duas áreas de estilo:
           * - `className`: aplica ao container que rola
           * - `contentContainerClassName`: aplica ao conteÚDO dentro

           */
          contentContainerClassName="px-4 pt-6 pb-8"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── ÁREA DE FOTO ───────────────────────────────────────── */}
          <View className="items-center mb-8">
            <TouchableOpacity
              onPress={handleOpenCamera}
              className="w-32 h-32 rounded-full bg-gray-200 items-center justify-center overflow-hidden border-4 border-white shadow-lg"
              activeOpacity={0.7}
            >
              {photoUri ? (
                /**
                 * Exibe a foto capturada.
                 * `source={{ uri }}` aceita URIs de arquivo locais:
                 * - file:///data/.../profile-123.jpg (Android)
                 * - file:///var/.../profile-123.jpg (iOS)
                 */
                <Image
                  source={{ uri: photoUri }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                /**
                 * Placeholder quando não há foto:
                 * Ícone de câmera + texto instruindo o usuário.
                 */
                <View className="items-center">
                  <Text className="text-5xl mb-1">📷</Text>
                  <Text className="text-xs text-gray-500 text-center px-2">
                    Adicionar{"\n"}Foto
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Texto de instrução abaixo da foto */}
            <Text className="text-xs text-gray-400 mt-2 text-center">
              Toque para {photoUri ? "alterar" : "capturar"} sua foto
            </Text>
          </View>

          {/* ── CAMPO DE NOME ──────────────────────────────────────── */}
          <View className="mb-5">
            <Text className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">
              Nome
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Seu nome completo"
              placeholderTextColor="#9ca3af"
              className="bg-white rounded-xl px-4 py-3 text-base text-gray-800 border border-gray-200"
              maxLength={100}
              returnKeyType="next"
              autoCapitalize="words" // Capitaliza primeira letra de cada palavra
            />
          </View>

          {/* ── CAMPO DE EMAIL ─────────────────────────────────────── */}
          <View className="mb-8">
            <Text className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">
              Email
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="seu.email@exemplo.com"
              placeholderTextColor="#9ca3af"
              className="bg-white rounded-xl px-4 py-3 text-base text-gray-800 border border-gray-200"
              maxLength={100}
              keyboardType="email-address" // Teclado otimizado para email
              autoCapitalize="none" // Não capitaliza (emails são lowercase)
              autoCorrect={false} // Desliga autocorreção (emails não são palavras)
              returnKeyType="done"
            />
          </View>

          {/* ── BOTÃO DE SALVAR ────────────────────────────────────── */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            className={`rounded-xl py-4 items-center ${
              saving ? "bg-indigo-300" : "bg-indigo-600"
            }`}
            accessibilityRole="button"
            accessibilityLabel="Salvar perfil"
          >
            {saving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white font-bold text-base">
                💾 Salvar Perfil
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* OVERLAY DE CÂMERA (renderizado condicionalmente)                */}
      {/* ═══════════════════════════════════════════════════════════════ */}

      {/**
       * Renderização condicional: só exibe CameraCapture quando showCamera=true.
       * `<CameraCapture>` usa StyleSheet.absoluteFillObject, então aparece
       * SOBRE todo o resto da tela como um modal fullscreen.
       */}
      {showCamera && (
        <CameraCapture
          onCapture={handlePhotoCapture}
          onClose={handleCloseCamera}
        />
      )}
    </>
  );
}
