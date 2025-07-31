from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Usuario
from schemas import UsuarioCreate, UsuarioResponse
from auth import get_current_user_id
import bcrypt

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
@usuarios_router.get("/me")
def get_usuario_logado(
    usuario_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    return {
        "id": usuario.id,
        "nome_usuario": usuario.nome_usuario,
        "nome_responsavel": usuario.nome_responsavel,
        "email_responsavel": usuario.email_responsavel,
    }
