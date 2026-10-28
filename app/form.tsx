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
} from "react-native";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";

import * as TaskRepository from "../src/database/taskRepository";

/**
 * Tela de formulário para criar ou editar uma tarefa.
 */
export default function FormScreen() {
  // Hook de navegação para voltar à tela anterior
  const router = useRouter();

  // Hook para acessar as opções do header e alterá-las dinamicamente
  const navigation = useNavigation();

  const { id } = useLocalSearchParams<{ id?: string }>();

  // Determina o modo de operação com base na presença do parâmetro `id`
  const isEditing = !!id; // !! converte qualquer valor para boolean

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(isEditing);

  /** `saving`: indica que estamos salvando no banco (feedback no botão) */
  const [saving, setSaving] = useState(false);

  /**
   * Atualiza o título do header quando o modo (criar/editar) é determinado.
   */
  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? "Editar Tarefa" : "Nova Tarefa",
    });
  }, [isEditing, navigation]);

  /**
   * Carrega os dados da tarefa existente quando em modo de edição.
   */
  useEffect(() => {
    // Se não está editando, não há nada para buscar
    if (!isEditing) return;

    async function loadTask() {
      try {
        // `Number(id)` converte o parâmetro de string para número
        const task = await TaskRepository.getTaskById(Number(id));

        if (!task) {
          Alert.alert("Erro", "Tarefa não encontrada.");
          router.back();
          return;
        }

        // Preenche os campos do formulário com os dados existentes
        setTitle(task.title);
        setDescription(task.description ?? ""); // `?? ''` converte null para string vazia
      } catch (error) {
        Alert.alert("Erro", "Não foi possível carregar a tarefa.");
        router.back();
      } finally {
        setLoading(false);
      }
    }

    loadTask();
  }, [id, isEditing, router]); // Dependências: roda novamente se qualquer um mudar

  /**
   * Valida os campos e salva a tarefa (cria ou atualiza).
   */
  const handleSave = async () => {
    const trimmedTitle = title.trim();

    // Validação: título é obrigatório
    if (!trimmedTitle) {
      Alert.alert(
        "Campo obrigatório",
        "Por favor, informe um título para a tarefa.",
      );
      return; // Interrompe a execução — não salva se o título estiver vazio
    }

    setSaving(true);
    try {
      if (isEditing) {
        // MODO EDIÇÃO: atualiza a tarefa existente
        await TaskRepository.updateTask({
          id: Number(id),
          title: trimmedTitle,
          // `|| null` converte string vazia para null (sem descrição)
          description: description.trim() || null,
        });
      } else {
        // MODO CRIAÇÃO: insere uma nova tarefa
        await TaskRepository.createTask({
          title: trimmedTitle,
          description: description.trim() || null,
        });
      }

      // Volta para a tela anterior após salvar com sucesso
      // O useFocusEffect no useTasks vai recarregar a lista
      router.back();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar a tarefa. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text className="mt-3 text-gray-500 text-sm">Carregando tarefa...</Text>
      </View>
    );
  }

  return (
    /**
     * KeyboardAvoidingView:
     * - `behavior="padding"` no iOS: adiciona padding abaixo do teclado
     * - `behavior="height"` no Android: reduz a altura do container
     * `Platform.OS` detecta o sistema operacional em tempo de execução.
     */
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-gray-50"
    >
      {/*
       * ScrollView garante que o conteúdo seja rolável em telas menores.
       * `keyboardShouldPersistTaps="handled"` permite tocar nos botões
       * dentro da ScrollView sem fechar o teclado primeiro.
       */}
      <ScrollView
        className="flex-1 px-4 pt-6"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── CAMPO DE TÍTULO ─────────────────────────────────────── */}
        <View className="mb-5">
          <Text className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">
            Título *
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Ex: Estudar React Native"
            placeholderTextColor="#9ca3af"
            className="bg-white rounded-xl px-4 py-3 text-base text-gray-800 border border-gray-200"
            maxLength={100}
            returnKeyType="next"
            // `autoFocus` abre o teclado automaticamente ao entrar na tela
            // (apenas no modo de criação)
            autoFocus={!isEditing}
          />
          {/* Contador de caracteres — ajuda o usuário a saber o limite */}
          <Text className="text-xs text-gray-400 mt-1 text-right">
            {title.length}/100
          </Text>
        </View>

        {/* ── CAMPO DE DESCRIÇÃO ──────────────────────────────────── */}
        <View className="mb-8">
          <Text className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">
            Descrição (opcional)
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Adicione detalhes sobre a tarefa..."
            placeholderTextColor="#9ca3af"
            className="bg-white rounded-xl px-4 py-3 text-base text-gray-800 border border-gray-200"
            multiline
            numberOfLines={4}
            // `textAlignVertical="top"` faz o texto começar do topo em Android
            textAlignVertical="top"
            maxLength={500}
            style={{ minHeight: 100 }} // altura mínima para campo multiline
          />
          <Text className="text-xs text-gray-400 mt-1 text-right">
            {description.length}/500
          </Text>
        </View>

        {/* ── BOTÃO PRINCIPAL DE SALVAR ───────────────────────────── */}
        {/*
         * `disabled={saving}` desabilita o botão durante o salvamento.
         */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          className={`rounded-xl py-4 items-center mb-4 ${
            saving ? "bg-indigo-300" : "bg-indigo-600"
          }`}
          accessibilityRole="button"
          accessibilityLabel={
            isEditing ? "Salvar alterações" : "Adicionar tarefa"
          }
        >
          {saving ? (
            // Spinner branco durante o salvamento
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white font-bold text-base">
              {isEditing ? "💾 Salvar Alterações" : "✅ Adicionar Tarefa"}
            </Text>
          )}
        </TouchableOpacity>

        {/* ── LINK DE CANCELAR ────────────────────────────────────── */}
        {/* Opção alternativa ao botão "voltar" do header */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="items-center py-3 mb-8"
          accessibilityRole="button"
          accessibilityLabel="Cancelar e voltar"
        >
          <Text className="text-gray-400 text-sm">Cancelar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
