from rest_framework import serializers
from django.db import transaction
from decimal import Decimal, ROUND_HALF_UP
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
            'invoice_number', 'date', 'due_date', 'payment_method',
            'subtotal', 'tax_rate', 'tax_amount', 'discount_amount',
            'amount', 'status', 'notes', 'created_at',
            'services', 'parts', 'selected_services', 'selected_parts'
        ]
        read_only_fields = ['created_at', 'amount', 'subtotal', 'tax_amount', 'invoice_number']

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
        discount_amount = Decimal(str(validated_data.pop('discount_amount', 0) or 0))
        tax_rate = Decimal(str(validated_data.pop('tax_rate', 0) or 0))
        subtotal = Decimal('0.00')
        
        # 1. Create Invoice
        invoice = Invoice.objects.create(
            amount=0,
            subtotal=0,
            tax_rate=tax_rate,
            tax_amount=0,
            discount_amount=discount_amount,
            **validated_data,
        )

        # 2. Process Services
        for svc_data in selected_services:
            service = Service.objects.get(id=svc_data['id'])
            # Use price from request if provided (override), else use service price
            price = svc_data.get('price', service.price) 
            InvoiceService.objects.create(invoice=invoice, service=service, price=price)
            subtotal += Decimal(str(price))

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
            subtotal += Decimal(str(price)) * Decimal(quantity)

        # Update Invoice Total
        tax_amount = (subtotal * tax_rate / Decimal('100')).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        total_amount = (subtotal + tax_amount - discount_amount).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        if total_amount < 0:
            total_amount = Decimal('0.00')

        invoice.subtotal = subtotal.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        invoice.tax_amount = tax_amount
        invoice.amount = total_amount
        invoice.save()

        return invoice

    @transaction.atomic
    def update(self, instance, validated_data):
        selected_services = validated_data.pop('selected_services', None)
        selected_parts = validated_data.pop('selected_parts', None)

        if 'discount_amount' in validated_data:
            validated_data['discount_amount'] = Decimal(str(validated_data['discount_amount'] or 0))
        if 'tax_rate' in validated_data:
            validated_data['tax_rate'] = Decimal(str(validated_data['tax_rate'] or 0))

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        discount_amount = Decimal(str(instance.discount_amount or 0))
        tax_rate = Decimal(str(instance.tax_rate or 0))
        subtotal = Decimal('0.00')

        if selected_services is not None:
            instance.services.all().delete()
            for svc_data in selected_services:
                service = Service.objects.get(id=svc_data['id'])
                price = svc_data.get('price', service.price)
                InvoiceService.objects.create(invoice=instance, service=service, price=price)
                subtotal += Decimal(str(price))
        else:
            for svc in instance.services.all():
                subtotal += Decimal(str(svc.price))

        if selected_parts is not None:
            for part_line in instance.parts.all():
                part = part_line.part
                part.stock += part_line.quantity
                part.save()

            instance.parts.all().delete()

            for part_data in selected_parts:
                part = Part.objects.get(id=part_data['id'])
                quantity = int(part_data['quantity'])

                if part.stock < quantity:
                    raise serializers.ValidationError(f"Insufficient stock for {part.name}. Available: {part.stock}")

                part.stock -= quantity
                part.save()

                price = part_data.get('price', part.price)
                InvoicePart.objects.create(invoice=instance, part=part, quantity=quantity, price=price)
                subtotal += Decimal(str(price)) * Decimal(quantity)
        else:
            for part_line in instance.parts.all():
                subtotal += Decimal(str(part_line.price)) * Decimal(part_line.quantity)

        tax_amount = (subtotal * tax_rate / Decimal('100')).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        total_amount = (subtotal + tax_amount - discount_amount).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        if total_amount < 0:
            total_amount = Decimal('0.00')

        instance.subtotal = subtotal.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        instance.tax_amount = tax_amount
        instance.amount = total_amount
        instance.discount_amount = discount_amount
        instance.tax_rate = tax_rate
        instance.save()

        return instance
