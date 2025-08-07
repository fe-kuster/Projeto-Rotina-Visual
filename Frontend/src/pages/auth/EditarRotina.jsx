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

        setNomeDaRotina(rotinaData.nome);
        setTarefasDisponiveis(tarefasData);
      
        const tarefasOrdenadas = Array.isArray(rotinaData.tarefas)
          ? rotinaData.tarefas
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
    <div className="pagina-editar-rotina">
      <div className="cartao-editar-rotina">
        <h1 className="titulo-editar-rotina">Editar rotina</h1>

        {/* Nome da rotina */}
        <div className="form-group-editar">
          <label className="label-editar-rotina">Nome da rotina</label>
          <input
            type="text"
            value={nomeDaRotina}
            onChange={(e) => setNomeDaRotina(e.target.value)}
            className="input-editar-rotina"
          />
        </div>

        {/* Tarefas disponíveis */}
        <div className="form-group-editar">
          <h2 className="subtitulo-editar-rotina">Tarefas disponíveis</h2>
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
          <div className="form-group-editar" style={{ marginTop: "1rem" }}>
            <button
              onClick={() => navigate("/criar-tarefa")}
              className="botao-criar-tarefa-editar"
            >
              Criar nova tarefa
            </button>
          </div>
        </div>

        {/* Ordem das tarefas */}
        <div className="form-group-editar">
          <h2 className="subtitulo-editar-rotina">Ordem da rotina</h2>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="tarefas-selecionadas" direction="horizontal">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="lista-ordem-rotina"
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
                          className="item-tarefa-selecionada"
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

        {/* Botão Salvar */}
        <button
          onClick={salvarAlteracoes}
          className="botao-salvar-alteracoes"
        >
          Salvar alterações
        </button>
      </div>
    </div>
  );
}