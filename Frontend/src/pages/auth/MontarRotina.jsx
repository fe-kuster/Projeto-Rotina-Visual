import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function MontarRotina() {
  const [tarefasDisponiveis, setTarefasDisponiveis] = useState([]);
  const [tarefasSelecionadas, setTarefasSelecionadas] = useState([]);
  const [nomeDaRotina, setNomeDaRotina] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Buscar tarefas do backend
  useEffect(() => {
    async function fetchTarefas() {
      try {
        const response = await fetch("http://127.0.0.1:8000/tarefas/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setTarefasDisponiveis(data);
      } catch (err) {
        console.error("Erro ao buscar tarefas:", err);
      }
    }

    fetchTarefas();
  }, [token]);

  // Adicionar ou remover tarefa selecionada
  function toggleTarefa(tarefa) {
    const existe = tarefasSelecionadas.find((t) => t.id === tarefa.id);
    if (existe) {
      setTarefasSelecionadas(tarefasSelecionadas.filter((t) => t.id !== tarefa.id));
    } else {
      setTarefasSelecionadas([...tarefasSelecionadas, tarefa]);
    }
  }

  // Reordenar tarefas arrastadas
  function onDragEnd(result) {
    if (!result.destination) return;

    const reordered = Array.from(tarefasSelecionadas);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setTarefasSelecionadas(reordered);
  }

  // Salvar rotina
  async function salvarRotina() {
    const response = await fetch("http://127.0.0.1:8000/rotinas/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        nome: nomeDaRotina,
        tarefas: tarefasSelecionadas.map((t) => t.id),
      }),
    });

    if (response.ok) {
      alert("Rotina salva!");
      navigate("/rotina");
    } else {
      alert("Erro ao salvar rotina");
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Criar nova rotina</h1>

      {/* Nome da rotina */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Nome da rotina</label>
        <input
          type="text"
          value={nomeDaRotina}
          onChange={(e) => setNomeDaRotina(e.target.value)}
          className="w-full px-3 py-2 border rounded-xl"
          placeholder="Ex: Rotina da manhã"
          required
        />
      </div>

      {/* Lista de tarefas com checkbox */}
      <div className="mb-6">
        <h2 className="font-semibold mb-2">Tarefas disponíveis</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {tarefasDisponiveis.map((tarefa) => (
            <label
              key={tarefa.id}
              className="flex items-center p-3 border rounded-xl shadow bg-white"
            >
              <input
                type="checkbox"
                checked={tarefasSelecionadas.some((t) => t.id === tarefa.id)}
                onChange={() => toggleTarefa(tarefa)}
                className="mr-3"
              />
              {tarefa.nome} – {tarefa.estrelas} ⭐
            </label>
          ))}
        </div>
        {/* Botão para criar nova tarefa */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/criar-tarefa")}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700"
          >
            Criar nova tarefa
          </button>
        </div>
      </div>

      {/* Pré-visualização com Drag and Drop */}
      <div className="mb-6">
        <h2 className="font-semibold mb-2">Ordem da rotina</h2>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="tarefas-selecionadas" direction="horizontal">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex flex-wrap gap-3 min-h-[80px] border p-4 rounded-xl bg-gray-50"
              >
                {tarefasSelecionadas.map((tarefa, index) => (
                  <Draggable
                    key={tarefa.id}
                    draggableId={tarefa.id.toString()}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="p-3 bg-blue-100 border rounded-xl shadow text-sm"
                      >
                        {tarefa.nome}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Botão de salvar */}
      <button
        onClick={salvarRotina}
        className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700"
      >
        Salvar rotina
      </button>
    </div>
  );
}
