from django.urls import path

from island.views import IslandView

urlpatterns = [
    path("island/", IslandView.as_view(), name="island"),
]
