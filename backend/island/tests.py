from django.urls import reverse
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from accounts.models import User
from island.models import IslandState

SENHA = "Senha-forte-123"


class IslandAPITest(APITestCase):
    def setUp(self):
        self.ana = User.objects.create_user(
            email="ana@exemplo.com", password=SENHA, name="Ana"
        )
        self.pedro = User.objects.create_user(
            email="pedro@exemplo.com", password=SENHA, name="Pedro"
        )
        self.url = reverse("island")
        self.entrar_como(self.ana)

    def entrar_como(self, user):
        token, _ = Token.objects.get_or_create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")

    def test_sem_login_nao_acessa(self):
        self.client.credentials()

        resposta = self.client.get(self.url)

        self.assertEqual(resposta.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_primeira_visita_cria_ilha_vazia(self):
        resposta = self.client.get(self.url)

        self.assertEqual(resposta.status_code, status.HTTP_200_OK)
        self.assertEqual(resposta.data["fox_name"], "")
        self.assertEqual(resposta.data["trips"], 0)
        self.assertEqual(resposta.data["unlocked"], [])
        self.assertEqual(IslandState.objects.get().user, self.ana)

    def test_nome_da_raposa_sai_limpo(self):
        resposta = self.client.patch(
            self.url, {"fox_name": "  mel   da  ilha  "}, format="json"
        )

        self.assertEqual(resposta.status_code, status.HTTP_200_OK)
        self.assertEqual(resposta.data["fox_name"], "Mel da ilha")

    def test_nome_com_html_e_recusado(self):
        resposta = self.client.patch(
            self.url, {"fox_name": "<b>Mel</b>"}, format="json"
        )

        self.assertEqual(resposta.status_code, status.HTTP_400_BAD_REQUEST)

    def test_nome_comprido_e_cortado(self):
        resposta = self.client.patch(self.url, {"fox_name": "A" * 40}, format="json")

        self.assertEqual(len(resposta.data["fox_name"]), 16)

    def test_travessia_sobe_uma_de_cada_vez(self):
        self.assertEqual(
            self.client.patch(self.url, {"trips": 1}, format="json").status_code, 200
        )
        self.assertEqual(
            self.client.patch(self.url, {"trips": 3}, format="json").status_code, 400
        )

    def test_travessias_nao_diminuem(self):
        self.client.patch(self.url, {"trips": 1}, format="json")

        resposta = self.client.patch(self.url, {"trips": 0}, format="json")

        self.assertEqual(resposta.status_code, status.HTTP_400_BAD_REQUEST)

    def test_o_que_apareceu_nao_some(self):
        self.client.patch(self.url, {"unlocked": ["banco"]}, format="json")

        resposta = self.client.patch(self.url, {"unlocked": ["ninho"]}, format="json")

        self.assertEqual(resposta.data["unlocked"], ["banco", "ninho"])

    def test_item_desconhecido_e_recusado(self):
        resposta = self.client.patch(self.url, {"unlocked": ["castelo"]}, format="json")

        self.assertEqual(resposta.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cada_um_ve_so_a_propria_ilha(self):
        self.client.patch(self.url, {"fox_name": "Mel"}, format="json")
        self.entrar_como(self.pedro)

        resposta = self.client.get(self.url)

        self.assertEqual(resposta.data["fox_name"], "")
        self.assertEqual(IslandState.objects.count(), 2)

    def test_nao_aceita_put_nem_delete(self):
        self.assertEqual(self.client.put(self.url, {}, format="json").status_code, 405)
        self.assertEqual(self.client.delete(self.url).status_code, 405)

    def test_excluir_a_conta_apaga_a_ilha(self):
        self.client.get(self.url)

        self.ana.delete()

        self.assertFalse(IslandState.objects.exists())
