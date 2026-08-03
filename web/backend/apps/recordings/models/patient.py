from django.conf import settings
from django.db import models
from django_extensions.db.models import TimeStampedModel


class Patient(TimeStampedModel):
    full_name = models.CharField(max_length=255)
    date_of_birth = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="patients_created",
    )

    def __str__(self):
        return self.full_name
