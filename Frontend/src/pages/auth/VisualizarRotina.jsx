import React, { useEffect, useState, useRef} from "react";
import { useParams } from "react-router-dom";

export default function VisualizarRotina() {
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const [nomeDaRotina, setNomeDaRotina] = useState("");
  const [tarefas, setTarefas] = useState([]);
  const [concluidas, setConcluidas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const listaRef = useRef(null);

  const scrollLeft = () => {
    if (listaRef.current) {
      listaRef.current.scrollBy({
        left: -240, // Rola para a esquerda
        behavior: 'smooth',
      });
    }
  };

  const scrollRight = () => {
    if (listaRef.current) {
      listaRef.current.scrollBy({
        left: 240, // Rola para a direita
        behavior: 'smooth',
      });
    }
  };

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

      <div className="container-slider">
        {/* Botão rolagem esquerda */}
        <button onClick={scrollLeft} className="botao-slider botao-slider-esquerda">
          &#10094; {/* Ícone seta esquerda */}
        </button>

        <div className="lista-tarefas-horizontal" ref={listaRef}>
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
                    alt={tarefa.nome}
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

        {/* Botão rolagem direita */}
        <button onClick={scrollRight} className="botao-slider botao-slider-direita">
          &#10095; {/* Ícone seta direita */}
        </button>
      </div>
      
      <div className="flex justify-between items-center">
        <p className="text-lg font-semibold">
          Estrelas acumuladas: {" "}
          <span className="text-yellow-600">{estrelasGanhas}</span> ⭐
        </p>
        <button
          onClick={() => alert("Preview do céu em breve! ☁️")}
          className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600"
        >
          Ver meu céu
        </button>
      </div>
    </div>
  );
}