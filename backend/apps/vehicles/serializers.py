from rest_framework import serializers

from .models import Vehicle
from apps.customers.serializers import CustomerSerializer

class VehicleSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)

    class Meta:
        model = Vehicle
        fields = ['id', 'customer', 'customer_name', 'make', 'model', 'year', 'plate_number', 'created_at']
        read_only_fields = ['created_at']
