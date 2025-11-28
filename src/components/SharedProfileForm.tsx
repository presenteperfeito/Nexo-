"use client";

import { useState } from "react";
import { NexoInput, NexoTextArea } from "@/components/NexoField";

type SharedProfileFormProps = {
  initialName?: string;
  initialCourse?: string;
  initialGoals?: string;
  onSave?: (data: { name: string; course: string; goals: string }) => void;
};

export function SharedProfileForm({
  initialName = "",
  initialCourse = "",
  initialGoals = "",
  onSave,
}: SharedProfileFormProps) {
  const [name, setName] = useState(initialName);
  const [course, setCourse] = useState(initialCourse);
  const [goals, setGoals] = useState(initialGoals);

  const handleSave = () => {
    if (onSave) {
      onSave({ name, course, goals });
    }
  };

  return (
    <div className="space-y-4">
      <NexoInput
        label="Nome"
        value={name}
        onChange={setName}
        placeholder="Seu nome completo"
      />

      <NexoInput
        label="Curso"
        value={course}
        onChange={setCourse}
        placeholder="Ex: Medicina, Engenharia..."
      />

      <NexoTextArea
        label="Objetivos"
        value={goals}
        onChange={setGoals}
        placeholder="Descreva seus principais objetivos..."
        rows={4}
      />

      {onSave && (
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#22C55E] text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Salvar perfil
          </button>
        </div>
      )}
    </div>
  );
}
