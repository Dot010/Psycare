from django.urls import path
from rest_framework.routers import DefaultRouter

from appointments.views import AppointmentViewSet, ProfessionalListView

router = DefaultRouter()
router.register("appointments", AppointmentViewSet, basename="appointment")

urlpatterns = [
    path("professionals/", ProfessionalListView.as_view(), name="professional-list"),
] + router.urls
