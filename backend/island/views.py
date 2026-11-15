from rest_framework import generics

from island.models import IslandState
from island.serializers import IslandStateSerializer


class IslandView(generics.RetrieveUpdateAPIView):
    """A ilha de quem está logado. Cada pessoa só vê e muda a própria (o profissional não vê)."""

    serializer_class = IslandStateSerializer
    http_method_names = ["get", "patch"]

    def get_object(self):
        island, _ = IslandState.objects.get_or_create(user=self.request.user)
        return island
