from models import Usuario, Tarefa, Rotina, TarefaRotina, EstrelaDiaria
from database import SessionLocal
from datetime import datetime

db = SessionLocal()

# Cria usuário de teste
usuario = Usuario(
    nome_usuario="Joãozinho",
    nome_responsavel="Maria",
    email_responsavel="maria@example.com",
    senha="senha_segura"
)

# Cria rotina de teste
rotina = Rotina(
    nome="Rotina da Manhã",
    usuario=usuario
)

# Cria tarefa de teste
tarefa1 = Tarefa(
    nome="Escovar os dentes",
    imagem_url="https://imagem.com/escovar.png",
    dificuldade="facil",
    categoria="higiene",
    is_padrao=False,
    usuario=usuario
)

# Cria ligação tarefa-rotina de teste
tarefa_rotina1 = TarefaRotina(
    rotina=rotina,
    tarefa=tarefa1,
    ordem=1,
    status_concluida=False,
    usuario=usuario
)

# Cria estrela diária de teste
estrela = EstrelaDiaria(
    usuario=usuario,
    data=datetime.today().date(),
    quantidade=1
)
print("Dados inseridos com sucesso!")

# Adiciona tudo no banco
db.add(usuario)
db.add(rotina)
db.add(tarefa1)
db.add(tarefa_rotina1)
db.add(estrela)

db.commit()
db.close()