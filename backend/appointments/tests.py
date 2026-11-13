from datetime import time, timedelta

from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from accounts.models import User
from appointments.models import Appointment

SENHA = "Senha-forte-123"
DEZ_HORAS = time(10, 0)


class AppointmentAPITest(APITestCase):
    def setUp(self):
        self.ana = User.objects.create_user(
            email="ana@exemplo.com", password=SENHA, name="Ana"
        )
        self.bia = User.objects.create_user(
            email="bia@exemplo.com", password=SENHA, name="Bia"
        )
        self.carla = User.objects.create_user(
            email="carla@exemplo.com",
            password=SENHA,
            name="Carla",
            role=User.Role.PROFESSIONAL,
            specialty=User.Specialty.PSYCHOLOGIST,
        )
        self.davi = User.objects.create_user(
            email="davi@exemplo.com",
            password=SENHA,
            name="Davi",
            role=User.Role.PROFESSIONAL,
            specialty=User.Specialty.PSYCHIATRIST,
        )
        self.amanha = timezone.localdate() + timedelta(days=1)
        self.lista = reverse("appointment-list")
        self.entrar_como(self.ana)

    def entrar_como(self, user):
        token, _ = Token.objects.get_or_create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")

    def marcar(self, profissional=None, dia=None, hora=DEZ_HORAS):
        return self.client.post(
            self.lista,
            {
                "professional": (profissional or self.carla).pk,
                "date": dia or self.amanha,
                "time": hora,
                "kind": "online",
            },
            format="json",
        )

    def consulta(
        self, paciente=None, profissional=None, situacao=Appointment.Status.PENDING
    ):
        return Appointment.objects.create(
            patient=paciente or self.ana,
            professional=profissional or self.carla,
            date=self.amanha,
            time=DEZ_HORAS,
            kind=Appointment.Kind.ONLINE,
            status=situacao,
        )

    def acao(self, consulta, nome):
        return self.client.post(reverse(f"appointment-{nome}", args=[consulta.pk]))

    # Lista de profissionais

    def test_lista_so_profissionais(self):
        resposta = self.client.get(reverse("professional-list"))

        nomes = [item["name"] for item in resposta.data]
        self.assertEqual(nomes, ["Carla", "Davi"])

    # Marcar

    def test_paciente_marca_consulta_pendente(self):
        resposta = self.marcar()

        self.assertEqual(resposta.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resposta.data["status"], "pendente")
        self.assertEqual(resposta.data["professional_name"], "Carla")
        self.assertEqual(Appointment.objects.get().patient, self.ana)

    def test_profissional_nao_marca_consulta(self):
        self.entrar_como(self.carla)

        resposta = self.marcar(profissional=self.davi)

        self.assertEqual(resposta.status_code, status.HTTP_403_FORBIDDEN)

    def test_so_pode_escolher_um_profissional(self):
        resposta = self.client.post(
            self.lista,
            {
                "professional": self.bia.pk,
                "date": self.amanha,
                "time": DEZ_HORAS,
                "kind": "online",
            },
            format="json",
        )

        self.assertEqual(resposta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("professional", resposta.data)

    def test_nao_marca_no_passado(self):
        ontem = timezone.localdate() - timedelta(days=1)

        resposta = self.marcar(dia=ontem)

        self.assertEqual(resposta.status_code, status.HTTP_400_BAD_REQUEST)

    def test_paciente_nao_marca_duas_no_mesmo_horario(self):
        self.marcar(profissional=self.carla)

        resposta = self.marcar(profissional=self.davi)

        self.assertEqual(resposta.status_code, status.HTTP_400_BAD_REQUEST)

    def test_profissional_ocupado_nao_recebe_outra(self):
        self.consulta(paciente=self.bia)

        resposta = self.marcar(profissional=self.carla)

        self.assertEqual(resposta.status_code, status.HTTP_400_BAD_REQUEST)

    def test_horario_cancelado_fica_livre(self):
        self.consulta(paciente=self.bia, situacao=Appointment.Status.CANCELED)

        resposta = self.marcar(profissional=self.carla)

        self.assertEqual(resposta.status_code, status.HTTP_201_CREATED)

    # Quem enxerga o quê

    def test_cada_um_ve_so_as_suas(self):
        self.consulta(paciente=self.ana, profissional=self.carla)

        self.assertEqual(len(self.client.get(self.lista).data), 1)

        self.entrar_como(self.carla)
        self.assertEqual(len(self.client.get(self.lista).data), 1)

        self.entrar_como(self.bia)
        self.assertEqual(len(self.client.get(self.lista).data), 0)

        self.entrar_como(self.davi)
        self.assertEqual(len(self.client.get(self.lista).data), 0)

    def test_outra_paciente_nao_abre_a_consulta(self):
        consulta = self.consulta(paciente=self.ana)
        self.entrar_como(self.bia)

        resposta = self.client.get(reverse("appointment-detail", args=[consulta.pk]))

        self.assertEqual(resposta.status_code, status.HTTP_404_NOT_FOUND)

    # Confirmar e cancelar

    def test_profissional_confirma(self):
        consulta = self.consulta()
        self.entrar_como(self.carla)

        resposta = self.acao(consulta, "confirm")

        consulta.refresh_from_db()
        self.assertEqual(resposta.status_code, status.HTTP_200_OK)
        self.assertEqual(consulta.status, Appointment.Status.CONFIRMED)

    def test_paciente_nao_confirma(self):
        consulta = self.consulta()

        resposta = self.acao(consulta, "confirm")

        self.assertEqual(resposta.status_code, status.HTTP_403_FORBIDDEN)

    def test_nao_confirma_consulta_cancelada(self):
        consulta = self.consulta(situacao=Appointment.Status.CANCELED)
        self.entrar_como(self.carla)

        resposta = self.acao(consulta, "confirm")

        self.assertEqual(resposta.status_code, status.HTTP_400_BAD_REQUEST)

    def test_paciente_cancela(self):
        consulta = self.consulta()

        resposta = self.acao(consulta, "cancel")

        consulta.refresh_from_db()
        self.assertEqual(resposta.status_code, status.HTTP_200_OK)
        self.assertEqual(consulta.status, Appointment.Status.CANCELED)

    def test_consulta_nao_pode_ser_apagada(self):
        consulta = self.consulta()

        resposta = self.client.delete(reverse("appointment-detail", args=[consulta.pk]))

        self.assertEqual(resposta.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_apagar_a_conta_apaga_as_consultas(self):
        self.consulta()

        self.ana.delete()

        self.assertFalse(Appointment.objects.exists())
