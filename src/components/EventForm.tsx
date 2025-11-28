"use client";

import { useState } from "react";
import { NexoInput, NexoTextArea } from "@/components/NexoField";

interface EventoEstudo {
  id_evento: string;
  data: string;
  dia_semana: string;
  hora_inicio: string;
  materia: string;
  cor: string;
  observacoes?: string;
}

type EventFormProps = {
  mode: "criar" | "editar";
  eventoInicial?: Partial<EventoEstudo>;
  onSubmit: (evento: Omit<EventoEstudo, "id_evento" | "dia_semana">) => void;
  onCancel: () => void;
  onDelete?: () => void;
};

export function EventForm({
  mode,
  eventoInicial,
  onSubmit,
  onCancel,
  onDelete,
}: EventFormProps) {
  const [data, setData] = useState<string>(
    eventoInicial?.data || new Date().toISOString().split("T")[0]
  );
  const [hora, setHora] = useState<string>(eventoInicial?.hora_inicio || "09:00");
  const [materia, setMateria] = useState<string>(eventoInicial?.materia || "");
  const [cor, setCor] = useState<string>(eventoInicial?.cor || "#3B82F6");
  const [observacoes, setObservacoes] = useState<string>(
    eventoInicial?.observacoes || ""
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      data,
      hora_inicio: hora,
      materia,
      cor,
      observacoes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-white text-sm font-medium mb-2">Data</label>
        <input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          className="w-full px-4 py-3 bg-[#1A1A1A] border border-gray-700 rounded-xl text-white focus:border-[#3B82F6] focus:outline-none transition-colors"
          required
        />
      </div>

      <div>
        <label className="block text-white text-sm font-medium mb-2">Hora</label>
        <input
          type="time"
          value={hora}
          onChange={(e) => setHora(e.target.value)}
          className="w-full px-4 py-3 bg-[#1A1A1A] border border-gray-700 rounded-xl text-white focus:border-[#3B82F6] focus:outline-none transition-colors"
          required
        />
      </div>

      <NexoInput
        id="evento_materia"
        label="Matéria"
        value={materia}
        onChange={setMateria}
        placeholder="Ex: Matemática"
        required
      />

      <div>
        <label className="block text-white text-sm font-medium mb-2">Cor</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={cor}
            onChange={(e) => setCor(e.target.value)}
            className="w-16 h-12 bg-[#1A1A1A] border border-gray-700 rounded-xl cursor-pointer"
          />
          <div className="flex gap-2">
            {["#3B82F6", "#22C55E", "#A855F7", "#EF4444", "#F59E0B", "#EC4899"].map(
              (color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setCor(color)}
                  className="w-8 h-8 rounded-lg border-2 border-gray-700 hover:border-white transition-colors"
                  style={{ backgroundColor: color }}
                />
              )
            )}
          </div>
        </div>
      </div>

      <NexoTextArea
        id="evento_observacoes"
        label="Observações (opcional)"
        value={observacoes}
        onChange={setObservacoes}
        placeholder="Adicione detalhes sobre o evento..."
        rows={3}
      />

      <div className="flex gap-3 pt-4">
        {mode === "editar" && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="px-4 py-3 bg-red-500/20 border border-red-500 text-red-500 rounded-xl font-medium hover:bg-red-500/30 transition-colors"
          >
            Excluir
          </button>
        )}
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 bg-[#1A1A1A] border border-gray-700 text-white rounded-xl font-medium hover:bg-[#2A2A2A] transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-3 bg-gradient-to-r from-[#3B82F6] to-[#22C55E] text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          Salvar
        </button>
      </div>
    </form>
  );
}
