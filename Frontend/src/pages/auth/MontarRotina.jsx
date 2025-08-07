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
    <div className="pagina-montar-rotina">
      <div className="cartao-montar-rotina">
         <h1 className="titulo-montar-rotina">Criar nova rotina</h1>

        {/* Nome da rotina */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Nome da rotina</label>
          <input
            type="text"
            value={nomeDaRotina}
            onChange={(e) => setNomeDaRotina(e.target.value)}
            className="input-montar-rotina"
            placeholder="Ex: Rotina da manhã"
            required
          />
        </div>

        {/* Lista de tarefas com checkbox */}
        <div className="form-group">
          <h2 className="subtitulo-montar-rotina">Tarefas disponíveis</h2>
          <div className="lista-tarefas-disponiveis">
            {tarefasDisponiveis.map((tarefa) => (
              <label
                key={tarefa.id}
                className="item-tarefa-disponivel"
              >
                <input
                  type="checkbox"
                  checked={tarefasSelecionadas.some((t) => t.id === tarefa.id)}
                  onChange={() => toggleTarefa(tarefa)}
                  className="checkbox-tarefa"
                />
                {tarefa.nome} – {tarefa.estrelas} ⭐
              </label>
            ))}
          </div>
          {/* Botão para criar nova tarefa */}
          <div className="container-botao-criar-tarefa">
            <button
              onClick={() => navigate("/criar-tarefa")}
              className="mt-4 pbotao-criar-tarefa"
            >
              Criar nova tarefa
            </button>
          </div>
        </div>

        {/* Pré-visualização com Drag and Drop */}
        <div className="form-group">
          <div className="container-botao-criar-tarefa">
            <button
              onClick={() => navigate("/criar-tarefa")}
              className="botao-criar-tarefa"
            >
              Criar nova tarefa
            </button>
          </div>
          <h2 className="subtitulo-montar-rotina">Ordem da rotina</h2>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="tarefas-selecionadas" direction="horizontal">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="area-drag-and-drop"
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
                          className="item-arrastavel"
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
          className="botao-salvar-rotina"
        >
          Salvar rotina
        </button>
      </div>
    </div>
  );
}
