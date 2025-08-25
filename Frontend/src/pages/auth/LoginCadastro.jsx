import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';

// teste de deploy p atualizar vercel.

export default function LoginCadastro() {
  const [modo, setModo] = useState('login'); // 'login' ou 'cadastro'
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [nomeResponsavel, setNomeResponsavel] = useState('');

  const [showPassword, setShowPassword] = useState(false);

  const [messageBoxVisible, setMessageBoxVisible] = useState(false);
  const [messageBoxText, setMessageBoxText] = useState('');

  const navigate = useNavigate();

  const alternarModo = () => {
    setModo(modo === 'login' ? 'cadastro' : 'login');
    setEmail('');
    setSenha('');
    setNomeUsuario('');
    setNomeResponsavel('');
  };

  const showMessageBox = (message) => {
    setMessageBoxText(message);
    setMessageBoxVisible(true);
  };

  const closeMessageBox = () => {
    setMessageBoxVisible(false);
    setMessageBoxText('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (modo === 'login') {
      try {
        const formData = new URLSearchParams();
        formData.append("username", email);
        formData.append("password", senha);

        const response = await fetch("https://projeto-rotina-visual-p1cg.vercel.app/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Login falhou: ${errorText}`);
        }

        const data = await response.json();
        localStorage.setItem("token", data.access_token);

        navigate("/rotina");
      } catch (err) {
        console.error(err);
        showMessageBox("Erro ao fazer login. Verifique seu email e senha.");
      }
    } else {
      try {
        const response = await fetch("https://projeto-rotina-visual-p1cg.vercel.app/usuarios/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nome_usuario: nomeUsuario,
            nome_responsavel: nomeResponsavel,
            email_responsavel: email,
            senha,
          }),
        });

        if (!response.ok) { // #ALTERAÇÃO: Corrigido o erro de sintaxe
          throw new Error("Erro no cadastro");
        }

        showMessageBox("Cadastro realizado com sucesso!");
        setModo("login");
      } catch (err) {
        console.error(err);
        showMessageBox("Erro ao cadastrar. Verifique os dados e tente novamente.");
      }
    }
  };

  // #Função visibilidade da senha
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="pagina-login-cadastro">
      <div className="cartao-login">
        <h2 className="titulo-login">
          {modo === 'login' ? 'Entrar na sua conta' : 'Criar nova conta'}
        </h2>

        <form onSubmit={handleSubmit} className="form-login">
          {modo === 'cadastro' && (
            <>
              <div className="form-group">
                <label className="label-login">Nome do usuário</label>
                <input
                  type="text"
                  value={nomeUsuario}
                  onChange={(e) => setNomeUsuario(e.target.value)}
                  className="input-login"
                  required
                />
              </div>
              <div className="form-group">
                <label className="label-login">Nome do responsável</label>
                <input
                  type="text"
                  value={nomeResponsavel}
                  onChange={(e) => setNomeResponsavel(e.target.value)}
                  className="input-login"
                  required
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label className="label-login">Email do responsável</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-login"
              required
            />
          </div>

          <div className="form-group">
            <label className="label-login">Senha</label>
            <div className="password-container">
              <input
                type={showPassword ? 'text' : 'password'}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="input-login"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={toggleShowPassword}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="botao-submit"
          >
            {modo === 'login' ? 'Fazer login' : 'Criar conta'}
          </button>
        </form>

        <div className="texto-alternar-modo">
          <button
            onClick={alternarModo}
            className="botao-alternar-modo"
          >
            {modo === 'login'
              ? 'Não tem uma conta? Criar conta'
              : 'Já tem conta? Fazer login'}
          </button>
        </div>
      </div>
      {messageBoxVisible && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p className="modal-message">{messageBoxText}</p>
            <button className="modal-close-btn" onClick={closeMessageBox}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}