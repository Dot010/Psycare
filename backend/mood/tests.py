from datetime import timedelta

from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from accounts.models import User
from mood.models import CheckIn

SENHA = "Senha-forte-123"


class CheckInAPITest(APITestCase):
    def setUp(self):
        self.ana = User.objects.create_user(
            email="ana@exemplo.com", password=SENHA, name="Ana"
        )
        self.pedro = User.objects.create_user(
            email="pedro@exemplo.com", password=SENHA, name="Pedro"
        )
        self.hoje = timezone.localdate()
        self.lista = reverse("checkin-list")
        self.entrar_como(self.ana)

    def entrar_como(self, user):
        token, _ = Token.objects.get_or_create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")

    def detalhe(self, checkin):
        return reverse("checkin-detail", args=[checkin.pk])

    def test_sem_login_nao_acessa(self):
        self.client.credentials()

        resposta = self.client.get(self.lista)

        self.assertEqual(resposta.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_cria_checkin_no_nome_de_quem_esta_logado(self):
        resposta = self.client.post(
            self.lista, {"date": self.hoje, "level": 4, "tags": ["Sono"]}, format="json"
        )

        self.assertEqual(resposta.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CheckIn.objects.get().user, self.ana)

    def test_ignora_dono_enviado_no_json(self):
        self.client.post(
            self.lista,
            {"date": self.hoje, "level": 4, "user": self.pedro.pk},
            format="json",
        )

        self.assertEqual(CheckIn.objects.get().user, self.ana)

    def test_humor_fora_de_1_a_5_e_recusado(self):
        for nivel in (0, 6):
            resposta = self.client.post(
                self.lista, {"date": self.hoje, "level": nivel}, format="json"
            )

            self.assertEqual(resposta.status_code, status.HTTP_400_BAD_REQUEST)
            self.assertIn("level", resposta.data)

    def test_nao_aceita_data_no_futuro(self):
        amanha = self.hoje + timedelta(days=1)

        resposta = self.client.post(
            self.lista, {"date": amanha, "level": 3}, format="json"
        )

        self.assertEqual(resposta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("date", resposta.data)

    def test_um_checkin_por_dia(self):
        self.client.post(self.lista, {"date": self.hoje, "level": 3}, format="json")

        resposta = self.client.post(
            self.lista, {"date": self.hoje, "level": 5}, format="json"
        )

        self.assertEqual(resposta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(CheckIn.objects.count(), 1)

    def test_tags_sao_limpas_e_limitadas(self):
        resposta = self.client.post(
            self.lista,
            {"date": self.hoje, "level": 3, "tags": ["  muito   sono  "]},
            format="json",
        )
        self.assertEqual(resposta.data["tags"], ["muito sono"])

        demais = [f"Tag {i}" for i in range(9)]
        resposta = self.client.post(
            self.lista,
            {"date": self.hoje - timedelta(days=1), "level": 3, "tags": demais},
            format="json",
        )
        self.assertEqual(resposta.status_code, status.HTTP_400_BAD_REQUEST)

    def test_lista_so_os_proprios_checkins(self):
        CheckIn.objects.create(user=self.ana, date=self.hoje, level=4)
        CheckIn.objects.create(user=self.pedro, date=self.hoje, level=2)

        resposta = self.client.get(self.lista)

        self.assertEqual(resposta.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resposta.data), 1)
        self.assertEqual(resposta.data[0]["level"], 4)

    def test_nao_ve_nem_apaga_checkin_de_outra_pessoa(self):
        do_pedro = CheckIn.objects.create(user=self.pedro, date=self.hoje, level=2)

        ver = self.client.get(self.detalhe(do_pedro))
        apagar = self.client.delete(self.detalhe(do_pedro))

        self.assertEqual(ver.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(apagar.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(CheckIn.objects.filter(pk=do_pedro.pk).exists())

    def test_edita_o_proprio_checkin(self):
        checkin = CheckIn.objects.create(user=self.ana, date=self.hoje, level=2)

        resposta = self.client.patch(self.detalhe(checkin), {"level": 5}, format="json")

        checkin.refresh_from_db()
        self.assertEqual(resposta.status_code, status.HTTP_200_OK)
        self.assertEqual(checkin.level, 5)

    def test_apagar_a_conta_apaga_os_checkins(self):
        CheckIn.objects.create(user=self.ana, date=self.hoje, level=4)

        self.ana.delete()

        self.assertFalse(CheckIn.objects.exists())
