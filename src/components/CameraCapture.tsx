import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";

interface CameraCaptureProps {
  onCapture: (uri: string) => void;

  /** Callback chamado quando o usuário fecha a câmera sem capturar */
  onClose: () => void;
}

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const [permission, requestPermission] = useCameraPermissions();

  const cameraRef = useRef<CameraView>(null);

  const [capturing, setCapturing] = useState(false);

  const handleCapture = async () => {
    if (!cameraRef.current || capturing) return;

    try {
      setCapturing(true);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7, // Balanço entre qualidade visual e tamanho do arquivo
        base64: false, // Não precisamos da string base64, só do URI do arquivo
        exif: false, // Não precisamos de metadados (economiza processamento)
      });

      if (photo?.uri) {
        onCapture(photo.uri); // Passa o URI temporário para o componente pai
      }
    } catch (error) {
      console.error("Erro ao capturar foto:", error);
      // Em produção, exiba um toast/snackbar informando o erro
    } finally {
      setCapturing(false);
    }
  };

  const handleOpenSettings = () => {
    Linking.openSettings();
  };

  // ───────────────────────────────────────────────────────────────────────
  // RENDERIZAÇÃO CONDICIONAL POR ESTADO DE PERMISSÃO
  // ───────────────────────────────────────────────────────────────────────

  /**
   * ESTADO 1: Ainda não temos informação sobre a permissão.
   */
  if (!permission) {
    return (
      <View style={styles.container}>
        <Text className="text-white text-lg">Verificando permissões...</Text>
      </View>
    );
  }

  /**
   * ESTADO 2: Permissão negada pelo usuário.
   * Exibimos uma tela explicativa e um botão para ir nas Configurações.
   */
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View className="bg-white rounded-2xl p-6 mx-6 items-center">
          <Text className="text-5xl mb-4">📷</Text>
          <Text className="text-xl font-bold text-gray-800 text-center mb-2">
            Acesso à Câmera
          </Text>
          <Text className="text-sm text-gray-600 text-center mb-6">
            Precisamos de permissão para acessar sua câmera e capturar a foto de
            perfil. Seus dados permanecem armazenados apenas no seu dispositivo.
          </Text>

          {/* Botão para solicitar permissão */}
          <TouchableOpacity
            onPress={requestPermission}
            className="bg-indigo-600 px-6 py-3 rounded-xl mb-3 w-full"
          >
            <Text className="text-white text-center font-semibold">
              Conceder Permissão
            </Text>
          </TouchableOpacity>

          {/* Botão para abrir Configurações (caso tenha negado antes) */}
          {!permission.canAskAgain && (
            <TouchableOpacity
              onPress={handleOpenSettings}
              className="bg-gray-200 px-6 py-3 rounded-xl mb-3 w-full"
            >
              <Text className="text-gray-700 text-center font-semibold">
                Abrir Configurações
              </Text>
            </TouchableOpacity>
          )}

          {/* Botão para fechar sem conceder */}
          <TouchableOpacity onPress={onClose}>
            <Text className="text-gray-500 text-sm">Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  /**
   * ESTADO 3: Permissão concedida — exibimos o preview da câmera.
   *
   * `CameraView` renderiza o feed ao vivo da câmera.
   * `ref={cameraRef}` conecta a referência para chamarmos `takePictureAsync`.
   * `facing="back"` usa a câmera traseira (mude para "front" se quiser frontal).
   */
  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back" // "back" = câmera traseira | "front" = câmera frontal
      >
        {/* Overlay com controles sobre o preview da câmera */}
        <View style={styles.controls}>
          {/* Botão de fechar no canto superior direito */}
          <View className="flex-row justify-end p-4">
            <TouchableOpacity
              onPress={onClose}
              className="bg-black/50 w-10 h-10 rounded-full items-center justify-center"
            >
              <Text className="text-white text-xl font-bold">✕</Text>
            </TouchableOpacity>
          </View>

          {/* Espaçador (flex-1 empurra o botão de captura para baixo) */}
          <View className="flex-1" />

          {/* Botão de captura na parte inferior */}
          <View className="items-center pb-10">
            <TouchableOpacity
              onPress={handleCapture}
              disabled={capturing}
              className="w-20 h-20 rounded-full bg-white border-4 border-gray-300 items-center justify-center"
              style={{ opacity: capturing ? 0.5 : 1 }}
            >
              <View className="w-16 h-16 rounded-full bg-white" />
            </TouchableOpacity>

            {capturing && (
              <Text className="text-white text-sm mt-2">Capturando...</Text>
            )}
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill, // Cobre toda a tela
    backgroundColor: "#000", // Fundo preto para a câmera
    justifyContent: "center", // Centraliza conteúdo verticalmente
    alignItems: "center", // Centraliza conteúdo horizontalmente
  },
  camera: {
    flex: 1, // Ocupa todo o espaço do container
    width: "100%",
  },
  controls: {
    flex: 1, // Permite que os controles ocupem toda a altura da câmera
    justifyContent: "space-between", // Distribui botões (topo e base)
  },
});
