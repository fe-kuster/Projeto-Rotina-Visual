import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

export default function VisualizarRotina() {
  const { id } = useParams(); 
  const token = localStorage.getItem("token"); 
  const navigate = useNavigate();
  
    // ALTERAÇÃO: para definir a URL do backend com base no ambiente.
  const BACKEND_BASE_URL =
    process.env.NODE_ENV === "production"
      ? "https://projeto-rotina-visual-p1cg.vercel.app"
      : "http://localhost:8000";

  const [nomeDaRotina, setNomeDaRotina] = useState("");
  const [tarefas, setTarefas] = useState([]);
  const [concluidas, setConcluidas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  
  const [avisoModal, setAvisoModal] = useState({ isVisible: false, message: "" });

  useEffect(() => {
    async function fetchRotina() {
      try {
        const rotinaResp = await fetch(`${BACKEND_BASE_URL}/rotinas/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!rotinaResp.ok) {
          throw new Error("Erro ao carregar rotina. Verifique a conexão com a API.");
        }

        const rotinaData = await rotinaResp.json();
        
        console.log("Resposta da API:", rotinaData);
        console.log("Tarefas recebidas:", rotinaData.tarefas);

        setNomeDaRotina(rotinaData.nome);
        setTarefas(rotinaData.tarefas || []); 
      } catch (err) {
        console.error("Erro na requisição da rotina:", err);
        setErro(err.message);
      } finally {
        setCarregando(false);
      }
    }

    if (token && id) {
      fetchRotina();
    } else {
      setErro("Token ou ID da rotina não encontrados.");
      setCarregando(false);
      navigate("/rotina");
    }
  }, [id, token, navigate]);


  function toggleConclusao(id) {
    setConcluidas((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  const estrelasGanhas = concluidas.reduce((soma, id) => {
    const tarefa = tarefas.find((t) => Number(t.id) === Number(id));
    const estrelas = Number(tarefa?.estrelas);
    return !isNaN(estrelas) ? soma + estrelas : soma;
  }, 0);

  const abrirAviso = (message) => {
    setAvisoModal({ isVisible: true, message });
  };
  
  if (carregando) return <p className="p-6">Carregando rotina...</p>;
  if (erro) return <p className="p-6 text-red-600">Erro: {erro}</p>;

  return (
    <div className="pagina-container">
      <Link to="/rotina" className="botao-voltar">
        Voltar
      </Link>
      <h1 className="titulo-rotina">{nomeDaRotina}</h1>
      <div className="lista-tarefas-horizontal">
        {tarefas.length > 0 ? (
          tarefas.map((tarefa) => (
            <div
              key={tarefa.id}
              className={`cartao-tarefa ${
                concluidas.includes(tarefa.id) ? 'cartao-tarefa-concluida' : ''
              }`}
            >
              <div className="imagem-container">
                {tarefa.imagem_url ? (
                  <img
                    src={tarefa.imagem_url}
                    alt={tarefa.alt_text}
                    className="imagem-tarefa"
                    loading= "lazy"
                  />
                ) : null}
              </div>
              <p className="nome-tarefa">{tarefa.nome}</p>
              <div className="container-estrelas-botao">
                <p className="estrelas-tarefa">{tarefa.estrelas} ⭐</p>
                <button
                  onClick={() => toggleConclusao(tarefa.id)}
                  className={`botao-conclusao ${
                    concluidas.includes(tarefa.id)
                      ? 'botao-conclusao-ativo'
                      : ''
                  }`}
                >
                  {concluidas.includes(tarefa.id) ? (
                    <>✓ Feito <span className="emoji-joinha">👍</span></>
                  ) : (
                    <>Fazer <span className="emoji-joinha">👍</span></>
                  )}
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="p-4 text-gray-500">Nenhuma tarefa encontrada para esta rotina. Verifique se a API está retornando os dados corretamente.</p>
        )}
      </div>
        
      <div className="container-info-rotina">
        <p className="texto-estrelas-acumuladas">
          Estrelas acumuladas: <span className="estrelas-acumuladas-valor">{estrelasGanhas}</span> ⭐
        </p>
        <button
          onClick={() => abrirAviso("Preview do céu em breve! ☁️")}
          className="botao-ver-ceu"
        >
          Ver meu céu
        </button>
      </div>

      {/* Modal de aviso para feedback ao usuário */}
      {avisoModal.isVisible && (
        <div className="modal-overlay">
          <div className="modal-container">
            <p className="modal-mensagem">{avisoModal.message}</p>
            <div className="modal-confirmacao-botoes">
              <button onClick={() => setAvisoModal({ isVisible: false, message: "" })} className="botao-ok-confirmacao">
                Ok
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
