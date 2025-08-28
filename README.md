# Rotina Visual

Aplicação web para organização de rotinas visuais voltada a crianças neuroatípicas e seus responsáveis.

## Stack
- **Frontend:** React (Vite), React Router, CSS puro  
- **Backend:** Python + FastAPI (funções serverless na Vercel)  
- **Banco:** MySQL (dev) e PostgreSQL/Neon (prod)  
- **Mídia:** Imagens otimizadas (Squoosh) e hospedadas no Imgur  
- **Auth:** JWT (sem verificação de e-mail no MVP)

## Estrutura do repositório
/docs # evidências e documentação (DER, Swagger, etc.)
/frontend # aplicação React
/backend # API FastAPI (Vercel functions)

### Backend (FastAPI)
1. Crie um `.env` com as variáveis de conexão (não comitar).
2. Instale dependências e rode:
   ```bash
   uvicorn main:app --reload

3. Documentação automática:
Swagger UI: http://localhost:8000/docs
OpenAPI: http://localhost:8000/openapi.json

Frontend (React)
bash
npm install
npm run dev

API
A API segue o padrão REST e está documentada automaticamente (OpenAPI 3.1).
Swagger UI: /docs
OpenAPI: /openapi.json

Licença
Projeto sob licença MIT. Veja LICENSE.

## Links de Produção
- Aplicação (frontend): https://projeto-rotina-visual.vercel.app/
- OpenAPI JSON: <https://projeto-rotina-visual-p1cg.vercel.app/

## Mídia
As imagens de tarefas são hospedadas no Imgur (URLs públicas salvas no banco).