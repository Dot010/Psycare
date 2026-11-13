from datetime import datetime

from django.utils import timezone
from rest_framework import serializers

from accounts.models import User
from appointments.models import Appointment


class ProfessionalSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "name", "specialty"]


class AppointmentSerializer(serializers.ModelSerializer):
    professional = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role=User.Role.PROFESSIONAL)
    )
    professional_name = serializers.CharField(
        source="professional.name", read_only=True
    )
    patient_name = serializers.CharField(source="patient.name", read_only=True)

    class Meta:
        model = Appointment
        fields = [
            "id",
            "professional",
            "professional_name",
            "patient_name",
            "date",
            "time",
            "kind",
            "status",
            "note",
            "created_at",
        ]
        read_only_fields = ["id", "status", "created_at"]

    def validate_note(self, value):
        return value.strip()

    def validate(self, attrs):
        quando = timezone.make_aware(datetime.combine(attrs["date"], attrs["time"]))
        if quando < timezone.now():
            raise serializers.ValidationError(
                {"time": "Essa data e horário já passaram. Escolha um horário futuro."}
            )

        paciente = self.context["request"].user
        ocupados = Appointment.objects.filter(
            date=attrs["date"], time=attrs["time"]
        ).exclude(status=Appointment.Status.CANCELED)
        if ocupados.filter(patient=paciente).exists():
            raise serializers.ValidationError(
                {"time": "Você já tem uma sessão nesse horário."}
            )
        if ocupados.filter(professional=attrs["professional"]).exists():
            raise serializers.ValidationError(
                {"time": "Esse profissional já tem uma sessão nesse horário."}
            )
        return attrs
