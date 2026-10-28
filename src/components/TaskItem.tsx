import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Task } from "../types/task";

// =============================================================================
// TIPOS DAS PROPS
// =============================================================================

interface TaskItemProps {
  /** A tarefa a ser exibida */
  task: Task;
  /** Callback para alternar o status de conclusão */
  onToggle: (id: number, currentCompleted: number) => void;
  /** Callback para remover a tarefa (após confirmação) */
  onDelete: (id: number) => void;
}

/**
 * Formata uma data ISO 8601 para o formato brasileiro.
 */
function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Exibe uma tarefa com suas informações e ações disponíveis.
 */
export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  // Hook de navegação do Expo Router
  const router = useRouter();

  // Converte o número do banco para boolean para facilitar a leitura do JSX
  const isCompleted = task.completed === 1;

  /**
   * Navega para a tela de formulário em modo de EDIÇÃO.

   */
  const handleEdit = () => {
    router.push(`/form?id=${task.id}`);
  };

  /**
   * Confirma e executa a exclusão da tarefa.
   */
  const handleDelete = () => {
    Alert.alert(
      "Excluir tarefa",
      `Tem certeza que deseja excluir "${task.title}"?\n\nEsta ação não pode ser desfeita.`,
      [
        {
          text: "Cancelar",
          style: "cancel", // Não faz nada — apenas fecha o Alert
        },
        {
          text: "Excluir",
          style: "destructive", // Vermelho no iOS, padrão no Android
          onPress: () => onDelete(task.id),
        },
      ],
    );
  };

  return (
    // Card com sombra leve para dar profundidade visual
    <View className="bg-white rounded-2xl mx-4 mb-3 p-4 shadow-sm flex-row items-start">
      {/* ── CHECKBOX DE CONCLUSÃO ─────────────────────────────────── */}
      <TouchableOpacity
        onPress={() => onToggle(task.id, task.completed)}
        // Círculo: verde preenchido quando concluída, apenas borda quando pendente
        className={`w-6 h-6 rounded-full border-2 mr-3 mt-1 items-center justify-center flex-shrink-0 ${
          isCompleted
            ? "bg-green-500 border-green-500"
            : "border-gray-300 bg-white"
        }`}
        accessibilityLabel={
          isCompleted ? "Marcar como pendente" : "Marcar como concluída"
        }
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isCompleted }}
      >
        {/* Marca de seleção — só visível quando concluída */}
        {isCompleted && <Text className="text-white text-xs font-bold">✓</Text>}
      </TouchableOpacity>

      {/* ── CONTEÚDO DA TAREFA ────────────────────────────────────── */}
      {/* `flex-1` faz esta View ocupar todo o espaço horizontal disponível */}
      <View className="flex-1">
        {/* Título — riscado e cinza quando concluída */}
        <Text
          className={`text-base font-semibold leading-5 ${
            isCompleted ? "line-through text-gray-400" : "text-gray-800"
          }`}
          numberOfLines={2}
        >
          {task.title}
        </Text>

        {/* Descrição — exibida apenas se existir (evita espaço vazio) */}
        {task.description ? (
          <Text
            className={`text-sm mt-1 leading-4 ${
              isCompleted ? "text-gray-300" : "text-gray-500"
            }`}
            numberOfLines={3}
          >
            {task.description}
          </Text>
        ) : null}

        {/* Data de criação formatada */}
        <Text className="text-xs text-gray-300 mt-2">
          {formatDate(task.createdAt)}
        </Text>
      </View>

      {/* ── BOTÕES DE AÇÃO ────────────────────────────────────────── */}
      <View className="flex-row gap-2 ml-2 flex-shrink-0">
        {/* Botão Editar */}
        <TouchableOpacity
          onPress={handleEdit}
          className="w-9 h-9 rounded-xl bg-indigo-50 items-center justify-center"
          accessibilityLabel={`Editar tarefa ${task.title}`}
          accessibilityRole="button"
        >
          <Text className="text-base">✏️</Text>
        </TouchableOpacity>

        {/* Botão Excluir */}
        <TouchableOpacity
          onPress={handleDelete}
          className="w-9 h-9 rounded-xl bg-red-50 items-center justify-center"
          accessibilityLabel={`Excluir tarefa ${task.title}`}
          accessibilityRole="button"
        >
          <Text className="text-base">🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
