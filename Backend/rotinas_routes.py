from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db, SessionLocal
from models import Usuario, Rotina, TarefaRotina, Tarefa
from schemas import RotinaCreate, RotinaResponse
from auth import get_current_user_id
from datetime import datetime

router = APIRouter(prefix="/rotinas", tags=["Rotinas"])

@router.post("/", response_model=RotinaResponse)
def criar_rotina(rotina_data: dict, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    #Cria uma nova rotina e associa as tarefas a ela.
    ova_rotina = Rotina(nome=rotina_data["nome"], usuario_id=user_id)
    db.add(nova_rotina)
    db.commit()
    db.refresh(nova_rotina)

    for ordem, tarefa_id in enumerate(rotina_data["tarefas"]):
        relacao = TarefaRotina(rotina_id=nova_rotina.id, tarefa_id=tarefa_id, ordem=ordem)
        db.add(relacao)

    db.commit()
    return nova_rotina

@router.get("/", response_model=list[RotinaResponse])
def listar_rotinas(db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    rotinas = db.query(Rotina).filter(Rotina.usuario_id == user_id).all()

    resultado = []
    for rotina in rotinas:
        relacoes = (
            db.query(TarefaRotina)
            .filter(TarefaRotina.rotina_id == rotina.id)
            .order_by(TarefaRotina.ordem)
            .all()
        )
        tarefa_ids = [rel.tarefa_id for rel in relacoes]

        resultado.append({
            "id": rotina.id,
            "nome": rotina.nome,
            "usuario_id": rotina.usuario_id,
            "data_criacao": rotina.data_criacao,
            "tarefas": tarefa_ids,
        })

    return resultado

@router.get("/{rotina_id}", response_model=RotinaResponse)
def obter_rotina(rotina_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    rotina = db.query(Rotina).filter(Rotina.id == rotina_id, Rotina.usuario_id == user_id).first()
    if not rotina:
        raise HTTPException(status_code=404, detail="Rotina não encontrada")

    # Busca as tarefas associadas ordenadas pela ordem
    relacoes = (
        db.query(TarefaRotina)
        .filter(TarefaRotina.rotina_id == rotina.id)
        .order_by(TarefaRotina.ordem)
        .all()
    )
    tarefa_ids = [rel.tarefa_id for rel in relacoes]

    return {
        "id": rotina.id,
        "nome": rotina.nome,
        "usuario_id": rotina.usuario_id,
        "data_criacao": rotina.data_criacao,
        "tarefas": tarefa_ids,
    }

@router.patch("/{rotina_id}", response_model=RotinaResponse)
def atualizar_rotina(rotina_id: int, rotina_data: dict, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    rotina = db.query(Rotina).filter(Rotina.id == rotina_id, Rotina.usuario_id == user_id).first()
    if not rotina:
        raise HTTPException(status_code=404, detail="Rotina não encontrada")

    rotina.nome = rotina_data["nome"]
    db.query(TarefaRotina).filter(TarefaRotina.rotina_id == rotina_id).delete()

    for ordem, tarefa_id in enumerate(rotina_data["tarefas"]):
        relacao = TarefaRotina(rotina_id=rotina_id, tarefa_id=tarefa_id, ordem=ordem)
        db.add(relacao)

    db.commit()

    # Reconstruir a resposta com as tarefas
    relacoes = (
        db.query(TarefaRotina)
        .filter(TarefaRotina.rotina_id == rotina_id)
        .order_by(TarefaRotina.ordem)
        .all()
    )
    tarefa_ids = [rel.tarefa_id for rel in relacoes]

    return {
        "id": rotina.id,
        "nome": rotina.nome,
        "usuario_id": rotina.usuario_id,
        "data_criacao": rotina.data_criacao,
        "tarefas": tarefa_ids,
    }
