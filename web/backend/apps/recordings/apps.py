from django.apps import AppConfig


class RecordingsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.recordings"
    label = "recordings"

    def ready(self):
        from apps.recordings import signals  # noqa: F401
