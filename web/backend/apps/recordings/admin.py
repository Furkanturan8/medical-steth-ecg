from django.contrib import admin

from .models import AnalysisResult, Patient, Recording

admin.site.register(Patient)
admin.site.register(Recording)
admin.site.register(AnalysisResult)
