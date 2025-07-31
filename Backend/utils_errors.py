from fastapi import HTTPException, status


def erro_401_token_invalido():
    return HTTPException(
        status_code=401,
        detail={
            "erro": {
                "codigo": 401,
                "mensagem": "Sua sessão expirou ou é inválida.",
                "solucao": "Faça login novamente para continuar."
            }
        }
    )


def erro_403_login_incorreto():
    return HTTPException(
        status_code=403,
        detail={
            "erro": {
                "codigo": 403,
                "mensagem": "E-mail ou senha incorretos.",
                "solucao": "Verifique suas credenciais e tente novamente."
            }
        }
    )


def erro_404_usuario_nao_encontrado():
    return HTTPException(
        status_code=404,
        detail={
            "erro": {
                "codigo": 404,
                "mensagem": "Usuário não encontrado.",
                "solucao": "Verifique se o token está correto ou tente fazer login novamente."
            }
        }
    )


def erro_400_email_ja_cadastrado():
    return HTTPException(
        status_code=400,
        detail={
            "erro": {
                "codigo": 400,
                "mensagem": "Já existe um usuário cadastrado com este e-mail.",
                "solucao": "Tente usar outro e-mail ou recuperar a senha."
            }
        }
    )