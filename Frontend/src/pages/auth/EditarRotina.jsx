import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function EditarRotina() {
  const [tarefasDisponiveis, setTarefasDisponiveis] = useState([]);
  const [tarefasSelecionadas, setTarefasSelecionadas] = useState([]);
  const [nomeDaRotina, setNomeDaRotina] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function carregarDados() {
      try {
        const rotinaResp = await fetch(`http://127.0.0.1:8000/rotinas/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!rotinaResp.ok) {
          throw new Error("Erro ao buscar dados da rotina");
        }

        const rotinaData = await rotinaResp.json();

        const tarefasResp = await fetch("http://127.0.0.1:8000/tarefas/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!tarefasResp.ok) {
          throw new Error("Erro ao buscar lista de tarefas");
        }

        const tarefasData = await tarefasResp.json();

        console.log("Resposta da API - rotinaData:", rotinaData);
        console.log("Resposta da API - tarefasData:", tarefasData);

        setNomeDaRotina(rotinaData.nome);
        setTarefasDisponiveis(tarefasData);

        // rotinaData.tarefas é uma lista de IDs
        const tarefasOrdenadas = Array.isArray(rotinaData.tarefas)
          ? rotinaData.tarefas
            .map((id) => tarefasData.find((t) => t.id === id))
            .filter(Boolean)
          : [];

        setTarefasSelecionadas(tarefasOrdenadas);
      } catch (err) {
        console.error("Erro ao carregar dados da rotina:", err);
        setErro(err.message);
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, [id, token]);

  function toggleTarefa(tarefa) {
    const existe = tarefasSelecionadas.find((t) => t.id === tarefa.id);
    if (existe) {
      setTarefasSelecionadas(tarefasSelecionadas.filter((t) => t.id !== tarefa.id));
    } else {
      setTarefasSelecionadas([...tarefasSelecionadas, tarefa]);
    }
  }

  function onDragEnd(result) {
    if (!result.destination) return;
    const reordered = Array.from(tarefasSelecionadas);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setTarefasSelecionadas(reordered);
  }

  async function salvarAlteracoes() {
    try {
      const response = await fetch(`http://127.0.0.1:8000/rotinas/${id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome: nomeDaRotina,
          tarefas: tarefasSelecionadas.map((t) => t.id),
        }),
      });

      if (!response.ok) {
        const erro = await response.text();
        console.error("Erro ao salvar:", erro);
        throw new Error("Erro ao salvar alterações");
      }

      alert("Rotina atualizada com sucesso!");
      navigate(`/rotina/${id}`);
    } catch (err) {
      alert(err.message);
    }
  }

  if (carregando) return <p className="p-6">Carregando rotina...</p>;
  if (erro) return <p className="p-6 text-red-600">Erro: {erro}</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Editar rotina</h1>

      {/* Nome da rotina */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Nome da rotina</label>
        <input
          type="text"
          value={nomeDaRotina}
          onChange={(e) => setNomeDaRotina(e.target.value)}
          className="w-full px-3 py-2 border rounded-xl"
        />
      </div>

      {/* Tarefas disponíveis */}
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

        {/* Criar nova tarefa */}
        <div className="mt-4">
          <button
            onClick={() => navigate("/criar-tarefa")}
            className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700"
          >
            Criar nova tarefa
          </button>
        </div>
      </div>

      {/* Ordem das tarefas */}
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

      {/* Salvar */}
      <button
        onClick={salvarAlteracoes}
        className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700"
      >
        Salvar alterações
      </button>
    </div>
  );
}
