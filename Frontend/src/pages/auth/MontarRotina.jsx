import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function MontarRotina() {
  const [tarefasDisponiveis, setTarefasDisponiveis] = useState([]);
  const [tarefasSelecionadas, setTarefasSelecionadas] = useState([]);
  const [nomeDaRotina, setNomeDaRotina] = useState("");
  const [modal, setModal] = useState({ isVisible: false, message: "", type: null, tarefaId: null });
  
    // ALTERAÇÃO: para definir a URL do backend com base no ambiente.
  const BACKEND_BASE_URL =
    process.env.NODE_ENV === "production"
      ? "https://projeto-rotina-visual-p1cg.vercel.app"
      : "http://localhost:8000";
  
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchTarefas() {
      try {
        const response = await fetch(`${BACKEND_BASE_URL}/tarefas/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        data.sort((a, b) => a.nome.localeCompare(b.nome));
        setTarefasDisponiveis(data);
      } catch (err) {
        console.error("Erro ao buscar tarefas:", err);
      }
    }

    fetchTarefas();
  }, [token]);

  // Função abrir o modal
  const abrirModal = (message, type, tarefaId = null) => {
    setModal({
      isVisible: true,
      message,
      type,
      tarefaId
    });
  };

  // Abrir modal confirmação de exclusão
  const handleExcluirClick = (tarefaId) => {
    abrirModal("Tem certeza que deseja excluir esta tarefa?", "confirmacao", tarefaId);
  };

  // Confirmar exclusão de tarefa específica
  const confirmarExclusao = async () => {
    if (!modal.tarefaId) return;

    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/tarefas/${modal.tarefaId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Erro ao excluir tarefa.");
      }
      
      setTarefasDisponiveis((prevTarefas) => 
        prevTarefas.filter((t) => t.id !== modal.tarefaId)
      );
      setTarefasSelecionadas((prevTarefas) => 
        prevTarefas.filter((t) => t.id !== modal.tarefaId)
      );
              
      abrirModal("Tarefa excluída com sucesso!", "sucesso");

      setTimeout(() => {
        setModal({ isVisible: false, message: "", type: null, tarefaId: null });
        navigate("/montar-rotina");
      }, 2000);
      
    } catch (err) {
      console.error("Erro ao excluir tarefa:", err);
      abrirModal(err.message || "Erro ao excluir tarefa.", "erro");
      
      setTimeout(() => {
        setModal({ isVisible: false, message: "", type: null, tarefaId: null });
      }, 3000);
    }
  };

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

  async function salvarRotina() {
    if (!nomeDaRotina) {
      abrirModal("Por favor, digite um nome para a rotina.", "alerta");
      return;
    }
    if (tarefasSelecionadas.length === 0) {
      abrirModal("Por favor, selecione pelo menos uma tarefa.", "alerta");
      return;
    }

    const response = await fetch(`${BACKEND_BASE_URL}/rotinas/`, {
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
      abrirModal("Rotina salva com sucesso!", "sucesso");
      setTimeout(() => {
        setModal({ isVisible: false, message: "", type: null });
        navigate("/rotina");
      }, 2000);
    } else {
      abrirModal("Erro ao salvar rotina.", "erro");
      setTimeout(() => {
        setModal({ isVisible: false, message: "", type: null });
      }, 2000);
    }
  }

  return (
    <div className="pagina-montar-rotina">
      <div className="cartao-montar-rotina">
        <button onClick={() => navigate(-1)} className="botao-voltar">
          Voltar
        </button>
        <h1 className="titulo-montar-rotina">Criar nova rotina</h1>

        {/* Nome da rotina */}
        <div className="form-field">
          <label className="input-label">Nome da rotina</label>
          <input
            type="text"
            value={nomeDaRotina}
            onChange={(e) => setNomeDaRotina(e.target.value)}
            className="input-montar-rotina"
            placeholder="Ex: Rotina da manhã"
            required
          />
        </div>

        {/* Lista tarefas c checkbox */}
        <div className="form-group">
          <h2 className="subtitulo-montar-rotina">Tarefas disponíveis</h2>
          <div className="lista-tarefas-disponiveis">
            {tarefasDisponiveis.map((tarefa) => (
              <div key={tarefa.id} className="item-tarefa-disponivel-wrapper">
                <label className="item-tarefa-disponivel">
                  <input
                    type="checkbox"
                    checked={tarefasSelecionadas.some((t) => t.id === tarefa.id)}
                    onChange={() => toggleTarefa(tarefa)}
                    className="checkbox-tarefa"
                  />
                  {tarefa.nome} – {tarefa.estrelas} ⭐
                </label>
              </div>
            ))}
          </div>


          {/* Botão nova tarefa e gerenciar */}
          <div className="container-botoes-tarefa-acao">
            <button
              onClick={() => navigate("/criar-tarefa")}
              className="botao-criar-tarefa"
            >
              Criar nova tarefa
            </button>
            <button
              onClick={() => abrirModal("", "gerenciar")}
              className="botao-gerenciar-tarefas"
            >
              Gerenciar Tarefas
            </button>
          </div>
        </div>

        {/* Pré-visualização c Drag e Drop */}
        <div className="form-group">
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
        
        {/* Botão salvar */}
        <button
          onClick={salvarRotina}
          className="botao-salvar-rotina"
        >
          Salvar rotina
        </button>
      </div>
        
      {/* --- modal único p todas situações. --- */}
      {modal.isVisible && (
        <div className="modal-overlay">
          {/* Modal de gerenciamento de tarefas */}
          {modal.type === "gerenciar" && (
            <div className="modal-container-gerenciar">
              <h3 className="subtitulo-modal">Gerenciar Tarefas</h3>
              <p>Selecione uma tarefa para excluí-la.</p>
              <div className="lista-modal-tarefas">
                {tarefasDisponiveis.map((tarefa) => (
                  <div key={tarefa.id} className="item-modal-tarefa">
                    <span>{tarefa.nome}</span>
                    <button
                      onClick={() => handleExcluirClick(tarefa.id)}
                      className="botao-excluir-tarefa"
                    >
                      Excluir
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setModal({ isVisible: false, message: "", type: null, tarefaId: null })}
                className="botao-fechar-modal"
              >
                Fechar
              </button>
            </div>
          )}

          {/* Modal de confirmação, sucesso ou erro */}
          {(modal.type === "confirmacao" || modal.type === "sucesso" || modal.type === "erro" || modal.type === "alerta") && (
            <div className="modal-container">
              <p className="modal-mensagem">{modal.message}</p>
              {modal.type === "confirmacao" ? (
                <div className="modal-confirmacao-botoes">
                  <button onClick={confirmarExclusao} className="botao-ok-confirmacao">
                    Ok
                  </button>
                  <button onClick={() => setModal({ isVisible: false, message: "", type: null, tarefaId: null })} className="botao-cancelar-confirmacao">
                    Cancelar
                  </button>
                </div>
              ) : (
                <div className="modal-confirmacao-botoes">
                  <button onClick={() => setModal({ isVisible: false, message: "", type: null, tarefaId: null })} className="botao-ok-confirmacao">
                    Ok
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
