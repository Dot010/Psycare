from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class CheckIn(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="checkins",
    )
    date = models.DateField("dia")
    level = models.PositiveSmallIntegerField(
        "humor",
        validators=[MinValueValidator(1), MaxValueValidator(5)],
    )
    tags = models.JSONField("o que influenciou", default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date"]
        constraints = [
            models.UniqueConstraint(fields=["user", "date"], name="um_checkin_por_dia"),
        ]

    def __str__(self):
        return f"{self.user} em {self.date}: {self.level}"
