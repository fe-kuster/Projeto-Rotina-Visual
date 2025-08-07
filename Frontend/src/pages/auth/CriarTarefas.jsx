import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CriarTarefa() {
  const [nome, setNome] = useState('');
  const [imagem, setImagem] = useState('');
  const [estrelas, setEstrelas] = useState(1);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Array de imagens sugeridas (ainda incompleto)
  const imagensSugeridas = [
    { id: 'img1', url: 'https://i.imgur.com/639ak9W.png' },
    { id: 'img2', url: 'https://i.imgur.com/TwAITLV.png' },
    { id: 'img3', url: 'https://i.imgur.com/woEnnwm.png' },
    { id: 'img4', url: 'https://i.imgur.com/j1134bL.jpeg' },
    { id: 'img5', url: 'https://i.imgur.com/Z9sUOP9.png' },
    { id: 'img6', url: 'https://i.imgur.com/ZqZGnyx.png' },
    { id: 'img7', url: 'https://i.imgur.com/mSmFRTh.png' },
    { id: 'img3', url: 'https://i.imgur.com/fdSagM4.png' },
    { id: 'img4', url: 'https://i.imgur.com/dxzpmCZ.png' },
    { id: 'img5', url: 'https://i.imgur.com/Ghuc7ye.png' },
    { id: 'img6', url: 'https://i.imgur.com/2k8H7Bm.png' },
    { id: 'img7', url: 'https://i.imgur.com/NhQ5CHn.png' },
    { id: 'img3', url: 'https://i.imgur.com/VmRDv84.png' },
    { id: 'img4', url: 'https://i.imgur.com/sS8TRqE.png' },
    { id: 'img5', url: 'https://i.imgur.com/0eFHOXq.png' },
    { id: 'img6', url: 'https://i.imgur.com/r1kd4FD.png' },
    { id: 'img7', url: 'https://i.imgur.com/C4ujVEE.png' },
    { id: 'img7', url: 'https://i.imgur.com/N5ne7eP.png' },
    { id: 'img7', url: 'https://i.imgur.com/TqF8Lkj.png' },
  ];

  async function salvarTarefa(e) {
    e.preventDefault();

    if (!nome || !imagem || !estrelas) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/tarefas/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          nome: nome,
          imagem_url: imagem,
          estrelas: estrelas
        })
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar a tarefa.");
      }

      alert("Tarefa salva com sucesso!");
      navigate("/rotina");

    } catch (error) {
      console.error("Erro:", error);
      alert(error.message);
    }
  }

  return (
    <div className="pagina-criar-tarefa">
      <div className="cartao-criar-tarefa">
        <h1 className="titulo-criar-tarefa">Criar nova tarefa</h1>
        
        <form onSubmit={salvarTarefa} className="form-criar-tarefa">
          
          {/* Campo para o nome da tarefa */}
          <div className="form-group">
            <label htmlFor="nome" className="label-criar-tarefa">Nome da tarefa:</label>
            <input
              type="text"
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="input-criar-tarefa"
              placeholder="Ex: Escovar os dentes"
            />
          </div>

          {/* Seleção de imagens */}
          <div className="form-group">
            <label className="label-criar-tarefa">Selecione uma imagem:</label>
            <div className="lista-imagens-sugeridas">
              {imagensSugeridas.map((img) => (
                <img
                  key={img.id}
                  src={img.url}
                  alt={img.id}
                  className={`imagem-sugerida ${imagem === img.url ? 'selecionada' : ''}`}
                  onClick={() => setImagem(img.url)}
                />
              ))}
            </div>
          </div>

          {/* Seleção de estrelas */}
          <div className="form-group">
            <label className="label-criar-tarefa">Selecione quantas estrelas esta tarefa vale:</label>
            <div className="lista-estrelas">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  type="button"
                  className={`botao-estrela ${estrelas === num ? 'selecionado' : ''}`}
                  onClick={() => setEstrelas(num)}
                >
                  {num} estrela{num > 1 && 's'}
                </button>
              ))}
            </div>
          </div>
          
          <div className="container-botao-salvar">
            <button type="submit" className="botao-salvar-tarefa">
              Salvar tarefa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}