import re

from rest_framework import serializers

from island.models import UNLOCKS, IslandState

FOX_NAME_MAX = 16
# Letras (com acento), espaço, hífen e apóstrofo. Nada de HTML nem emoji.
FOX_NAME_OK = re.compile(r"^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$")


class IslandStateSerializer(serializers.ModelSerializer):
    # Aceita um texto maior só para poder limpar e cortar em 16, em vez de recusar.
    fox_name = serializers.CharField(required=False, allow_blank=True, max_length=64)

    class Meta:
        model = IslandState
        fields = ["fox_name", "trips", "unlocked", "updated_at"]
        read_only_fields = ["updated_at"]

    def validate_fox_name(self, value):
        value = " ".join(value.split())[:FOX_NAME_MAX]
        if value and not FOX_NAME_OK.match(value):
            raise serializers.ValidationError("Use só letras no nome da raposa.")
        return value[:1].upper() + value[1:]

    def validate_trips(self, value):
        atual = self.instance.trips if self.instance else 0
        # A ilha só cresce: as travessias não diminuem, e sobem uma de cada vez.
        if value < atual:
            raise serializers.ValidationError("As travessias não diminuem.")
        if value > atual + 1:
            raise serializers.ValidationError("Uma travessia de cada vez.")
        return value

    def validate_unlocked(self, value):
        if not isinstance(value, list) or not all(
            isinstance(item, str) for item in value
        ):
            raise serializers.ValidationError("Envie uma lista de nomes.")
        desconhecidos = [item for item in value if item not in UNLOCKS]
        if desconhecidos:
            raise serializers.ValidationError("Item que não existe na ilha.")
        ja_tinha = list(self.instance.unlocked) if self.instance else []
        # O que já apareceu fica: a lista nova é somada à antiga, nunca troca.
        return ja_tinha + [
            item for item in UNLOCKS if item in value and item not in ja_tinha
        ]
