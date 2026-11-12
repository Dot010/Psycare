from django.core.cache import cache
from django.urls import reverse
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from accounts.models import User

SENHA = "Senha-forte-123"


def dados_cadastro(**extra):
    dados = {
        "email": "ana@exemplo.com",
        "name": "Ana",
        "password": SENHA,
        "accept_terms": True,
    }
    dados.update(extra)
    return dados


class BaseAPITest(APITestCase):
    def setUp(self):

        cache.clear()

    def autenticar(self, user):
        token, _ = Token.objects.get_or_create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")
        return token


class RegisterTest(BaseAPITest):
    url = reverse("register")

    def test_cadastro_de_paciente_devolve_token(self):
        resposta = self.client.post(self.url, dados_cadastro())

        self.assertEqual(resposta.status_code, status.HTTP_201_CREATED)
        self.assertIn("token", resposta.data)
        self.assertEqual(resposta.data["user"]["role"], User.Role.PATIENT)
        self.assertNotIn("password", resposta.data["user"])

    def test_cadastro_registra_o_aceite_dos_termos(self):
        self.client.post(self.url, dados_cadastro())

        self.assertIsNotNone(User.objects.get().terms_accepted_at)

    def test_sem_aceitar_os_termos_nao_cadastra(self):
        resposta = self.client.post(self.url, dados_cadastro(accept_terms=False))

        self.assertEqual(resposta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("accept_terms", resposta.data)
        self.assertFalse(User.objects.exists())

    def test_email_repetido_mesmo_com_maiusculas(self):
        self.client.post(self.url, dados_cadastro())
        resposta = self.client.post(self.url, dados_cadastro(email="ANA@Exemplo.com"))

        self.assertEqual(resposta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", resposta.data)

    def test_senha_fraca_e_recusada(self):
        resposta = self.client.post(self.url, dados_cadastro(password="123"))

        self.assertEqual(resposta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", resposta.data)

    def test_profissional_precisa_de_especialidade(self):
        resposta = self.client.post(
            self.url, dados_cadastro(role=User.Role.PROFESSIONAL)
        )

        self.assertEqual(resposta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("specialty", resposta.data)

    def test_cadastro_de_psicologo(self):
        resposta = self.client.post(
            self.url,
            dados_cadastro(
                role=User.Role.PROFESSIONAL, specialty=User.Specialty.PSYCHOLOGIST
            ),
        )

        self.assertEqual(resposta.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resposta.data["user"]["specialty"], "psychologist")

    def test_paciente_nao_tem_especialidade(self):
        resposta = self.client.post(
            self.url, dados_cadastro(specialty=User.Specialty.PSYCHIATRIST)
        )

        self.assertEqual(resposta.status_code, status.HTTP_400_BAD_REQUEST)


class LoginTest(BaseAPITest):
    url = reverse("login")

    def setUp(self):
        super().setUp()
        self.user = User.objects.create_user(
            email="ana@exemplo.com", password=SENHA, name="Ana"
        )

    def test_login_devolve_token(self):
        resposta = self.client.post(
            self.url, {"email": "ana@exemplo.com", "password": SENHA}
        )

        self.assertEqual(resposta.status_code, status.HTTP_200_OK)
        self.assertEqual(resposta.data["token"], Token.objects.get(user=self.user).key)

    def test_login_ignora_maiusculas_no_email(self):
        resposta = self.client.post(
            self.url, {"email": " Ana@Exemplo.COM ", "password": SENHA}
        )

        self.assertEqual(resposta.status_code, status.HTTP_200_OK)

    def test_senha_errada_e_email_inexistente_dao_a_mesma_mensagem(self):
        senha_errada = self.client.post(
            self.url, {"email": "ana@exemplo.com", "password": "errada"}
        )
        sem_conta = self.client.post(
            self.url, {"email": "ninguem@exemplo.com", "password": SENHA}
        )

        self.assertEqual(senha_errada.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(senha_errada.data, sem_conta.data)

    def test_conta_desativada_nao_entra(self):
        self.user.is_active = False
        self.user.save()

        resposta = self.client.post(
            self.url, {"email": "ana@exemplo.com", "password": SENHA}
        )

        self.assertEqual(resposta.status_code, status.HTTP_400_BAD_REQUEST)

    def test_muitas_tentativas_sao_barradas(self):
        dados = {"email": "ana@exemplo.com", "password": "errada"}
        for _ in range(10):
            self.client.post(self.url, dados)

        resposta = self.client.post(self.url, dados)

        self.assertEqual(resposta.status_code, status.HTTP_429_TOO_MANY_REQUESTS)


class MeTest(BaseAPITest):
    def setUp(self):
        super().setUp()
        self.user = User.objects.create_user(
            email="ana@exemplo.com", password=SENHA, name="Ana"
        )

    def test_sem_token_nao_acessa(self):
        resposta = self.client.get(reverse("me"))

        self.assertEqual(resposta.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_ve_o_proprio_perfil(self):
        self.autenticar(self.user)

        resposta = self.client.get(reverse("me"))

        self.assertEqual(resposta.status_code, status.HTTP_200_OK)
        self.assertEqual(resposta.data["email"], "ana@exemplo.com")

    def test_edita_o_nome_mas_nao_o_tipo_de_conta(self):
        self.autenticar(self.user)

        resposta = self.client.patch(
            reverse("me"), {"name": "Ana Souza", "role": User.Role.PROFESSIONAL}
        )

        self.user.refresh_from_db()
        self.assertEqual(resposta.status_code, status.HTTP_200_OK)
        self.assertEqual(self.user.name, "Ana Souza")
        self.assertEqual(self.user.role, User.Role.PATIENT)

    def test_logout_invalida_o_token(self):
        self.autenticar(self.user)

        resposta = self.client.post(reverse("logout"))

        self.assertEqual(resposta.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Token.objects.filter(user=self.user).exists())
        self.assertEqual(
            self.client.get(reverse("me")).status_code, status.HTTP_401_UNAUTHORIZED
        )

    def test_troca_de_senha_gera_token_novo(self):
        antigo = self.autenticar(self.user)

        resposta = self.client.post(
            reverse("change-password"),
            {"current_password": SENHA, "new_password": "Nova-senha-456"},
        )

        self.user.refresh_from_db()
        self.assertEqual(resposta.status_code, status.HTTP_200_OK)
        self.assertTrue(self.user.check_password("Nova-senha-456"))
        self.assertNotEqual(resposta.data["token"], antigo.key)

    def test_troca_de_senha_exige_a_senha_atual(self):
        self.autenticar(self.user)

        resposta = self.client.post(
            reverse("change-password"),
            {"current_password": "errada", "new_password": "Nova-senha-456"},
        )

        self.assertEqual(resposta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("current_password", resposta.data)
