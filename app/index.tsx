import React from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from "react-native";
import { useRouter, Stack } from "expo-router";

import { useTasks } from "../src/hooks/useTasks";

import { TaskItem } from "../src/components/TaskItem";
import { FilterBar } from "../src/components/FilterBar";
import { EmptyState } from "../src/components/EmptyState";

/**
 * Tela principal com a lista de tarefas.
 *
 * Toda a lógica de negócio (carregar, filtrar, toggle, deletar) está
 * encapsulada no hook `useTasks`. Este componente só cuida da UI.
 */
export default function HomeScreen() {
  const router = useRouter();

  // Desestrutura tudo que o hook expõe — veja src/hooks/useTasks.ts
  const {
    tasks,
    allTasksCount,
    pendingCount,
    completedCount,
    filter,
    loading,
    setFilter,
    toggleTask,
    removeTask,
  } = useTasks();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text className="mt-3 text-gray-500 text-sm">
          Carregando tarefas...
        </Text>
      </View>
    );
  }

  return (
    <>
      {}
      <Stack.Screen
        options={{
          headerRight: () => (
            <View className="flex-row gap-4">
              {/* Botão de Perfil */}
              <TouchableOpacity
                onPress={() => router.push("/profile")}
                accessibilityLabel="Abrir perfil"
                accessibilityRole="button"
              >
                <Text className="text-3xl">👤</Text>
              </TouchableOpacity>

              {/* Botão de Logout */}
              <TouchableOpacity
                accessibilityLabel="Sair"
                accessibilityRole="button"
              >
                <Text className="text-3xl">🚪</Text>
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      {/* `relative` é necessário para posicionar o FAB com `absolute` dentro */}
      <View className="flex-1 bg-gray-50 relative">
        {/* ── BARRA DE FILTROS ──────────────────────────────────────── */}
        <FilterBar
          activeFilter={filter}
          allCount={allTasksCount}
          pendingCount={pendingCount}
          completedCount={completedCount}
          onFilterChange={setFilter}
        />

        {/* ── LISTA DE TAREFAS ──────────────────────────────────────── */}
        {}
        <FlatList
          data={tasks}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <TaskItem task={item} onToggle={toggleTask} onDelete={removeTask} />
          )}
          ListEmptyComponent={<EmptyState filter={filter} />}
          // Quando vazia: flex:1 para o EmptyState ocupar a tela toda
          // Quando com itens: padding para não ficar colado nas bordas
          contentContainerStyle={
            tasks.length === 0
              ? { flexGrow: 1 }
              : { paddingVertical: 8, paddingBottom: 100 }
          }
          showsVerticalScrollIndicator={false}
        />

        {/* ── FAB — BOTÃO FLUTUANTE DE ADICIONAR ───────────────────── */}
        {}
        <TouchableOpacity
          onPress={() => router.push("/form")}
          className="absolute bottom-8 right-6 w-16 h-16 bg-indigo-600 rounded-full items-center justify-center shadow-lg"
          accessibilityLabel="Adicionar nova tarefa"
          accessibilityRole="button"
        >
          {/* O "+" como símbolo visual — usando `text-3xl` para tamanho grande */}
          <Text
            className="text-white text-4xl font-light"
            style={{ lineHeight: 46 }}
          >
            +
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
