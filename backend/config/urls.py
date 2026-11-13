from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("accounts.urls")),
    path("api/", include("mood.urls")),
    path("api/", include("diary.urls")),
    path("api/", include("appointments.urls")),
]
