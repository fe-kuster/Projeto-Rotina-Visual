import React, { useEffect, useState, useRef} from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function VisualizarRotina() {
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  
  const [nomeDaRotina, setNomeDaRotina] = useState("");
  const [tarefas, setTarefas] = useState([]);
  const [concluidas, setConcluidas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    async function fetchRotina() {
      try {
        const rotinaResp = await fetch(`http://127.0.0.1:8000/rotinas/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!rotinaResp.ok) throw new Error("Erro ao carregar rotina");

        const rotinaData = await rotinaResp.json();

        setNomeDaRotina(rotinaData.nome);
        setTarefas(rotinaData.tarefas);
      } catch (err) {
        console.error(err);
        setErro(err.message);
      } finally {
        setCarregando(false);
      }
    }

    fetchRotina();
  }, [id, token]);

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

  if (carregando) return <p className="p-6">Carregando rotina...</p>;
  if (erro) return <p className="p-6 text-red-600">Erro: {erro}</p>;

  return (
    <div className="pagina-container">
      <h1 className="titulo-rotina">{nomeDaRotina}</h1>
      <div className="lista-tarefas-horizontal">
      {tarefas.map((tarefa) => (
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
      ))}
      </div>
        
      <div className="container-info-rotina">
        <p className="texto-estrelas-acumuladas">
          Estrelas acumuladas: <span className="estrelas-acumuladas-valor">{estrelasGanhas}</span> ⭐
        </p>
        <button
          onClick={() => alert("Preview do céu em breve! ☁️")}
          className="botao-ver-ceu"
        >
          Ver meu céu
        </button>
      </div>
    </div>
  );
}