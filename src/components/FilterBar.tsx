import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { TaskFilter } from "../types/task";

// =============================================================================
// TIPOS
// =============================================================================

interface FilterBarProps {
  /** Filtro atualmente ativo */
  activeFilter: TaskFilter;
  /** Contagem total de tarefas (para o badge "Todas") */
  allCount: number;
  /** Contagem de tarefas pendentes */
  pendingCount: number;
  /** Contagem de tarefas concluídas */
  completedCount: number;
  /** Callback chamado quando o usuário troca de filtro */
  onFilterChange: (filter: TaskFilter) => void;
}

/** Props do botão individual de filtro (uso interno) */
interface FilterButtonProps {
  label: string;
  count: number;
  isActive: boolean;
  onPress: () => void;
}

// =============================================================================
// SUB-COMPONENTE INTERNO
// =============================================================================

/**
 * Botão individual de filtro.
 *
 * Componente puro (sem estado próprio) — recebe tudo via props.
 * Componentes puros são mais fáceis de testar e reutilizar.
 *
 * Não exportado: é um detalhe de implementação de FilterBar.
 */
function FilterButton({ label, count, isActive, onPress }: FilterButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      // Estilo condicional: fundo ativo (índigo) vs. transparente
      className={`flex-1 items-center py-2 px-1 rounded-lg ${
        isActive ? "bg-indigo-600" : "bg-transparent"
      }`}
      // accessibilityLabel melhora a experiência com leitores de tela (acessibilidade)
      accessibilityLabel={`Filtrar por ${label}: ${count} tarefa${count !== 1 ? "s" : ""}`}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
    >
      {/* Rótulo do filtro */}
      <Text
        className={`text-xs font-semibold ${
          isActive ? "text-white" : "text-gray-500"
        }`}
      >
        {label}
      </Text>

      {/* Badge com a contagem */}
      <Text
        className={`text-xs font-bold mt-0.5 ${
          isActive ? "text-indigo-200" : "text-gray-400"
        }`}
      >
        {count}
      </Text>
    </TouchableOpacity>
  );
}

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

/**
 * Barra de filtros com três opções: Todas, Pendentes e Concluídas.
 * Exibe a contagem de tarefas em cada categoria como badge.
 */
export function FilterBar({
  activeFilter,
  allCount,
  pendingCount,
  completedCount,
  onFilterChange,
}: FilterBarProps) {
  return (
    // Container com fundo cinza claro e cantos arredondados — visual de "pill group"
    <View className="flex-row bg-gray-100 rounded-xl p-1 mx-4 mb-4 mt-3">
      <FilterButton
        label="Todas"
        count={allCount}
        isActive={activeFilter === "all"}
        onPress={() => onFilterChange("all")}
      />
      <FilterButton
        label="Pendentes"
        count={pendingCount}
        isActive={activeFilter === "pending"}
        onPress={() => onFilterChange("pending")}
      />
      <FilterButton
        label="Concluídas"
        count={completedCount}
        isActive={activeFilter === "completed"}
        onPress={() => onFilterChange("completed")}
      />
    </View>
  );
}
