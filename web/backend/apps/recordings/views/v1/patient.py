from rest_framework import viewsets

from apps.recordings.models import Patient
from apps.recordings.serializers.v1.patient import (
    PatientDetailSerializer,
    PatientListSerializer,
    PatientSerializer,
)


class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all().order_by("-created")

    def get_serializer_class(self):
        if self.action == "list":
            return PatientListSerializer
        if self.action in ("create", "update", "partial_update"):
            return PatientSerializer
        return PatientDetailSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
