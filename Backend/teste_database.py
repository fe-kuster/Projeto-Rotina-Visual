from database import engine

try:
    with engine.connect() as conn:
        print("Conexão com o banco de dados bem-sucedida!")
except Exception as e:
    print("Erro na conexão com o banco:", e)