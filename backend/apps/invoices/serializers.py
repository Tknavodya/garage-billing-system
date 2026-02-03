from rest_framework import serializers
from django.db import transaction
from .models import Invoice, InvoiceService, InvoicePart
from apps.customers.serializers import CustomerSerializer
from apps.vehicles.serializers import VehicleSerializer
from apps.services.models import Service
from apps.parts.models import Part

class InvoiceServiceSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source='service.name', read_only=True)
    
    class Meta:
        model = InvoiceService
        fields = ['id', 'service', 'service_name', 'price']

class InvoicePartSerializer(serializers.ModelSerializer):
    part_name = serializers.CharField(source='part.name', read_only=True)
    part_number = serializers.CharField(source='part.part_number', read_only=True)

    class Meta:
        model = InvoicePart
        fields = ['id', 'part', 'part_name', 'part_number', 'quantity', 'price']

class InvoiceSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    vehicle_name = serializers.CharField(source='vehicle.make', read_only=True) 
    vehicle_model = serializers.CharField(source='vehicle.model', read_only=True)
    vehicle_plate = serializers.CharField(source='vehicle.plate_number', read_only=True)
    
    services = InvoiceServiceSerializer(many=True, read_only=True)
    parts = InvoicePartSerializer(many=True, read_only=True)

    # Write-only fields for creation
    selected_services = serializers.ListField(child=serializers.DictField(), write_only=True, required=False)
    selected_parts = serializers.ListField(child=serializers.DictField(), write_only=True, required=False)

    class Meta:
        model = Invoice
        fields = [
            'id', 'customer', 'customer_name', 'vehicle', 
            'vehicle_name', 'vehicle_model', 'vehicle_plate',
            'invoice_number', 'date', 'amount', 'status', 'created_at',
            'services', 'parts', 'selected_services', 'selected_parts'
        ]
        read_only_fields = ['created_at', 'amount', 'invoice_number'] # Amount and Number are calculated

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.vehicle:
            representation['vehicle_display'] = f"{instance.vehicle.make} {instance.vehicle.model} ({instance.vehicle.plate_number})"
        else:
            representation['vehicle_display'] = "N/A"
        return representation

    @transaction.atomic
    def create(self, validated_data):
        selected_services = validated_data.pop('selected_services', [])
        selected_parts = validated_data.pop('selected_parts', [])
        
        # Calculate total amount
        total_amount = 0
        
        # 1. Create Invoice
        invoice = Invoice.objects.create(amount=0, **validated_data)

        # 2. Process Services
        for svc_data in selected_services:
            service = Service.objects.get(id=svc_data['id'])
            # Use price from request if provided (override), else use service price
            price = svc_data.get('price', service.price) 
            InvoiceService.objects.create(invoice=invoice, service=service, price=price)
            total_amount += float(price)

        # 3. Process Parts & Deduct Stock
        for part_data in selected_parts:
            part = Part.objects.get(id=part_data['id'])
            quantity = int(part_data['quantity'])
            
            if part.stock < quantity:
                raise serializers.ValidationError(f"Insufficient stock for {part.name}. Available: {part.stock}")
            
            # Deduct Stock
            part.stock -= quantity
            part.save()

            price = part_data.get('price', part.price)
            InvoicePart.objects.create(invoice=invoice, part=part, quantity=quantity, price=price)
            total_amount += float(price) * quantity

        # Update Invoice Total
        invoice.amount = total_amount
        invoice.save()

        return invoice
