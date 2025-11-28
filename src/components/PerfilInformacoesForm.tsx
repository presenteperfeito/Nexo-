"use client";

import { useState, useEffect } from "react";
import { NexoInput, NexoTextArea } from "@/components/NexoField";

type PerfilDados = {
  nome: string;
  curso: string;
  objetivos: string;
};

const PERFIL_STORAGE_KEY = "nexo_perfil";

export function PerfilInformacoesForm() {
  const [form, setForm] = useState<PerfilDados>({
    nome: "",
    curso: "",
    objetivos: "",
  });

  // Carregar dados salvos (se existirem) apenas uma vez
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(PERFIL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as PerfilDados;
        setForm((prev) => ({ ...prev, ...parsed }));
      } catch {
        // ignora erro de parse
      }
    }
  }, []);

  function handleChange<K extends keyof PerfilDados>(field: K, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSalvar() {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PERFIL_STORAGE_KEY, JSON.stringify(form));
    }
    // aqui você pode adicionar um toast de "Perfil salvo" se quiser
  }

  return (
    <div className="space-y-4">
      <NexoInput
        id="perfil_nome"
        label="Nome"
        value={form.nome}
        onChange={(v) => handleChange("nome", v)}
        placeholder="Seu nome completo"
      />

      <NexoInput
        id="perfil_curso"
        label="Curso"
        value={form.curso}
        onChange={(v) => handleChange("curso", v)}
        placeholder="Ex: Medicina, Engenharia..."
      />

      <NexoTextArea
        id="perfil_objetivos"
        label="Objetivos"
        value={form.objetivos}
        onChange={(v) => handleChange("objetivos", v)}
        placeholder="Descreva seus principais objetivos..."
        rows={4}
      />

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleSalvar}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#22C55E] text-white text-sm font-medium"
        >
          Salvar perfil
        </button>
      </div>
    </div>
  );
}
