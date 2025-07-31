from jose import jwt
from datetime import datetime, timedelta

SECRET_KEY = "minha_chave_superduper_secreta_aqui"
ALGORITHM = "HS256"

# Criação
payload = {
    "sub": "999",
    "exp": datetime.utcnow() + timedelta(minutes=10)
}

token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
print("Token criado:", token)

# Verificação
print("\nVerificando...")
try:
    decoded = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    print("Token válido! Payload decodificado:")
    print(decoded)
except Exception as e:
    print("Token inválido:", e)
    