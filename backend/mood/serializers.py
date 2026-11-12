from django.utils import timezone
from rest_framework import serializers

from mood.models import CheckIn

MAX_TAGS = 8
MAX_TAG_LENGTH = 24


class CheckInSerializer(serializers.ModelSerializer):
    class Meta:
        model = CheckIn
        fields = ["id", "date", "level", "tags", "created_at"]
        read_only_fields = ["id", "created_at"]

    def validate_date(self, value):
        if value > timezone.localdate():
            raise serializers.ValidationError(
                "Não dá pra fazer check-in de um dia que ainda não chegou."
            )

        user = self.context["request"].user
        existentes = CheckIn.objects.filter(user=user, date=value)
        if self.instance:
            existentes = existentes.exclude(pk=self.instance.pk)  # lacuna 1
        if existentes.exists():
            raise serializers.ValidationError("Você já fez o check-in desse dia.")
        return value

    def validate_tags(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Envie as tags numa lista.")
        if len(value) > MAX_TAGS:  # lacuna 3
            raise serializers.ValidationError(f"Escolha no máximo {MAX_TAGS} tags.")

        limpas = []
        for tag in value:
            if not isinstance(tag, str):
                raise serializers.ValidationError("Cada tag precisa ser um texto.")
            tag = " ".join(tag.split())[:MAX_TAG_LENGTH]
            if len(tag) < 2:
                raise serializers.ValidationError(
                    "Cada tag precisa ter pelo menos 2 letras."
                )
            limpas.append(tag)
        return limpas
