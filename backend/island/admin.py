from django.contrib import admin

from island.models import IslandState


@admin.register(IslandState)
class IslandStateAdmin(admin.ModelAdmin):
    list_display = ["user", "trips", "updated_at"]
    # Só leitura: a ilha é da pessoa. O admin vê que existe, mas não edita.
    readonly_fields = [
        "user",
        "fox_name",
        "trips",
        "unlocked",
        "created_at",
        "updated_at",
    ]

    def has_add_permission(self, request):
        return False
