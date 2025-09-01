import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function EditarRotina() {
  const [tarefasDisponiveis, setTarefasDisponiveis] = useState([]);
  const [tarefasSelecionadas, setTarefasSelecionadas] = useState([]);
  const [nomeDaRotina, setNomeDaRotina] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [modal, setModal] = useState({ isVisible: false, message: "", type: null, tarefaId: null });
  
    // ALTERAÇÃO: para definir a URL do backend com base no ambiente.
  const BACKEND_BASE_URL =
    process.env.NODE_ENV === "production"
      ? "https://projeto-rotina-visual-p1cg.vercel.app"
      : "http://localhost:8000";

  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function carregarDados() {
      try {
        const rotinaResp = await fetch(`${BACKEND_BASE_URL}/rotinas/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!rotinaResp.ok) {
          throw new Error("Erro ao buscar dados da rotina");
        }

        const rotinaData = await rotinaResp.json();

        const tarefasResp = await fetch(`${BACKEND_BASE_URL}/tarefas/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!tarefasResp.ok) {
          throw new Error("Erro ao buscar lista de tarefas");
        }

        const tarefasData = await tarefasResp.json();

        tarefasData.sort((a, b) => a.nome.localeCompare(b.nome)); 

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
  
  const abrirModal = (message, type, tarefaId = null) => {
    setModal({
      isVisible: true,
      message,
      type,
      tarefaId
    });
  };

  const handleExcluirClick = (tarefaId) => {
    abrirModal("Tem certeza que deseja excluir esta tarefa?", "confirmacao", tarefaId);
  };

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
      
    } catch (err) {
      console.error("Erro ao excluir tarefa:", err);
      // Exibe mensagem de erro
      abrirModal(err.message || "Erro ao excluir tarefa.", "erro");      
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

  function onDragEnd(result) {
    if (!result.destination) return;
    const reordered = Array.from(tarefasSelecionadas);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setTarefasSelecionadas(reordered);
  }

  async function salvarAlteracoes() {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/rotinas/${id}/`, {
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

      abrirModal("Rotina atualizada com sucesso!", "sucesso");
      
    } catch (err) {
      abrirModal(err.message, "erro");
    }
  }

  if (carregando) return <p className="p-6">Carregando rotina...</p>;
  if (erro) return <p className="p-6 text-red-600">Erro: {erro}</p>;

  return (
    <div className="pagina-editar-rotina">
      <div className="cartao-editar-rotina">
        <button onClick={() => navigate(-1)} className="botao-voltar">
          Voltar
        </button>
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

          <div className="container-botoes-tarefa-acao">
            <Link to="/criar-tarefa" className="botao-criar-tarefa">
              Criar nova tarefa
            </Link>
            <button
              onClick={() => abrirModal("", "gerenciar")}
              className="botao-gerenciar-tarefas"
            >
              Gerenciar Tarefas
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

      {modal.isVisible && (
        <div className="modal-overlay">
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

          {/* Modal confirmação, sucesso ou erro */}
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
                  <button onClick={() => {
                    setModal({ isVisible: false, message: "", type: null, tarefaId: null });
                    if (modal.type === 'sucesso') {
                      navigate(`/rotina/${id}`);
                    }
                  }} className="botao-ok-confirmacao">
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
