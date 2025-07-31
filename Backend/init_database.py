from database import engine
from models import Base  # Importo a base com todas as classes

# Crio as tabelas do models no banco de dados.
Base.metadata.create_all(bind=engine)

print("Tabelas criadas com sucesso!")