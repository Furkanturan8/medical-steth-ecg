from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response

from apps.recordings.models import Recording
from apps.recordings.serializers.v1.recording import (
    RecordingDetailSerializer,
    RecordingListSerializer,
    RecordingWriteSerializer,
)
from apps.recordings.services.analysis import run_analysis


class RecordingViewSet(viewsets.ModelViewSet):
    queryset = Recording.objects.select_related("patient", "analysis").order_by(
        "-created"
    )
    parser_classes = [MultiPartParser, FormParser]
    filterset_fields = ["patient"]

    def get_queryset(self):
        # Bir doktor yalnızca kendi hastalarına ait kayıtları görür/yönetir.
        return (
            Recording.objects.select_related("patient", "analysis")
            .filter(patient__created_by=self.request.user)
            .order_by("-created")
        )

    def get_serializer_class(self):
        if self.action == "list":
            return RecordingListSerializer
        if self.action in ("create", "update", "partial_update"):
            return RecordingWriteSerializer
        return RecordingDetailSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        recording = serializer.save(uploaded_by=request.user)

        run_analysis(recording)

        output = RecordingDetailSerializer(
            recording, context=self.get_serializer_context()
        )
        return Response(output.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def retry_analysis(self, request, pk=None):
        """POST /recordings/{id}/retry_analysis/"""
        recording = self.get_object()
        run_analysis(recording)
        output = RecordingDetailSerializer(
            recording, context=self.get_serializer_context()
        )
        return Response(output.data)
