from django.utils import timezone
from rest_framework import serializers

from diary.models import DiaryEntry

MAX_CONTENT_LENGTH = 10_000
TITLE_LENGTH = 40


def titulo_do_texto(texto):

    primeira_linha = texto.strip().split("\n")[0].strip()
    if len(primeira_linha) <= TITLE_LENGTH:
        return primeira_linha
    corte = primeira_linha[:TITLE_LENGTH]
    ultimo_espaco = corte.rfind(" ")
    if ultimo_espaco > 15:
        corte = corte[:ultimo_espaco]
    return corte.rstrip() + "…"


class DiaryEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = DiaryEntry
        fields = [
            "id",
            "date",
            "title",
            "content",
            "mood_level",
            "anxiety_level",
            "discuss_in_session",
            "prompt",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_date(self, value):
        if value > timezone.localdate():
            raise serializers.ValidationError(
                "Não dá pra escrever num dia que ainda não chegou."
            )
        return value

    def validate_content(self, value):
        texto = value.strip()
        if not texto:
            raise serializers.ValidationError("Escreva alguma coisa antes de salvar.")
        if len(texto) > MAX_CONTENT_LENGTH:
            raise serializers.ValidationError(
                f"O texto pode ter no máximo {MAX_CONTENT_LENGTH} caracteres."
            )
        return texto

    def validate(self, attrs):
        titulo = attrs.get("title", "").strip()
        texto = attrs.get("content")
        if not titulo and texto:
            titulo = titulo_do_texto(texto)
        if "title" in attrs or texto:
            attrs["title"] = titulo
        return attrs
