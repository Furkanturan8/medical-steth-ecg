from rest_framework.routers import DefaultRouter

from apps.recordings.views.v1.patient import PatientViewSet
from apps.recordings.views.v1.recording import RecordingViewSet

router = DefaultRouter()
router.register("patients", PatientViewSet, basename="patient")
router.register("recordings", RecordingViewSet, basename="recording")

urlpatterns = router.urls
