from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi import APIRouter, Depends, HTTPException, status, Form
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import get_db
from models import Usuario
import bcrypt
from dotenv import load_dotenv


load_dotenv()

# Configurações
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("SECRET_KEY não configurada nas variaveis de ambiente. Verifique arquivo .env")
ALGORITHM = "HS256"
ACESSO_EXPIRES_MINUTES = 30

# OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Roteador de autenticação
auth_router = APIRouter(tags=["Autenticação"])

# Criação do token JWT
def criar_token(dados: dict):
    payload = dados.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACESSO_EXPIRES_MINUTES)
    payload.update({"exp": expire})
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

# Verificação e decodificação do token
def verificar_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

# ✅ Função 1: Retorna apenas o ID do usuário (sem consultar o banco)
def get_current_user_id(token: str = Depends(oauth2_scheme)) -> int:
    print("Token recebido:", token) 
    payload = verificar_token(token)
    if payload is None or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return int(payload["sub"])

# ✅ Função 2: Retorna o objeto completo do usuário (consulta banco)
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

# Rota de login (gera e retorna o token JWT)
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