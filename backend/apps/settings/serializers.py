from rest_framework import serializers
from .models import GarageSettings

class GarageSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = GarageSettings
        fields = '__all__'
