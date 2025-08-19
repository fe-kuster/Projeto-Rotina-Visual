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
    navigate(`/editar-rotina/${id}`);
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

      if (!response.ok) {
        // Se a resposta não for bem-sucedida, mostrar o erro
        const errorText = await response.text();
        throw new Error(`Erro ao excluir rotina: ${response.status} - ${errorText}`);
      }
      // Se a exclusão for bem-sucedida, removemos a rotina da lista local
      setRotinas(rotinas.filter((r) => r.id !== id));
      alert("Rotina excluída com sucesso!");
    
    } catch (err) {
      console.error(err);
      alert(`Erro ao excluir rotina: ${err.message}`);
    }
  }

  if (carregando) return <p>Carregando suas rotinas...</p>;
  if (erro) return <p>Erro: {erro}</p>;

  return (
    <div className="pagina-suas-rotinas">
      <div className="cartao-rotinas">
        <h1 className="titulo-suas-rotinas">Escolha a rotina do dia:</h1>

        {rotinas.length > 0 ? (
          <ul className="lista-rotinas">
            {rotinas.map((rotina) => (
              <li key={rotina.id} className="item-rotina">
                <span className="nome-rotina">{rotina.nome}</span>
                <div className="container-botoes">
                  <button
                    onClick={() => navigate(`/rotina/${rotina.id}`)}
                    className="botao-acao"
                  >
                    Ver
                  </button>
                  <button
                    onClick={() => editarRotina(rotina.id)}
                    className="botao-acao"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => excluirRotina(rotina.id)}
                    className="botao-acao"
                  >
                    Excluir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mensagem-vazio">Você ainda não tem nenhuma rotina criada.</p>
        )}

        <div className="container-botao-novo">
          <button
            onClick={() => navigate("/montar-rotina")}
            className="botao-novo"
          >
            Criar nova rotina
          </button>
        </div>
      </div>
    </div>
  );
}