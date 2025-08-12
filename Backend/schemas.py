from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Literal, List, Optional
from models import DificuldadeEnum
from datetime import datetime, date

#USUÁRIO

class UsuarioCreate(BaseModel):
    nome_usuario: str = Field(..., min_length=2, max_length=50)
    nome_responsavel: str = Field(..., min_length=2, max_length=100)
    email_responsavel: EmailStr
    senha: str = Field(..., min_length=6, max_length=20)

class UsuarioResponse(BaseModel):
    id: int
    nome_usuario: str
    nome_responsavel: str
    email_responsavel: EmailStr

    model_config = ConfigDict(from_attributes=True)

#TAREFAS

class TarefaCreate(BaseModel):
    nome: str
    imagem_url: Optional[str] = None
    dificuldade: Optional[DificuldadeEnum] = None
    categoria: Optional[str] = None
    estrelas: Optional[int] = 1
    alt_text: Optional[str] = None
    
class TarefaResponse(BaseModel):
    id: int
    nome: str
    imagem_url: Optional [str] = None
    categoria: Optional[str] = None
    estrelas: Optional[int] = 1
    alt_text: Optional[str] = None
    usuario_id: Optional[int]

    model_config = ConfigDict(from_attributes=True)

#ROTINA:

class RotinaBase(BaseModel):
    nome: str

class RotinaCreate(RotinaBase):
    tarefas: list[int]

class RotinaResponse(RotinaBase):
    id: int
    usuario_id: int
    data_criacao: datetime
    tarefas: List[TarefaResponse]

    model_config = ConfigDict(from_attributes=True)

class RotinaUpdate(BaseModel):
    nome: Optional[str] = None
    tarefas: Optional[List[int]] = None
    
#ESTRELAS

class EstrelaDiariaBase(BaseModel):
    data: date
    quantidade: int

class EstrelaDiariaCreate(EstrelaDiariaBase):
    pass

class EstrelaDiariaResponse(EstrelaDiariaBase):
    id: int
    usuario_id: int

    model_config = ConfigDict(from_attributes=True)

#tarefas_rotina

class TarefaRotinaBase(BaseModel):
    rotina_id: int
    tarefa_id: int
    ordem: Optional[int] = None
    status_concluida: Optional[bool] = False

class TarefaRotinaCreate(TarefaRotinaBase):
    pass

class TarefaRotinaResponse(TarefaRotinaBase):
    id: int
    usuario_id: int

    model_config = ConfigDict(from_attributes=True)