from sqlalchemy.orm import Session
from database import SessionLocal
from models import Tarefa

# Dicionário com os dados das tarefas a serem recriadas
tarefas_padrao = [
    {"nome": "Escovar os dentes", "dificuldade": "facil", "categoria": "Higiene"},
    {"nome": "Tomar café da manhã", "dificuldade": "facil", "categoria": "Alimentação"},
    {"nome": "Vestir-se", "dificuldade": "medio", "categoria": "Autonomia"},
    {"nome": "Ir para a Escola", "dificuldade": "dificil", "categoria": "Compromissos"},
    {"nome": "Fazer dever de casa", "dificuldade": "dificil", "categoria": "Estudos"},
    {"nome": "Tempo livre", "dificuldade": "facil", "categoria": "Lazer"},
    {"nome": "Tomar banho", "dificuldade": "medio", "categoria": "Higiene"},
    {"nome": "Jantar", "dificuldade": "facil", "categoria": "Alimentação"},
    {"nome": "Preparar para dormir", "dificuldade": "medio", "categoria": "Rotina Noturna"},
    {"nome": "Guardar os brinquedos", "dificuldade": "medio", "categoria": "Autonomia"},
    {"nome": "Ir na TO", "dificuldade": "medio", "categoria": "Terapias"},
    {"nome": "Ir na Psico", "dificuldade": "medio", "categoria": "Terapias"},
    {"nome": "Ir na Fono", "dificuldade": "medio", "categoria": "Terapias"},
    {"nome": "Fazer Exames", "dificuldade": "dificil", "categoria": "Saúde"},
    {"nome": "Ir no Médico", "dificuldade": "dificil", "categoria": "Saúde"},
    {"nome": "Ir no Dentista", "dificuldade": "dificil", "categoria": "Saúde"},
    {"nome": "Guardar o bico", "dificuldade": "dificil", "categoria": "Saúde"},
    {"nome": "Xixi no vaso", "dificuldade": "dificil", "categoria": "Higiene"},
    {"nome": "Cocô no vaso", "dificuldade": "dificil", "categoria": "Higiene"},
    {"nome": "Tomar Vacina", "dificuldade": "dificil", "categoria": "Saúde"},
]

def recriar_tarefas():
    db: Session = SessionLocal()
    try:
        for tarefa in tarefas_padrao:
            nova_tarefa = Tarefa(
                nome=tarefa["nome"],
                dificuldade=tarefa["dificuldade"],
                categoria=tarefa["categoria"],
                is_padrao=True,
                usuario_id=None
            )
            db.add(nova_tarefa)
        db.commit()
        print("✅ Tarefas recriadas com sucesso!")
    except Exception as e:
        db.rollback()
        print(f"Erro ao recriar tarefas: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    recriar_tarefas()
