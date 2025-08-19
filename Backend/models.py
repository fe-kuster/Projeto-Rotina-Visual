from sqlalchemy import Column, Integer, String, Date, ForeignKey, Boolean, Enum, Text
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.sql import func
from datetime import datetime
from sqlalchemy import DateTime
from database import Base
import enum

class DificuldadeEnum(enum.Enum):
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
    tarefas_rotina = relationship("TarefaRotina", back_populates="rotina",                           order_by="TarefaRotina.ordem", cascade="all, delete-orphan")
    tarefas = relationship("Tarefa", secondary=lambda: TarefaRotina.__table__, primaryjoin=lambda: Rotina.id == TarefaRotina.rotina_id, secondaryjoin=lambda: Tarefa.id == TarefaRotina.tarefa_id, order_by=lambda: TarefaRotina.ordem, lazy="joined", overlaps="tarefas_rotina")


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

