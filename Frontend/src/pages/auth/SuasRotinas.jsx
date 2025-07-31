import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SuasRotinas() {
  const [rotinas, setRotinas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    buscarRotinas();
  }, [token]);

  async function buscarRotinas() {
    try {
      setCarregando(true);
      const response = await fetch("http://127.0.0.1:8000/rotinas/", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Erro ao buscar rotinas");
      }

      const data = await response.json();
      setRotinas(data);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }

  function editarRotina(id) {
    navigate(`/montar-rotina/${id}`);
  }

  async function excluirRotina(id) {
    const confirmar = window.confirm("Tem certeza que deseja excluir esta rotina?");
    if (!confirmar) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/rotinas/${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Erro ao excluir rotina");

      // Atualizar a lista após exclusão
      setRotinas(rotinas.filter((r) => r.id !== id));
    } catch (err) {
      alert("Erro ao excluir rotina.");
    }
  }

  if (carregando) return <p>Carregando suas rotinas...</p>;
  if (erro) return <p>Erro: {erro}</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Escolha a rotina do dia</h1>

      {rotinas.length > 0 ? (
        <ul className="space-y-4 mb-8">
          {rotinas.map((rotina) => (
            <li
              key={rotina.id}
              className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 border rounded-xl shadow bg-white"
            >
              <span className="font-medium text-lg mb-2 sm:mb-0">{rotina.nome}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/rotina/${rotina.id}`)}
                  className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700"
                >
                  Ver
                </button>
                <button
                  onClick={() => editarRotina(rotina.id)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-yellow-600"
                >
                  Editar
                </button>
                <button
                  onClick={() => excluirRotina(rotina.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700"
                >
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-6">Você ainda não tem nenhuma rotina criada.</p>
      )}

      {/* Botão para criar nova rotina (sempre visível) */}
      <div className="text-center">
        <button
          onClick={() => navigate("/montar-rotina")}
          className="bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700"
        >
          Criar nova rotina
        </button>
      </div>
    </div>
  );
}