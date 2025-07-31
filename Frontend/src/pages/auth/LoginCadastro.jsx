import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

export default function LoginCadastro() {
  const [modo, setModo] = useState('login'); // 'login' ou 'cadastro'
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [nomeResponsavel, setNomeResponsavel] = useState('');
  const navigate = useNavigate();

  const alternarModo = () => {
    setModo(modo === 'login' ? 'cadastro' : 'login');
    setEmail('');
    setSenha('');
    setNomeUsuario('');
    setNomeResponsavel('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (modo === 'login') {
      try {
        const formData = new URLSearchParams();
        formData.append("username", email);
        formData.append("password", senha);

        const response = await fetch("http://127.0.0.1:8000/token", {
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
        alert("Erro ao fazer login.");
      }
    } else {
      try {
        const response = await fetch("http://127.0.0.1:8000/usuarios/", {
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

        if (!response.ok) {
          throw new Error("Erro no cadastro");
        }

        alert("Cadastro realizado com sucesso!");
        setModo("login");
      } catch (err) {
        console.error(err);
        alert("Erro ao cadastrar.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">
          {modo === 'login' ? 'Entrar na sua conta' : 'Criar nova conta'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {modo === 'cadastro' && (
            <>
              <div>
                <label className="block mb-1 font-medium">Nome do usuário</label>
                <input
                  type="text"
                  value={nomeUsuario}
                  onChange={(e) => setNomeUsuario(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Nome do responsável</label>
                <input
                  type="text"
                  value={nomeResponsavel}
                  onChange={(e) => setNomeResponsavel(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                  required
                />
              </div>
            </>
          )}

          <div>
            <label className="block mb-1 font-medium">Email do responsável</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition"
          >
            {modo === 'login' ? 'Fazer login' : 'Criar conta'}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={alternarModo}
            className="text-blue-600 hover:underline text-sm"
          >
            {modo === 'login'
              ? 'Não tem uma conta? Criar conta'
              : 'Já tem conta? Fazer login'}
          </button>
        </div>
      </div>
    </div>
  );
}