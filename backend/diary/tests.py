from datetime import timedelta

from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from accounts.models import User
from diary.models import DiaryEntry

SENHA = "Senha-forte-123"


class DiaryAPITest(APITestCase):
    def setUp(self):
        self.ana = User.objects.create_user(
            email="ana@exemplo.com", password=SENHA, name="Ana"
        )
        self.pedro = User.objects.create_user(
            email="pedro@exemplo.com", password=SENHA, name="Pedro"
        )
        self.hoje = timezone.localdate()
        self.lista = reverse("diary-list")
        self.entrar_como(self.ana)

    def entrar_como(self, user):
        token, _ = Token.objects.get_or_create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")

    def detalhe(self, entrada):
        return reverse("diary-detail", args=[entrada.pk])

    def test_sem_login_nao_acessa(self):
        self.client.credentials()

        resposta = self.client.get(self.lista)

        self.assertEqual(resposta.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_cria_entrada_no_nome_de_quem_esta_logado(self):
        resposta = self.client.post(
            self.lista,
            {
                "date": self.hoje,
                "title": "Dia bom",
                "content": "Fui caminhar.",
                "mood_level": 4,
            },
            format="json",
        )

        self.assertEqual(resposta.status_code, status.HTTP_201_CREATED)
        self.assertEqual(DiaryEntry.objects.get().user, self.ana)

    def test_sem_titulo_usa_o_comeco_do_texto(self):
        resposta = self.client.post(
            self.lista,
            {"date": self.hoje, "content": "Hoje acordei cansado\nmas fui trabalhar"},
            format="json",
        )

        self.assertEqual(resposta.data["title"], "Hoje acordei cansado")

    def test_titulo_longo_e_cortado_numa_palavra(self):
        texto = "Hoje foi um dia muito comprido e cheio de reuniões no trabalho"

        resposta = self.client.post(
            self.lista, {"date": self.hoje, "content": texto}, format="json"
        )

        self.assertTrue(resposta.data["title"].endswith("…"))
        self.assertLessEqual(len(resposta.data["title"]), 41)

    def test_texto_vazio_e_recusado(self):
        resposta = self.client.post(
            self.lista, {"date": self.hoje, "content": "   "}, format="json"
        )

        self.assertEqual(resposta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("content", resposta.data)

    def test_nao_aceita_data_no_futuro(self):
        amanha = self.hoje + timedelta(days=1)

        resposta = self.client.post(
            self.lista, {"date": amanha, "content": "Oi"}, format="json"
        )

        self.assertEqual(resposta.status_code, status.HTTP_400_BAD_REQUEST)

    def test_ansiedade_fora_de_1_a_5_e_recusada(self):
        resposta = self.client.post(
            self.lista,
            {"date": self.hoje, "content": "Oi", "anxiety_level": 9},
            format="json",
        )

        self.assertEqual(resposta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("anxiety_level", resposta.data)

    def test_pode_escrever_varias_vezes_no_mesmo_dia(self):
        self.client.post(
            self.lista, {"date": self.hoje, "content": "Manhã"}, format="json"
        )
        resposta = self.client.post(
            self.lista, {"date": self.hoje, "content": "Noite"}, format="json"
        )

        self.assertEqual(resposta.status_code, status.HTTP_201_CREATED)
        self.assertEqual(DiaryEntry.objects.count(), 2)

    def test_lista_so_o_proprio_diario(self):
        DiaryEntry.objects.create(user=self.ana, date=self.hoje, content="Da Ana")
        DiaryEntry.objects.create(user=self.pedro, date=self.hoje, content="Do Pedro")

        resposta = self.client.get(self.lista)

        self.assertEqual(len(resposta.data), 1)
        self.assertEqual(resposta.data[0]["content"], "Da Ana")

    def test_filtra_por_dia(self):
        ontem = self.hoje - timedelta(days=1)
        DiaryEntry.objects.create(user=self.ana, date=self.hoje, content="Hoje")
        DiaryEntry.objects.create(user=self.ana, date=ontem, content="Ontem")

        resposta = self.client.get(self.lista, {"date": ontem.isoformat()})

        self.assertEqual(len(resposta.data), 1)
        self.assertEqual(resposta.data[0]["content"], "Ontem")

    def test_filtro_com_data_invalida_responde_400(self):
        resposta = self.client.get(self.lista, {"date": "ontem"})

        self.assertEqual(resposta.status_code, status.HTTP_400_BAD_REQUEST)

    def test_nao_ve_nem_apaga_entrada_de_outra_pessoa(self):
        do_pedro = DiaryEntry.objects.create(
            user=self.pedro, date=self.hoje, content="Segredo"
        )

        ver = self.client.get(self.detalhe(do_pedro))
        apagar = self.client.delete(self.detalhe(do_pedro))

        self.assertEqual(ver.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(apagar.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(DiaryEntry.objects.filter(pk=do_pedro.pk).exists())

    def test_marca_para_levar_a_consulta(self):
        entrada = DiaryEntry.objects.create(
            user=self.ana, date=self.hoje, content="Quero falar disso"
        )

        resposta = self.client.patch(
            self.detalhe(entrada), {"discuss_in_session": True}, format="json"
        )

        entrada.refresh_from_db()
        self.assertEqual(resposta.status_code, status.HTTP_200_OK)
        self.assertTrue(entrada.discuss_in_session)

    def test_apagar_a_conta_apaga_o_diario(self):
        DiaryEntry.objects.create(user=self.ana, date=self.hoje, content="Oi")

        self.ana.delete()

        self.assertFalse(DiaryEntry.objects.exists())
