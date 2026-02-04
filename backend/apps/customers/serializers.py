from rest_framework import serializers

from .models import Customer

class CustomerSerializer(serializers.ModelSerializer):
    visits = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = ['id', 'name', 'email', 'phone', 'address', 'status', 'notes', 'created_at', 'visits']
        read_only_fields = ['created_at']

    def get_visits(self, obj):
        return getattr(obj, 'visit_count', obj.invoices.count())
