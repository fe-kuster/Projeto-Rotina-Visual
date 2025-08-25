from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import TarefaRotina, Tarefa, Rotina
from schemas import TarefaRotinaCreate, TarefaRotinaResponse
from auth import get_current_user_id

router = APIRouter(prefix="/tarefas-rotina", tags=["Tarefas da Rotina"])

@router.post("/", response_model=TarefaRotinaResponse, status_code=201)
def adicionar_tarefa_rotina(
    relacao: TarefaRotinaCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    # Confere se a tarefa existe e se pertence ao usuário OU é padrão
    tarefa = db.query(Tarefa).filter(
        Tarefa.id == relacao.tarefa_id,
        (Tarefa.usuario_id == user_id) | (Tarefa.is_padrao == 1)
    ).first()

    if not tarefa:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada ou não permitida.")

    # Confere se a rotina pertence ao usuário
    rotina = db.query(Rotina).filter_by(id=relacao.rotina_id, usuario_id=user_id).first()
    if not rotina:
        raise HTTPException(status_code=404, detail="Rotina não encontrada ou não pertence ao usuário.")

    nova_relacao = TarefaRotina(**relacao.dict(), usuario_id=user_id)
    db.add(nova_relacao)
    db.commit()
    db.refresh(nova_relacao)
    return nova_relacao


@router.get("/por-rotina/{rotina_id}", response_model=list[TarefaRotinaResponse])
def listar_tarefas_de_uma_rotina(
    rotina_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    rotina = db.query(Rotina).filter_by(id=rotina_id, usuario_id=user_id).first()
    if not rotina:
        raise HTTPException(status_code=404, detail="Rotina não encontrada ou não pertence ao usuário.")

    return db.query(TarefaRotina).filter_by(rotina_id=rotina_id, usuario_id=user_id).order_by(TarefaRotina.ordem).all()

@router.delete("/{tarefa_rotina_id}", status_code=204)
def remover_tarefa_da_rotina(tarefa_rotina_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    relacao = db.query(TarefaRotina).filter(
    TarefaRotina.id == tarefa_rotina_id,
    TarefaRotina.usuario_id == user_id
).first()
    if not relacao:
        raise HTTPException(status_code=404, detail="Relação tarefa-rotina não encontrada")
    db.delete(relacao)
    db.commit()
    return

#status da tarefas da rotina:

@router.patch("/{tarefa_rotina_id}/status", response_model=TarefaRotinaResponse)
def atualizar_status_tarefa(
    tarefa_rotina_id: int,
    concluida: bool,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    tarefa_rotina = db.query(TarefaRotina).filter_by(id=tarefa_rotina_id, usuario_id=user_id).first()

    if not tarefa_rotina:
        raise HTTPException(status_code=404, detail="Tarefa da rotina não encontrada.")

    tarefa_rotina.status_concluida = concluida
    db.commit()
    db.refresh(tarefa_rotina)
    return tarefa_rotina