from django.db import IntegrityError
from django.test import TestCase

from accounts.models import User


class UserModelTest(TestCase):
    def test_cria_paciente_por_padrao(self):
        user = User.objects.create_user(
            email="ana@exemplo.com", password="Senha-forte-123", name="Ana"
        )

        self.assertEqual(user.email, "ana@exemplo.com")
        self.assertEqual(user.role, User.Role.PATIENT)

    def test_senha_guardada_com_hash(self):
        user = User.objects.create_user(
            email="ana@exemplo.com", password="Senha-forte-123", name="Ana"
        )

        self.assertNotEqual(user.password, "Senha-forte-123")
        self.assertTrue(user.check_password("Senha-forte-123"))

    def test_email_obrigatorio(self):
        with self.assertRaises(ValueError):
            User.objects.create_user(email="", password="Senha-forte-123", name="Ana")

    def test_email_unico(self):
        User.objects.create_user(
            email="ana@exemplo.com", password="Senha-forte-123", name="Ana"
        )

        with self.assertRaises(IntegrityError):
            User.objects.create_user(
                email="ana@exemplo.com", password="Outra-senha-456", name="Ana 2"
            )

    def test_superusuario_tem_acesso_total(self):
        admin = User.objects.create_superuser(
            email="admin@exemplo.com", password="Senha-forte-123", name="Admin"
        )

        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)
