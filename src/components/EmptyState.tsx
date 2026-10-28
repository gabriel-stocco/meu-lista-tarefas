import React from "react";
import { View, Text } from "react-native";
import { TaskFilter } from "../types/task";

interface EmptyStateProps {
  filter: TaskFilter;
}

const MESSAGES: Record<
  TaskFilter,
  { emoji: string; title: string; subtitle: string }
> = {
  all: {
    emoji: "📋",
    title: "Nenhuma tarefa ainda!",
    subtitle: "Toque no botão + para adicionar sua primeira tarefa.",
  },
  pending: {
    emoji: "🎉",
    title: "Tudo em dia!",
    subtitle: "Não há tarefas pendentes. Que eficiência!",
  },
  completed: {
    emoji: "⏳",
    title: "Nenhuma tarefa concluída",
    subtitle: "Conclua algumas tarefas para vê-las aqui.",
  },
};

export function EmptyState({ filter }: EmptyStateProps) {
  const { emoji, title, subtitle } = MESSAGES[filter];
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <Text className="text-6xl mb-4">{emoji}</Text>
      <Text className="text-xl font-bold text-gray-700 text-center mb-2">
        {title}
      </Text>
      <Text className="text-sm text-gray-400 text-center leading-5">
        {subtitle}
      </Text>
    </View>
  );
}
