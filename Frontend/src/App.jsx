import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginCadastro from './pages/auth/LoginCadastro';
import SuasRotinas from './pages/auth/SuasRotinas';
import MontarRotina from './pages/auth/MontarRotina';
import EditarRotina from './pages/auth/EditarRotina';
import VisualizarRotina from './pages/auth/VisualizarRotina';
import CriarTarefa from './pages/auth/CriarTarefas';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginCadastro />} />
        <Route path="/rotina" element={<SuasRotinas />} />
        <Route path="/montar-rotina" element={<MontarRotina />} />
        <Route path="/editar-rotina/:id" element={<EditarRotina />} />
        <Route path="/rotina/:id" element={<VisualizarRotina />} />
        <Route path="/criar-tarefa" element={<CriarTarefa />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
