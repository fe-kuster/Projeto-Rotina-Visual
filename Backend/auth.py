import os
from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi import APIRouter, Depends, HTTPException, status, Form
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import get_db
from models import Usuario
from schemas import UsuarioCreate, UsuarioResponse
import bcrypt
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACESSO_EXPIRES_MINUTES = 30

if not SECRET_KEY:
    raise RuntimeError("A variável de ambiente 'SECRET_KEY' não está definida.")


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

auth_router = APIRouter(tags=["Autenticação"])

def criar_token(dados: dict):
    payload = dados.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACESSO_EXPIRES_MINUTES)
    payload.update({"exp": expire})
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verificar_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

def get_current_user_id(token: str = Depends(oauth2_scheme)) -> int:
    payload = verificar_token(token)
    if payload is None or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return int(payload["sub"])

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Usuario:
    payload = verificar_token(token)
    if payload is None or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = int(payload["sub"])
    usuario = db.query(Usuario).filter(Usuario.id == user_id).first()

    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    return usuario

@auth_router.post("/token")
def login_para_token(
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    usuario = db.query(Usuario).filter(Usuario.email_responsavel == username).first()

    if not usuario or not bcrypt.checkpw(password.encode("utf-8"), usuario.senha.encode("utf-8")):
        raise HTTPException(status_code=403, detail="E-mail ou senha incorretos")

    token = criar_token({"sub": str(usuario.id)})
    return {"access_token": token, "token_type": "bearer"}

@auth_router.post("/usuarios/", response_model=UsuarioResponse)
def criar_usuario(usuario: UsuarioCreate, db: Session = Depends(get_db)):
    usuario_existente = db.query(Usuario).filter(
        Usuario.email_responsavel == usuario.email_responsavel
    ).first()
    if usuario_existente:
        raise HTTPException(status_code=400, detail="E-mail já cadastrado.")
    
    senha_hash = bcrypt.hashpw(usuario.senha.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    novo_usuario = Usuario(
        nome_usuario=usuario.nome_usuario,
        nome_responsavel=usuario.nome_responsavel,
        email_responsavel=usuario.email_responsavel,
        senha=senha_hash
    )
    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)
    return novo_usuario

@auth_router.get("/me", response_model=UsuarioResponse)
def get_usuario_logado(usuario: Usuario = Depends(get_current_user)):
    return usuario
