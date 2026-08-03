from rest_framework import serializers

from apps.recordings.models import Recording

from .analysis_result import AnalysisResultSerializer


class RecordingListSerializer(serializers.ModelSerializer):
    analysis_status = serializers.CharField(source="analysis.status", default=None, read_only=True)

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


class RecordingWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recording
        fields = ["id", "patient", "audio_file", "recorded_at"]

    def create(self, validated_data):
        validated_data["original_filename"] = validated_data["audio_file"].name
        return Recording.objects.create(**validated_data)
