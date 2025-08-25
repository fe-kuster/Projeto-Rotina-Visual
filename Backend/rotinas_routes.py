from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from database import get_db, SessionLocal
from models import Usuario, Rotina, TarefaRotina, Tarefa
from schemas import RotinaCreate, RotinaResponse
from auth import get_current_user_id
from datetime import datetime
import schemas

router = APIRouter(prefix="/rotinas", tags=["Rotinas"])

@router.post("/", response_model=RotinaResponse)
def criar_rotina(rotina_data: dict, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    #Cria uma nova rotina e associa as tarefas a ela.
    nova_rotina = Rotina(nome=rotina_data["nome"], usuario_id=user_id)
    db.add(nova_rotina)
    db.commit()
    db.refresh(nova_rotina)

    for ordem, tarefa_id in enumerate(rotina_data["tarefas"]):
        relacao = TarefaRotina(rotina_id=nova_rotina.id, tarefa_id=tarefa_id, ordem=ordem)
        db.add(relacao)

    db.commit()
    db.refresh(nova_rotina)
    return nova_rotina

@router.get("/", response_model=list[RotinaResponse])
def listar_rotinas(db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    rotinas = (
        db.query(Rotina)
        .options(joinedload(Rotina.tarefas))
        .filter(Rotina.usuario_id == user_id)
        .all()
    )
    return rotinas

@router.get("/{rotina_id}", response_model=RotinaResponse)
def obter_rotina(rotina_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    rotina = (
        db.query(Rotina)
        .options(joinedload(Rotina.tarefas_rotina).joinedload(TarefaRotina.tarefa))
        .filter(Rotina.id == rotina_id, Rotina.usuario_id == user_id)
        .first()
    )
    if not rotina:
        raise HTTPException(status_code=404, detail="Rotina não encontrada")
    
    rotina.tarefas = [tr.tarefa for tr in rotina.tarefas_rotina]
    return rotina

@router.patch("/{rotina_id}", response_model=RotinaResponse)
def atualizar_rotina(rotina_id: int, rotina_data: schemas.RotinaUpdate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    rotina = db.query(Rotina).filter(Rotina.id == rotina_id, Rotina.usuario_id == user_id).first()
    if not rotina:
        raise HTTPException(status_code=404, detail="Rotina não encontrada")

    rotina.nome = rotina_data.nome

    db.query(TarefaRotina).filter(TarefaRotina.rotina_id == rotina_id).delete()

    for ordem, tarefa_id in enumerate(rotina_data.tarefas):
        relacao = TarefaRotina(rotina_id=rotina_id, tarefa_id=tarefa_id, ordem=ordem)
        db.add(relacao)

    db.commit()

    db.refresh(rotina)

    return rotina

@router.delete("/{rotina_id}", status_code=status.HTTP_200_OK)
def delete_rotina(
    rotina_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    rotina = db.query(Rotina).filter(
        Rotina.id == rotina_id,
        Rotina.usuario_id == current_user_id
    ).first()

    if not rotina:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rotina não encontrada ou você não tem permissão para excluí-la."
        )

    db.delete(rotina)
    db.commit()
    return {"message": "Rotina excluída com sucesso!"}
