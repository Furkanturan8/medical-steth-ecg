from rest_framework import serializers

from apps.recordings.models import AnalysisResult


class AnalysisResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalysisResult
        fields = [
            "status",
            "heart_rate_bpm",
            "mean_systole_ms",
            "mean_diastole_ms",
            "s1_timestamps_sec",
            "s2_timestamps_sec",
            "report_image",
            "filtered_audio_file",
            "error_message",
            "computed_at",
        ]
