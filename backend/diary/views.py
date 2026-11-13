from django.utils.dateparse import parse_date
from rest_framework import viewsets
from rest_framework.exceptions import ValidationError

from diary.models import DiaryEntry
from diary.serializers import DiaryEntrySerializer


class DiaryEntryViewSet(viewsets.ModelViewSet):
    serializer_class = DiaryEntrySerializer
    http_method_names = ["get", "post", "patch", "delete"]

    def get_queryset(self):
        entradas = DiaryEntry.objects.filter(user=self.request.user)

        texto_da_data = self.request.query_params.get("date")
        if texto_da_data:
            dia = parse_date(texto_da_data)
            if dia is None:
                raise ValidationError({"date": "Use o formato AAAA-MM-DD."})
            entradas = entradas.filter(date=dia)
        return entradas

    def perform_create(self, serializer):

        serializer.save(user=self.request.user)
