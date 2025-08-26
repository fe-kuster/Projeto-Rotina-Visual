import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CriarTarefa() {
  const [nome, setNome] = useState('');
  const [imagemUrl, setImagemUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [estrelas, setEstrelas] = useState(1);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const imagensSugeridas = [
    { id: 'img1', url: 'https://i.imgur.com/azbvLj2.jpeg', alt_text: 'Menina e menino felizes, sentados à mesa, tomando café da manhã composto por uma caneca, uma fatia de pão e uma laranja.'},
    { id: 'img2', url: 'https://i.imgur.com/2x1HsTE.jpeg', alt_text: 'Menina e menino sentados à mesa, almoçando bem felizes.'},
    { id: 'img3', url: 'https://i.imgur.com/yX0HSjt.jpeg', alt_text: 'Menina e menino sentados à mesa, jantando felizes.'},
    { id: 'img4', url: 'https://i.imgur.com/nX6CapZ.jpeg', alt_text: 'Menina e menino entregando o bico para a mamãe guardar, felizes pois poderão brincar sem se preocupar com os bicos.'},
    { id: 'img5', url: 'https://i.imgur.com/TV49l6c.jpeg', alt_text: 'Criança feliz no banheiro, onde vai fazer seu xixi ou cocô no vaso sanitário.'},
    { id: 'img6', url: 'https://i.imgur.com/BofZn4g.jpeg', alt_text: 'Criança corajosa sentada na cadeira da dentista, com a boca aberta para a doutora ajudar a cuidar dos dentinhos.'},
    { id: 'img7', url: 'https://i.imgur.com/DNn5Qps.jpeg', alt_text: 'Criança corajosa dentando na maca no consultório médico, esperando o doutor fazer um exame.'},
    { id: 'img8', url: 'https://i.imgur.com/yJskj4Y.jpeg', alt_text: 'Criança indo feliz para a clinica para a hora da terapia.'},
    { id: 'img9', url: 'https://i.imgur.com/O384Waj.jpeg', alt_text: 'Crianças felizes guardando os brinquedos, depois de se divertir muito.'},
    { id: 'img10', url: 'https://i.imgur.com/suMB013.jpeg', alt_text: 'Crianças prontas para dormir, já de pijama e com seus ursinhos no quarto em frente a sua cama.'},
    { id: 'img11', url: 'https://i.imgur.com/EtEenX7.jpeg', alt_text: 'Criança feliz no banheiro segurando sua toalha, pronta para a hora de tomar banho e ficar limpinha'},
    { id: 'img12', url: 'https://i.imgur.com/Fd8XhsR.jpeg', alt_text: 'Crianças felizes brincando com o que gostam, jogando jogos, videogame ou bola.'},
    { id: 'img13', url: 'https://i.imgur.com/OFq8XSh.jpeg', alt_text: 'Crianças felizes indo para a escola, com roupa da escola e suas mochilas nas costas.'},
    { id: 'img14', url: 'https://i.imgur.com/YHDgCa6.jpeg', alt_text: 'Crianças felizes se vestindo.'},
    { id: 'img15', url: 'https://i.imgur.com/JFRTarV.jpeg', alt_text: 'Menino feliz em frente a pia do banheiro, segurando sua escova e escovando os dentes, com a boca cheia de espuma.'},
    { id: 'img16', url: 'https://i.imgur.com/XjpgCvw.jpeg', alt_text: 'Menina feliz em frente a pia do banheiro, segurando sua escova e escovando os dentes, com a boca cheia de espuma.'},
    { id: 'img17', url: 'https://i.imgur.com/Axs5U9E.jpeg', alt_text: 'Menina feliz na hora de tomar vacina, braço da enfermeira segura e aplica a injeção no braço da menina. Ao lado dela, o menino já tomou sua vacina e está orgulhoso com seu curativo no braço.'},
    { id: 'img18', url: 'https://i.imgur.com/O0xXP70.jpeg', alt_text: 'Crianças felizes com seus lápis e cadernos, fazendo a lição de casa.'},
    { id: 'img19', url: 'https://i.imgur.com/1JrB1Ao.jpeg', alt_text: 'Crianças no consultório médico felizes e sem medo enquanto a doutora escuta o coração e conversa com as crianças.'},
  ];

  const handleImagemSelect = (imagemSelecionada) => {
    setImagemUrl(imagemSelecionada.url);
    setAltText(imagemSelecionada.alt_text);
  };
  

  useEffect(() => {
    if(imagemUrl) {
      console.log('O estado de imagemUrl foi atualizado para:', imagemUrl);
      console.log('O estado de altText foi atualizado para:', altText);
    }
  }, [imagemUrl, altText]);

  async function salvarTarefa(e) {
    e.preventDefault();

    if (!nome || !imagemUrl || !estrelas) {
      // Usando uma modal customizada em vez de alert()
      const modal = document.getElementById('modal-erro');
      const modalText = document.getElementById('modal-erro-text');
      modalText.textContent = "Por favor, preencha todos os campos.";
      modal.style.display = "block";
      return;
    }
    
    const payload = {
      nome: nome,
      imagem_url: imagemUrl,
      estrelas: estrelas,
      alt_text: altText
    };
    console.log('Dados enviados para a API:', payload);

    try {
      const response = await fetch("http://127.0.0.1:8000/tarefas/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar a tarefa.");
      }

      const modal = document.getElementById('modal-sucesso');
      const modalText = document.getElementById('modal-sucesso-text');
      modalText.textContent = "Tarefa salva com sucesso!";
      modal.style.display = "block";
      setTimeout(() => {
        modal.style.display = "none";
        navigate("/rotina");
      }, 2000);

    } catch (error) {
      console.error("Erro:", error);
      const modal = document.getElementById('modal-erro');
      const modalText = document.getElementById('modal-erro-text');
      modalText.textContent = error.message;
      modal.style.display = "block";
    }
  }

  const fecharModal = (id) => {
    document.getElementById(id).style.display = "none";
  };

  return (
    <div className="pagina-criar-tarefa">
      {/* Modal de sucesso */}
      <div id="modal-sucesso" className="modal">
        <div className="modal-content">
          <span className="close-button" onClick={() => fecharModal('modal-sucesso')}>&times;</span>
          <p id="modal-sucesso-text"></p>
        </div>
      </div>

      {/* Modal de erro */}
      <div id="modal-erro" className="modal">
        <div className="modal-content">
          <span className="close-button" onClick={() => fecharModal('modal-erro')}>&times;</span>
          <p id="modal-erro-text"></p>
        </div>
      </div>
      
      <div className="cartao-criar-tarefa">
        <button onClick={() => navigate(-1)} className="botao-voltar">
          Voltar
        </button>
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

          {/* Seleção imagens */}
          <div className="form-group">
            <label className="label-criar-tarefa">Selecione uma imagem:</label>
            <div className="lista-imagens-sugeridas">
              {imagensSugeridas.map((img) => (
                <img
                  key={img.id}
                  src={img.url}
                  alt={img.alt_text}
                  className={`imagem-sugerida ${imagemUrl === img.url ? 'selecionada' : ''}`}
                  onClick={() => handleImagemSelect(img)}
                />
              ))}
            </div>
          </div>

          {/* Seleção estrelas */}
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