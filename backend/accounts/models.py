from django.contrib.auth.models import (
    AbstractUser,
    BaseUserManager,
)  # 🆕 BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("O e-mail é obrigatório")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)


# 🆕 ↑ fim do gerente


class User(AbstractUser):
    class Role(models.TextChoices):
        PATIENT = "patient", "Paciente"
        PROFESSIONAL = "professional", "Profissional"

    class Specialty(models.TextChoices):
        PSYCHOLOGIST = "psychologist", "Psicólogo(a)"
        PSYCHIATRIST = "psychiatrist", "Psiquiatra"

    username = None
    email = models.EmailField("e-mail", unique=True)
    name = models.CharField("nome", max_length=100)
    role = models.CharField(
        "tipo de conta", max_length=20, choices=Role.choices, default=Role.PATIENT
    )
    specialty = models.CharField(
        "especialidade", max_length=20, choices=Specialty.choices, blank=True
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]

    objects = UserManager()  # 🆕 contrata o gerente

    def __str__(self):
        return self.email
