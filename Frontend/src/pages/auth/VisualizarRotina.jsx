import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

// Componente para renderizar o céu com a lua e estrelas
const CeuPreview = ({ totalEstrelas }) => {
  const [estrelas, setEstrelas] = useState([]);

  useEffect(() => {
    // Função p gerar estrelas aleatoriamente
    const gerarEstrelas = () => {
      const novasEstrelas = [];
      // Só gera estrelas se o total for maior que 0
      if (totalEstrelas > 0) {
        for (let i = 0; i < totalEstrelas; i++) {
          const x = Math.random() * 95;
          const y = Math.random() * 95;
          const tamanho = Math.random() * (2 - 0.5) + 0.5;
          const delay = Math.random() * 3;
          novasEstrelas.push({ x, y, tamanho, delay });
        }
      }
      setEstrelas(novasEstrelas);
    };

    gerarEstrelas();
  }, [totalEstrelas]);

  return (
    <div className="ceu-preview-container">
      <div className="estrelas-container">
        {estrelas.map((estrela, index) => (
          <span
            key={index}
            className="estrela-simulada"
            style={{
              left: `${estrela.x}%`,
              top: `${estrela.y}%`,
              fontSize: `${estrela.tamanho}rem`,
              animationDelay: `${estrela.delay}s`,
            }}
          >
            ⭐
          </span>
        ))}
      </div>
    </div>
  );
};

export default function VisualizarRotina() {
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const BACKEND_BASE_URL =
    process.env.NODE_ENV === "production"
      ? "https://projeto-rotina-visual-p1cg.vercel.app"
      : "http://localhost:8000";

  const [nomeDaRotina, setNomeDaRotina] = useState("");
  const [tarefas, setTarefas] = useState([]);
  const [concluidas, setConcluidas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  
  const [isCeuModalVisible, setIsCeuModalVisible] = useState(false);

  useEffect(() => {
    async function fetchRotina() {
      try {
        const rotinaResp = await fetch(`${BACKEND_BASE_URL}/rotinas/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!rotinaResp.ok) {
          throw new Error("Sua rotina está vazia, volte e clique em editar para adicionar tarefas.");
        }

        const rotinaData = await rotinaResp.json();
        
        console.log("Resposta da API:", rotinaData);
        console.log("Tarefas recebidas:", rotinaData.tarefas);

        setNomeDaRotina(rotinaData.nome);
        setTarefas(rotinaData.tarefas || []); 
      } catch (err) {
        console.error("Erro na requisi\u00e7\u00e3o da rotina:", err);
        setErro(err.message);
      } finally {
          setCarregando(false);
      }
    }

    if (token && id) {
      fetchRotina();
    } else {
      setErro("Token ou ID da rotina n\u00e3o encontrados.");
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

  const abrirCeuModal = () => setIsCeuModalVisible(true);
  const fecharCeuModal = () => setIsCeuModalVisible(false);
  
  if (carregando) return <p className="loading-text">Carregando rotina...</p>;
  if (erro) return <p className="error-text">Erro: {erro}</p>;

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
                    loading="lazy"
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
          <p className="p-4 text-gray-500">Nenhuma tarefa encontrada para esta rotina. Edite sua rotina para adicionar tarefas.</p>
        )}
      </div>
      
      {/* Container pai c flexbox p organizar o céu */}
      <div className="grid-container-ceu-info">
    <div className="info-esquerda">
        <p className="texto-estrelas-acumuladas">
            Estrelas acumuladas: <span className="estrelas-acumuladas-valor">{estrelasGanhas}</span> ⭐
        </p>
    </div>

    <CeuPreview totalEstrelas={estrelasGanhas} />

    <div className="info-direita">
        <button
            onClick={abrirCeuModal}
            className="botao-ver-ceu"
        >
            Ver meu céuzinho
        </button>
    </div>
</div>

      {/* Modal do céu que aparecerá ao clicar no botão */}
      {isCeuModalVisible && (
        <div className="ceu-modal-overlay">
          <div className="ceu-modal-container">
            <button onClick={fecharCeuModal} className="botao-fechar-ceu">
              &times;
            </button>
            <div className="ceu-estrelado-modal">
              {/* Gera estrelas para o modal */}
              {Array.from({ length: estrelasGanhas }).map((_, index) => (
                <span
                  key={index}
                  className="estrela-modal"
                  style={{
                    left: `${Math.random() * 95}%`,
                    top: `${Math.random() * 95}%`,
                    fontSize: `${Math.random() * (2 - 0.5) + 0.5}rem`,
                    animationDelay: `${Math.random() * 3}s`,
                  }}
                >
                  ⭐
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}