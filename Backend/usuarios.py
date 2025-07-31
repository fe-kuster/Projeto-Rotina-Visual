from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Usuario
from schemas import UsuarioCreate, UsuarioResponse
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
import bcrypt
from auth import get_current_user

# Configuração do esquema de autenticação
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
SECRET_KEY = "minha_chave_superduper_secreta_aqui"  # mesma usada em auth.py
ALGORITHM = "HS256"

usuarios_router = APIRouter(prefix="/usuarios", tags=["Usuários"])

# Criar novo usuário
@usuarios_router.post("/", response_model=UsuarioResponse)
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

# Obter dados do usuário logado
@usuarios_router.get("/me", response_model=UsuarioResponse)
def get_usuario_logado(usuario: Usuario = Depends(get_current_user)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        usuario_id: int = int(payload.get("sub"))
        if usuario_id is None:
            raise HTTPException(status_code=401, detail="Token inválido")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    return usuario
