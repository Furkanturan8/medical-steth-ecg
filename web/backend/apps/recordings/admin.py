from django.contrib import admin

from .models import AnalysisResult, Patient, Recording


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ["full_name", "date_of_birth", "created_by", "created"]
    search_fields = ["full_name"]
    list_filter = ["created"]


@admin.register(Recording)
class RecordingAdmin(admin.ModelAdmin):
    list_display = ["patient", "original_filename", "uploaded_by", "created"]
    search_fields = ["original_filename", "patient__full_name"]
    list_filter = ["created"]


@admin.register(AnalysisResult)
class AnalysisResultAdmin(admin.ModelAdmin):
    list_display = ["recording", "status", "heart_rate_bpm", "computed_at"]
    list_filter = ["status"]
    search_fields = ["recording__original_filename"]
