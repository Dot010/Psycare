from django.conf import settings
from django.db import models


class Appointment(models.Model):
    class Kind(models.TextChoices):
        ONLINE = "online", "Online"
        IN_PERSON = "presencial", "Presencial"

    class Status(models.TextChoices):
        PENDING = "pendente", "Pendente"
        CONFIRMED = "confirmado", "Confirmado"
        CANCELED = "cancelado", "Cancelado"

    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="appointments_as_patient",
    )
    professional = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="appointments_as_professional",
    )
    date = models.DateField("dia")
    time = models.TimeField("horário")
    kind = models.CharField("tipo", max_length=12, choices=Kind.choices)
    status = models.CharField(
        "situação", max_length=12, choices=Status.choices, default=Status.PENDING
    )
    note = models.CharField("observação", max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["date", "time"]

    def __str__(self):
        return f"{self.patient} com {self.professional} em {self.date} {self.time}"
