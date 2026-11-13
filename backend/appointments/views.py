from django.db.models import Q
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from accounts.models import User
from appointments.models import Appointment
from appointments.serializers import AppointmentSerializer, ProfessionalSerializer


class ProfessionalListView(generics.ListAPIView):

    serializer_class = ProfessionalSerializer
    queryset = User.objects.filter(
        role=User.Role.PROFESSIONAL, is_active=True
    ).order_by("name")


class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    http_method_names = ["get", "post"]

    def get_queryset(self):

        user = self.request.user
        return Appointment.objects.filter(Q(patient=user) | Q(professional=user))

    def perform_create(self, serializer):

        if self.request.user.role != User.Role.PATIENT:
            raise PermissionDenied("Só pacientes podem marcar consultas.")
        serializer.save(patient=self.request.user)

    @action(detail=True, methods=["post"])
    def confirm(self, request, pk=None):
        consulta = self.get_object()
        if consulta.professional != request.user:
            raise PermissionDenied("Só o profissional da consulta pode confirmar.")
        if consulta.status != Appointment.Status.PENDING:
            return Response(
                {"detail": "Só dá para confirmar uma consulta pendente."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        consulta.status = Appointment.Status.CONFIRMED
        consulta.save(update_fields=["status"])
        return Response(self.get_serializer(consulta).data)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        consulta = self.get_object()
        if consulta.status == Appointment.Status.CANCELED:
            return Response(
                {"detail": "Essa consulta já foi cancelada."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        consulta.status = Appointment.Status.CANCELED
        consulta.save(update_fields=["status"])
        return Response(self.get_serializer(consulta).data)
