from fastapi import APIRouter, Depends, HTTPException, Security
from sqlalchemy.orm import Session
from sqlalchemy import or_
from database import get_db, SessionLocal
from models import Tarefa, Usuario
import schemas
from schemas import TarefaResponse
from auth import verificar_token
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from typing import List
from auth import get_current_user_id

router = APIRouter(tags=["Tarefas"])
security = HTTPBearer()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/tarefas/", response_model=schemas.TarefaResponse)
def criar_tarefa(tarefa: schemas.TarefaCreate, 
                 db: Session = Depends(get_db),
                 user_id: int = Depends(get_current_user_id)):
    nova_tarefa = Tarefa(
        usuario_id=user_id,
        nome=tarefa.nome,
        dificuldade=tarefa.dificuldade,
        categoria=tarefa.categoria,
        estrelas=tarefa.estrelas
    )
    db.add(nova_tarefa)
    db.commit()
    db.refresh(nova_tarefa)
    return nova_tarefa

@router.get("/tarefas/", response_model=list[schemas.TarefaResponse])
def listar_tarefas(db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    tarefas = db.query(Tarefa).filter(
        (Tarefa.usuario_id == user_id) | (Tarefa.estrelas >= 1)
    ).all()
    return tarefas

@router.get("/tarefas/{tarefa_id}", response_model=schemas.TarefaResponse)
def buscar_tarefa(tarefa_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    tarefa = db.query(Tarefa).filter(Tarefa.id == tarefa_id, Tarefa.usuario_id == user_id).first()
    if not tarefa:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")
    return tarefa

@router.put("/tarefas/{tarefa_id}", response_model=schemas.TarefaResponse)
def atualizar_tarefa(tarefa_id: int, tarefa_update: schemas.TarefaCreate, 
                     db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    tarefa = db.query(Tarefa).filter(Tarefa.id == tarefa_id, Tarefa.usuario_id == user_id).first()
    if not tarefa:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")

    tarefa.nome = tarefa_update.nome
    tarefa.dificuldade = tarefa_update.dificuldade
    tarefa.categoria = tarefa_update.categoria
    tarefa.estrelas = tarefa_update.estrelas
    db.commit()
    db.refresh(tarefa)
    return tarefa

@router.delete("/tarefas/{tarefa_id}")
def deletar_tarefa(tarefa_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    tarefa = db.query(Tarefa).filter(Tarefa.id == tarefa_id, Tarefa.usuario_id == user_id).first()
    if not tarefa:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")
    db.delete(tarefa)
    db.commit()
    return {"detail": "Tarefa deletada com sucesso"}
