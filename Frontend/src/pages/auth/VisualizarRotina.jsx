import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function VisualizarRotina() {
  const { id } = useParams();
  const token = localStorage.getItem("token");

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

        const tarefasResp = await fetch(`http://127.0.0.1:8000/tarefas/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!tarefasResp.ok) throw new Error("Erro ao carregar tarefas");

        const todasTarefas = await tarefasResp.json();

        const tarefasOrdenadas = rotinaData.tarefas
          .map((id) => todasTarefas.find((t) => Number(t.id) === Number(id)))
          .filter(Boolean);

        setNomeDaRotina(rotinaData.nome);
        setTarefas(tarefasOrdenadas);
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
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">{nomeDaRotina}</h1>

      <div className="flex gap-4 overflow-x-auto mb-10 pb-4">
        {tarefas.map((tarefa) => (
          <div
            key={tarefa.id}
            className={`min-w-[160px] flex-shrink-0 flex flex-col items-center justify-between border rounded-xl p-4 shadow-md transition-all ${
              concluidas.includes(tarefa.id)
                ? "border-green-400 bg-green-50"
                : "bg-white"
            }`}
          >
            <div className="w-20 h-20 bg-gray-200 rounded-full mb-2 overflow-hidden">
              {tarefa.imagem_url ? (
                <img
                  src={tarefa.imagem_url}
                  alt={tarefa.nome}
                  className="object-cover w-full h-full"
                />
              ) : null}
            </div>
            <p className="text-center font-medium text-sm mb-1">
              {tarefa.nome}
            </p>
            <p className="text-yellow-500 text-sm mb-1">{tarefa.estrelas} ⭐</p>
            <button
              onClick={() => toggleConclusao(tarefa.id)}
              className={`text-sm rounded-full px-3 py-1 ${
                concluidas.includes(tarefa.id)
                  ? "bg-green-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              {concluidas.includes(tarefa.id) ? "✓ Feito" : "Fazer"}
            </button>
          </div>
        ))}
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
