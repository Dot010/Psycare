from django.conf import settings
from django.db import models

# O que pode aparecer na ilha com o uso. Nada sai daqui depois de aparecer: a ilha nunca murcha.
UNLOCKS = ("banco", "lanternas", "ninho", "bandeirinhas")


class IslandState(models.Model):
    """O que a ilha guarda de cada pessoa. As gotas e as plantas vêm dos cuidados (check-in, diário...)."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="island",
    )
    fox_name = models.CharField("nome da raposa", max_length=16, blank=True)
    trips = models.PositiveIntegerField("travessias de barco", default=0)
    unlocked = models.JSONField("o que já apareceu", default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "ilha"
        verbose_name_plural = "ilhas"

    def __str__(self):
        return f"Ilha de {self.user}"
