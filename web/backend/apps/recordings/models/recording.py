from django.conf import settings
from django.db import models
from django_extensions.db.models import TimeStampedModel

from .patient import Patient


def recording_upload_path(instance, filename):
    return f"recordings/{instance.patient_id}/{filename}"


class Recording(TimeStampedModel):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="recordings")
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="uploaded_recordings",
    )
    audio_file = models.FileField(upload_to=recording_upload_path)
    original_filename = models.CharField(max_length=255, blank=True)
    recorded_at = models.DateTimeField(null=True, blank=True)
    sample_rate_hz = models.PositiveIntegerField(null=True, blank=True)
    duration_sec = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"{self.patient.full_name} - {self.created:%Y-%m-%d %H:%M}"
