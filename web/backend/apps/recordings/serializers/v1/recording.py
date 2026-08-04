import os

from rest_framework import serializers

from apps.recordings.models import Patient, Recording

from .analysis_result import AnalysisResultSerializer


class RecordingListSerializer(serializers.ModelSerializer):
    analysis_status = serializers.CharField(
        source="analysis.status", default=None, read_only=True
    )
    heart_rate_bpm = serializers.FloatField(
        source="analysis.heart_rate_bpm", default=None, read_only=True
    )
    mean_systole_ms = serializers.FloatField(
        source="analysis.mean_systole_ms", default=None, read_only=True
    )
    mean_diastole_ms = serializers.FloatField(
        source="analysis.mean_diastole_ms", default=None, read_only=True
    )

    class Meta:
        model = Recording
        fields = [
            "id",
            "patient",
            "original_filename",
            "duration_sec",
            "recorded_at",
            "created",
            "analysis_status",
            "heart_rate_bpm",
            "mean_systole_ms",
            "mean_diastole_ms",
        ]


class RecordingDetailSerializer(serializers.ModelSerializer):
    analysis = AnalysisResultSerializer(read_only=True)

    class Meta:
        model = Recording
        fields = [
            "id",
            "patient",
            "uploaded_by",
            "audio_file",
            "original_filename",
            "recorded_at",
            "sample_rate_hz",
            "duration_sec",
            "created",
            "analysis",
        ]
        read_only_fields = ["uploaded_by", "sample_rate_hz", "duration_sec"]


MAX_AUDIO_FILE_SIZE_MB = 50
ALLOWED_AUDIO_EXTENSIONS = [".wav"]


class RecordingWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recording
        fields = ["id", "patient", "audio_file", "recorded_at"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        if request is not None:
            # Bir doktor kaydı yalnızca kendi hastalarından birine bağlayabilir.
            self.fields["patient"].queryset = Patient.objects.filter(
                created_by=request.user
            )

    def validate_audio_file(self, value):
        ext = os.path.splitext(value.name)[1].lower()
        if ext not in ALLOWED_AUDIO_EXTENSIONS:
            raise serializers.ValidationError("Sadece WAV dosyaları kabul ediliyor.")
        if value.size > MAX_AUDIO_FILE_SIZE_MB * 1024 * 1024:
            raise serializers.ValidationError(
                f"Dosya {MAX_AUDIO_FILE_SIZE_MB}MB sınırını aşamaz."
            )
        return value

    def create(self, validated_data):
        validated_data["original_filename"] = validated_data["audio_file"].name
        return Recording.objects.create(**validated_data)
