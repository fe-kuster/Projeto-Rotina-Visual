from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from database import get_db
from models import EstrelaDiaria, TarefaRotina
from schemas import EstrelaDiariaResponse
from datetime import date
from auth import get_current_user_id

router = APIRouter(prefix="/estrelas-diarias", tags=["Estrelas Diárias"])

DIFICULDADE_ESTRELAS = {
    "facil": 1,
    "medio": 2,
    "dificil": 3
}

@router.post("/gerar", response_model=EstrelaDiariaResponse)
def gerar_estrelas_do_dia(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    
    hoje = date.today()

    # Verifica se já existem estrelas para hoje
    existente = db.query(EstrelaDiaria).filter_by(usuario_id=user_id, data=hoje).first()
    if existente:
        raise HTTPException(status_code=400, detail="Estrelas já registradas para hoje.")

    # Busca tarefas concluídas com join da tarefa
    tarefas_concluidas = db.query(TarefaRotina).options(
        joinedload(TarefaRotina.tarefa)
    ).filter(
        TarefaRotina.usuario_id == user_id,
        TarefaRotina.status_concluida == True
    ).all()

    if not tarefas_concluidas:
        raise HTTPException(status_code=404, detail="Nenhuma tarefa concluída encontrada para gerar estrelas.")

    # Print debug para ver se o join finalmente está funcionando (substituir por logging em produção)
    #for tr in tarefas_concluidas:
    #    print(f"Tarefa ID: {tr.tarefa_id}, dificuldade: {tr.tarefa.dificuldade if tr.tarefa else 'N/A'}")

    # Soma as estrelas cfe dificuldade da tarefa, garante que a tarefa e sua dificuldade existam. 
    total_estrelas = sum(
        DIFICULDADE_ESTRELAS.get(tr.tarefa.dificuldade.value, 0)
        for tr in tarefas_concluidas if tr.tarefa and tr.tarefa.dificuldade
    )

    nova_estrela = EstrelaDiaria(
        usuario_id=user_id,
        data=hoje,
        quantidade=total_estrelas
    )

    db.add(nova_estrela)
    db.commit()
    db.refresh(nova_estrela)

    return nova_estrela
