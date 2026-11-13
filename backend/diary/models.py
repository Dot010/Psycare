from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

DE_1_A_5 = [MinValueValidator(1), MaxValueValidator(5)]


class DiaryEntry(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="diary_entries",
    )
    date = models.DateField("dia")
    title = models.CharField("título", max_length=120, blank=True)
    content = models.TextField("texto")
    mood_level = models.PositiveSmallIntegerField(
        "humor", null=True, blank=True, validators=DE_1_A_5
    )
    anxiety_level = models.PositiveSmallIntegerField(
        "ansiedade", null=True, blank=True, validators=DE_1_A_5
    )
    discuss_in_session = models.BooleanField("levar para a consulta", default=False)
    prompt = models.CharField("sugestão usada", max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date", "-created_at"]

    def __str__(self):
        return f"{self.user} em {self.date}: {self.title}"
