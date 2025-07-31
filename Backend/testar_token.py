from jose import jwt
from jose.exceptions import JWTError

SECRET_KEY = "minha_chave_superduper_secreta_aqui"
ALGORITHM = "HS256"

token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5OTkiLCJleHAiOjE3NTA2MTMxNzF9.MfdPB8jVzCrTAKZMJc0zS4_pHkWyjy86UFaJxZtML70"

try:
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    print("Token válido!")
    print(payload)
except JWTError as e:
    print("Token inválido ou expirado")
    print(e)
