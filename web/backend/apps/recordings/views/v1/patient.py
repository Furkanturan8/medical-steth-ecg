from rest_framework import filters, viewsets

from apps.recordings.models import Patient
from apps.recordings.serializers.v1.patient import (
    PatientDetailSerializer,
    PatientListSerializer,
    PatientSerializer,
)


class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all().order_by("-created")
    filter_backends = [filters.SearchFilter]
    search_fields = ["full_name"]

    def get_queryset(self):
        # Her doktor yalnızca kendi eklediği hastaları görür/yönetir.
        return Patient.objects.filter(created_by=self.request.user).order_by("-created")

    def get_serializer_class(self):
        if self.action == "list":
            return PatientListSerializer
        if self.action in ("create", "update", "partial_update"):
            return PatientSerializer
        return PatientDetailSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
