from fastapi import FastAPI, Depends, HTTPException, Security, status
from fastapi.openapi.utils import get_openapi
from fastapi.openapi.models import HTTPBearer as HttpBearerModel, SecuritySchemeType
from fastapi.openapi.models import APIKeyIn
from fastapi.security import OAuth2PasswordBearer
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database import engine, SessionLocal, get_db
from models import Base, Usuario
import schemas
from utils import hash_senha, verificar_senha
from auth import criar_token, verificar_token, auth_router, get_current_user
from utils_errors import (
    erro_400_email_ja_cadastrado,
    erro_403_login_incorreto,
    erro_401_token_invalido,
    erro_404_usuario_nao_encontrado
)
from fastapi.middleware.cors import CORSMiddleware

# Inicializa app e banco
app = FastAPI()

from tarefas_routes import router as tarefas_router
app.include_router(tarefas_router)
from rotinas_routes import router as rotinas_router
app.include_router(rotinas_router)
from tarefas_rotinas_routes import router as tarefas_rotina_router
app.include_router(tarefas_rotina_router)
from estrelas_routes import router as estrelas_router
app.include_router(estrelas_router)
app.include_router(auth_router)

Base.metadata.create_all(bind=engine)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

origins = [
    "http://localhost:3000",
    "http://localhost:5173", 
    "https://projeto-rotina-visual.vercel.app",
    "https://projeto-rotina-visual-p1cg.vercel.app",
    "https://*.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Swagger com suporte ao botão "Authorize"
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="Projeto Rotina Visual",
        version="1.0.0",
        description="API com autenticação JWT para o Projeto Rotina Visual",
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "bearer": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }
    for path in openapi_schema["paths"].values():
        for method in path.values():
            method.setdefault("security", [{"bearer": []}])
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

@app.get("/")
def read_root():
    return {"message": "API do Projeto Rotina Visual está rodando!"}

@app.post("/usuarios/", response_model=schemas.UsuarioResponse)
def criar_usuario(usuario: schemas.UsuarioCreate, db: Session = Depends(get_db)):
    db_usuario = db.query(Usuario).filter(Usuario.email_responsavel == usuario.email_responsavel).first()
    if db_usuario:
        raise erro_400_email_ja_cadastrado()
    senha_criptografada = hash_senha(usuario.senha)

    novo_usuario = Usuario(
        nome_usuario=usuario.nome_usuario,
        nome_responsavel=usuario.nome_responsavel,
        email_responsavel=usuario.email_responsavel,
        senha=senha_criptografada
    )
    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)
    return novo_usuario

@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.email_responsavel == form_data.username).first()

    if not usuario or not verificar_senha(form_data.password, usuario.senha):
        raise erro_403_login_incorreto()

    token = criar_token({"sub": str(usuario.id)})
    return {"access_token": token, "token_type": "bearer"}

@app.get("/usuarios/me", tags=["Usuários"])
def get_usuario_logado(
    token: str = Depends(OAuth2PasswordBearer(tokenUrl="token")),
    db: Session = Depends(get_db)
):
    dados = verificar_token(token)

    if not dados:
        raise erro_401_token_invalido()

    usuario_id = int(dados.get("sub"))
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()

    if not usuario:
        raise erro_404_usuario_nao_encontrado()

    return {
        "id": usuario.id,
        "nome_usuario": usuario.nome_usuario,
        "nome_responsavel": usuario.nome_responsavel,
        "email_responsavel": usuario.email_responsavel
    }
