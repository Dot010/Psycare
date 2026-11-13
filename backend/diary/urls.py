from rest_framework.routers import DefaultRouter

from diary.views import DiaryEntryViewSet

router = DefaultRouter()
router.register("diary", DiaryEntryViewSet, basename="diary")


urlpatterns = router.urls
