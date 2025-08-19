import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

DATABASE_URL = os.environ.get("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("A variável de ambiente 'DATABASE_URL' não foi configurada. Certifique-se de adicioná-la no Vercel.")

engine = create_engine(DATABASE_URL, pool_recycle=3600)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        # 'yield' fornece a sessão do banco de dados para a rota
        yield db
    finally:
        # 'finally' garante que a conexão será fechada, mesmo se houver um erro
        db.close()