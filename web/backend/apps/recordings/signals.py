from django.db.models.signals import post_delete
from django.dispatch import receiver

from apps.recordings.models import AnalysisResult, Recording


@receiver(post_delete, sender=Recording)
def delete_recording_file(sender, instance, **kwargs):
    if instance.audio_file:
        instance.audio_file.delete(save=False)


@receiver(post_delete, sender=AnalysisResult)
def delete_analysis_files(sender, instance, **kwargs):
    if instance.report_image:
        instance.report_image.delete(save=False)
    if instance.filtered_audio_file:
        instance.filtered_audio_file.delete(save=False)
