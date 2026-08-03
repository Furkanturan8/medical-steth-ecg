from django.db import models
from django_extensions.db.models import TimeStampedModel

from .recording import Recording


class AnalysisResult(TimeStampedModel):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        DONE = "done", "Done"
        FAILED = "failed", "Failed"

    recording = models.OneToOneField(Recording, on_delete=models.CASCADE, related_name="analysis")
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    heart_rate_bpm = models.FloatField(null=True, blank=True)
    mean_systole_ms = models.FloatField(null=True, blank=True)
    mean_diastole_ms = models.FloatField(null=True, blank=True)
    s1_timestamps_sec = models.JSONField(default=list, blank=True)
    s2_timestamps_sec = models.JSONField(default=list, blank=True)
    report_image = models.FileField(upload_to="reports/", null=True, blank=True)
    filtered_audio_file = models.FileField(upload_to="filtered/", null=True, blank=True)
    error_message = models.TextField(blank=True)
    computed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Analysis for recording {self.recording_id} ({self.status})"
