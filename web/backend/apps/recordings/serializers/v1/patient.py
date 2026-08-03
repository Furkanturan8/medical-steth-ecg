from rest_framework import serializers

from apps.recordings.models import Patient


class PatientListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = ["id", "full_name", "date_of_birth", "created"]


class PatientDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = ["id", "full_name", "date_of_birth", "notes", "created_by", "created", "modified"]
        read_only_fields = ["created_by"]


class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = ["id", "full_name", "date_of_birth", "notes"]
