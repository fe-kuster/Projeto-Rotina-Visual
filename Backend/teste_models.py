from sqlalchemy.orm import Session
from database import engine
from models import Usuario  # você pode testar outras classes depois

# Cria uma sessão de conexão com o banco
with Session(engine) as session:
    try:
        usuarios = session.query(Usuario).all()
        print("Models funcionando! Lista de usuários:")
        for usuario in usuarios:
            print(f"- {usuario.id} | {usuario.nome} | {usuario.email}")
    except Exception as e:
        print("Erro ao consultar os dados:", e)
