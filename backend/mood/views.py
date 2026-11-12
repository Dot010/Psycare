from rest_framework import viewsets

from mood.models import CheckIn
from mood.serializers import CheckInSerializer


class CheckInViewSet(viewsets.ModelViewSet):
    serializer_class = CheckInSerializer
    http_method_names = ["get", "post", "patch", "delete"]

    def get_queryset(self):
        return CheckIn.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
