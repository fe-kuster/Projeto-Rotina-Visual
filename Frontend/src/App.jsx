import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginCadastro from './pages/Auth/LoginCadastro';
import SuasRotinas from './pages/Auth/SuasRotinas';
import MontarRotina from './pages/Auth/MontarRotina';
import EditarRotina from './pages/Auth/EditarRotina';
import VisualizarRotina from './pages/Auth/VisualizarRotina';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginCadastro />} />
        <Route path="/rotina" element={<SuasRotinas />} />
        <Route path="/montar-rotina" element={<MontarRotina />} />
        <Route path="/montar-rotina/:id" element={<EditarRotina />} />
        <Route path="/rotina/:id" element={<VisualizarRotina />} />
        {/* outras rotas futuras vão aqui */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
