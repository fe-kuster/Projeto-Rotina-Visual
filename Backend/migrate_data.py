import os
import csv
import enum
from datetime import datetime, date
from sqlalchemy import create_engine, Column, Integer, String, Boolean, ForeignKey, Enum, DateTime, Date
from sqlalchemy.orm import sessionmaker, relationship, declarative_base
from sqlalchemy.exc import IntegrityError
from sqlalchemy.sql import text
from dotenv import load_dotenv

load_dotenv()
MYSQL_DATABASE_URL = os.getenv("MYSQL_DATABASE_URL")
if not MYSQL_DATABASE_URL:
    raise ValueError("A variável de ambiente MYSQL_DATABASE_URL não está definida. Verifique seu arquivo .env.")

NEON_DATABASE_URL = os.getenv("DATABASE_URL")
if not NEON_DATABASE_URL:
    raise ValueError("A variável de ambiente DATABASE_URL não está definida.")

Base = declarative_base()

class DificuldadeEnum(enum.Enum):
    """
    Enumeração para os níveis de dificuldade das tarefas.
    """
    FACIL = "FACIL"
    MEDIO = "MEDIO"
    DIFICIL = "DIFICIL"
    MUITO_DIFICIL = "MUITO_DIFICIL"


class Usuario(Base):
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key=True, index=True)
    nome_usuario = Column(String(100), nullable=False)
    nome_responsavel = Column(String(100), nullable=False)
    email_responsavel = Column(String(150), unique=True, nullable=False)
    senha = Column(String(255), nullable=False)
    rotinas = relationship("Rotina", back_populates="usuario", cascade="all, delete-orphan")
    tarefas = relationship("Tarefa", back_populates="usuario", cascade="all, delete-orphan")
    estrelas_diarias = relationship("EstrelaDiaria", back_populates="usuario", cascade="all, delete-orphan")
    tarefas_rotina = relationship("TarefaRotina", back_populates="usuario", cascade="all, delete-orphan")

class Rotina(Base):
    __tablename__ = "rotinas"
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    nome = Column(String(100), nullable=False)
    data_criacao = Column(DateTime, nullable=False, default=datetime.now)
    usuario = relationship("Usuario", back_populates="rotinas")
    tarefas_rotina = relationship("TarefaRotina", back_populates="rotina", 
                                  order_by="TarefaRotina.ordem", cascade="all, delete-orphan")
    tarefas = relationship("Tarefa", secondary=lambda: TarefaRotina.__table__, 
                           primaryjoin=lambda: Rotina.id == TarefaRotina.rotina_id, 
                           secondaryjoin=lambda: Tarefa.id == TarefaRotina.tarefa_id, 
                           order_by=lambda: TarefaRotina.ordem, lazy="joined", overlaps="tarefas_rotina")

class Tarefa(Base):
    __tablename__ = "tarefas"
    id = Column(Integer, primary_key=True, autoincrement=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    nome = Column(String(100), nullable=False)
    imagem_url = Column(String(255))
    dificuldade = Column(Enum(DificuldadeEnum), nullable=False)
    categoria = Column(String(50))
    estrelas = Column(Integer, nullable=False, default=1)
    alt_text = Column(String(255))
    usuario = relationship("Usuario", back_populates="tarefas")
    tarefas_rotina = relationship("TarefaRotina", back_populates="tarefa", cascade="all, delete-orphan")

class TarefaRotina(Base):
    __tablename__ = "tarefas_rotina"
    id = Column(Integer, primary_key=True, autoincrement=True)
    rotina_id = Column(Integer, ForeignKey("rotinas.id"), nullable=False)
    tarefa_id = Column(Integer, ForeignKey("tarefas.id"), nullable=False)
    ordem = Column(Integer)
    status_concluida = Column(Boolean, default=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    rotina = relationship("Rotina", back_populates="tarefas_rotina", overlaps="tarefas")
    tarefa = relationship("Tarefa", back_populates="tarefas_rotina", overlaps="tarefas")
    usuario = relationship("Usuario", back_populates="tarefas_rotina")

class EstrelaDiaria(Base):
    __tablename__ = "estrelas_diarias"
    id = Column(Integer, primary_key=True, autoincrement=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    data = Column(Date, nullable=False)
    quantidade = Column(Integer, nullable=False)
    usuario = relationship("Usuario", back_populates="estrelas_diarias")

# SCRIPT MIGRAÇÃO COMPLETO

if __name__ == "__main__":
    
    CSV_PATH = "tarefas para recriar.csv"
    
    try:
        mysql_engine = create_engine(MYSQL_DATABASE_URL)
        neon_engine = create_engine(NEON_DATABASE_URL)
        
        SessionMySQL = sessionmaker(bind=mysql_engine)
        SessionNeon = sessionmaker(bind=neon_engine)

        mysql_session = SessionMySQL()
        neon_session = SessionNeon()

        old_user_id_map = {}
        old_task_id_map = {}
        old_routine_id_map = {}
        
        # 1. Encontra ou cria usuário do sistema no Neon
        print("Buscando ou criando o usuário 'Sistema' no banco de dados Neon...")
        sistema_user = neon_session.query(Usuario).filter_by(email_responsavel="sistema@app.com").first()

        if not sistema_user:
            sistema_user = Usuario(
                nome_usuario="Sistema",
                nome_responsavel="Sistema",
                email_responsavel="sistema@app.com",
                senha="uma_senha_muito_segura_e_longa_que_nao_devera_ser_usada_por_usuarios_reais"
            )
            neon_session.add(sistema_user)
            neon_session.flush() 
            print("Usuário 'Sistema' criado com sucesso!")
        else:
            print("Usuário 'Sistema' já existe. Usando o ID existente.")
        
        sistema_user_id = sistema_user.id

        # 2. Migração tabelas do MySQL para Neon
        
        print("\nIniciando migração da tabela 'usuarios' do MySQL para o Neon...")
        usuarios_mysql = mysql_session.query(Usuario).all()
        for usuario_mysql in usuarios_mysql:
            try:
                # Cria um novo objeto, ignorando o ID original
                novo_usuario = Usuario(
                    nome_usuario=usuario_mysql.nome_usuario,
                    nome_responsavel=usuario_mysql.nome_responsavel,
                    email_responsavel=usuario_mysql.email_responsavel,
                    senha=usuario_mysql.senha
                )
                neon_session.add(novo_usuario)
                neon_session.flush()
                old_user_id_map[usuario_mysql.id] = novo_usuario.id
            except IntegrityError:
                neon_session.rollback()
                print(f"Aviso: Usuário com email '{usuario_mysql.email_responsavel}' já existe no Neon. Pulando.")
                continue
        print(f"Migração de {len(old_user_id_map)} usuários concluída. Mapa de IDs criado.")

        print("\nIniciando migração da tabela 'tarefas' do MySQL para o Neon...")
        tarefas_mysql = mysql_session.query(Tarefa).all()
        for tarefa_mysql in tarefas_mysql:
            novo_usuario_id = old_user_id_map.get(tarefa_mysql.usuario_id)
            if novo_usuario_id is None:
                print(f"Aviso: Usuário com ID {tarefa_mysql.usuario_id} não encontrado no mapa. Pulando tarefa.")
                continue

            nova_tarefa = Tarefa(
                usuario_id=novo_usuario_id,
                nome=tarefa_mysql.nome,
                imagem_url=tarefa_mysql.imagem_url,
                dificuldade=tarefa_mysql.dificuldade,
                categoria=tarefa_mysql.categoria,
                estrelas=tarefa_mysql.estrelas,
                alt_text=tarefa_mysql.alt_text
            )
            neon_session.add(nova_tarefa)
            neon_session.flush() 
            old_task_id_map[tarefa_mysql.id] = nova_tarefa.id
        print(f"Migração de {len(old_task_id_map)} tarefas concluída. Mapa de IDs criado.")

        print("\nIniciando migração da tabela 'rotinas' do MySQL para o Neon...")
        rotinas_mysql = mysql_session.query(Rotina).all()
        for rotina_mysql in rotinas_mysql:
            novo_usuario_id = old_user_id_map.get(rotina_mysql.usuario_id)
            if novo_usuario_id is None:
                print(f"Aviso: Usuário com ID {rotina_mysql.usuario_id} não encontrado no mapa. Pulando rotina.")
                continue
            
            nova_rotina = Rotina(
                usuario_id=novo_usuario_id,
                nome=rotina_mysql.nome,
                data_criacao=rotina_mysql.data_criacao
            )
            neon_session.add(nova_rotina)
            neon_session.flush()
            old_routine_id_map[rotina_mysql.id] = nova_rotina.id
        print(f"Migração de {len(old_routine_id_map)} rotinas concluída. Mapa de IDs criado.")

        print("\nIniciando migração da tabela 'estrelas_diarias' do MySQL para o Neon...")
        estrelas_mysql = mysql_session.query(EstrelaDiaria).all()
        for estrela_mysql in estrelas_mysql:
            novo_usuario_id = old_user_id_map.get(estrela_mysql.usuario_id)
            if novo_usuario_id is None:
                print(f"Aviso: Usuário com ID {estrela_mysql.usuario_id} não encontrado no mapa. Pulando estrela diária.")
                continue

            nova_estrela = EstrelaDiaria(
                usuario_id=novo_usuario_id,
                data=estrela_mysql.data,
                quantidade=estrela_mysql.quantidade
            )
            neon_session.add(nova_estrela)
        print(f"Migração de {len(estrelas_mysql)} estrelas diárias concluída.")

        print("\nIniciando migração da tabela 'tarefas_rotina' do MySQL para o Neon...")
        tarefas_rotina_mysql = mysql_session.query(TarefaRotina).all()
        for tr_mysql in tarefas_rotina_mysql:
            novo_rotina_id = old_routine_id_map.get(tr_mysql.rotina_id)
            novo_tarefa_id = old_task_id_map.get(tr_mysql.tarefa_id)
            novo_usuario_id = old_user_id_map.get(tr_mysql.usuario_id)

            if None in [novo_rotina_id, novo_tarefa_id, novo_usuario_id]:
                print(f"Aviso: Relacionamento com IDs não mapeadas. Pulando registro de tarefa_rotina.")
                continue

            nova_tarefa_rotina = TarefaRotina(
                rotina_id=novo_rotina_id,
                tarefa_id=novo_tarefa_id,
                ordem=tr_mysql.ordem,
                status_concluida=tr_mysql.status_concluida,
                usuario_id=novo_usuario_id
            )
            neon_session.add(nova_tarefa_rotina)
        print(f"Migração de {len(tarefas_rotina_mysql)} relacionamentos concluída.")

        # 3. População da tabela 'tarefas' a partir do CSV
        print(f"\nIniciando a inserção de tarefas do arquivo '{CSV_PATH}'...")
        
        with open(CSV_PATH, mode='r', encoding='utf-8') as csv_file:
            csv_reader = csv.DictReader(csv_file)
            
            # Lê todas as linhas do CSV. A validação de colunas é feita no loop.
            rows_to_insert = list(csv_reader)

            for row in rows_to_insert:
                try:
                    # Cria a nova tarefa vinculada ao usuário 'Sistema'
                    nova_tarefa = Tarefa(
                        usuario_id=sistema_user_id,
                        nome=row['nome'],
                        imagem_url=row['imagem_url'],
                        dificuldade=DificuldadeEnum[row['dificuldade']],
                        categoria=row['categoria'],
                        estrelas=int(row['estrelas']),
                        alt_text=row['alt_text']
                    )
                    neon_session.add(nova_tarefa)
                except KeyError as e:
                    print(f"Erro: Coluna '{e}' não encontrada na linha. Verifique o arquivo CSV.")
                    continue
                except ValueError as e:
                    print(f"Erro ao converter dados para a linha: {row}. Detalhes: {e}")
                    continue
        
        print(f"Total de {len(rows_to_insert)} tarefas do CSV adicionadas com sucesso!")

        neon_session.commit()
        print("\nTodos os dados foram migrados e as tarefas do CSV adicionadas com sucesso para o Neon!")

    except Exception as e:
        neon_session.rollback()
        print(f"\nOcorreu um erro durante a migração: {e}")
    finally:
        mysql_session.close()
        neon_session.close()
        mysql_engine.dispose()
        neon_engine.dispose()
        print("Conexões com os bancos de dados fechadas.")
