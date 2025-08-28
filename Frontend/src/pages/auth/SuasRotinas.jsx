import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function SuasRotinas() {
  const [rotinas, setRotinas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const navigate = useNavigate();

// ALTERAÇÃO: para definir a URL do backend com base no ambiente.
  const BACKEND_BASE_URL =
    process.env.NODE_ENV === "production"
      ? "https://projeto-rotina-visual-p1cg.vercel.app"
      : "http://localhost:8000";

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate("/");
    } else {
      buscarRotinas();
    }
  }, [token, navigate]);

  async function buscarRotinas() {
    try {
      setCarregando(true);
      const response = await fetch(`${BACKEND_BASE_URL}/rotinas/`, {
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
    const result = await Swal.fire({
      title: 'Tem certeza?',
      text: "Você não poderá reverter isso!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${BACKEND_BASE_URL}/rotinas/${id}/`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Erro ao excluir rotina: ${response.status} - ${errorText}`);
        }
        
        setRotinas(rotinas.filter((r) => r.id !== id));
        
        Swal.fire(
          'Excluída!',
          'Sua rotina foi excluída com sucesso.',
          'success'
        );
      
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: `Erro ao excluir rotina: ${err.message}`,
        });
      }
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
