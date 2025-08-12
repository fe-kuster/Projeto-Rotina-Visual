import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginCadastro from './pages/Auth/LoginCadastro';
import SuasRotinas from './pages/Auth/SuasRotinas';
import MontarRotina from './pages/Auth/MontarRotina';
import EditarRotina from './pages/Auth/EditarRotina';
import VisualizarRotina from './pages/Auth/VisualizarRotina';
import CriarTarefa from './pages/Auth/CriarTarefas';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginCadastro />} />
        <Route path="/rotina" element={<SuasRotinas />} />
        <Route path="/montar-rotina" element={<MontarRotina />} />
        <Route path="/montar-rotina/:id" element={<EditarRotina />} />
        <Route path="/rotina/:id" element={<VisualizarRotina />} />
        <Route path="/criar-tarefa" element={<CriarTarefa />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
