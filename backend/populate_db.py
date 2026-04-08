
import os
import django
import random
from datetime import date, timedelta
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.customers.models import Customer
from apps.vehicles.models import Vehicle
from apps.services.models import Service
from apps.parts.models import Part
from apps.invoices.models import Invoice

def run():
    print("Starting population script...")

    # 1. Services
    services_data = [
        {'name': 'Standard Oil Change', 'price': 4500, 'duration': 30, 'category': 'Maintenance'},
        {'name': 'Brake Pad Replacement', 'price': 8500, 'duration': 60, 'category': 'Brakes'},
        {'name': 'Tire Rotation', 'price': 2500, 'duration': 45, 'category': 'Tires'},
        {'name': 'Engine Diagnostic', 'price': 3500, 'duration': 60, 'category': 'Engine'},
        {'name': 'AC Recharge', 'price': 6500, 'duration': 60, 'category': 'Climate'},
    ]
    
    for s in services_data:
        Service.objects.get_or_create(name=s['name'], defaults=s)

    # 2. Parts
    parts_data = [
        {'name': 'Oil Filter', 'part_number': 'OF-2024', 'price': 1800, 'stock': 50, 'category': 'Filters'},
        {'name': 'Brake Pads (Front)', 'part_number': 'BP-F-01', 'price': 4500, 'stock': 20, 'category': 'Brakes'},
        {'name': 'Synthetic Oil (5qt)', 'part_number': 'SO-5Q', 'price': 3500, 'stock': 30, 'category': 'Fluids'},
        {'name': 'Air Filter', 'part_number': 'AF-2024', 'price': 1200, 'stock': 15, 'category': 'Filters'},
        {'name': 'Spark Plug', 'part_number': 'SP-NGK', 'price': 800, 'stock': 100, 'category': 'Engine'},
    ]

    for p in parts_data:
        Part.objects.get_or_create(part_number=p['part_number'], defaults=p)

    # 3. Customers
    customers_data = [
        {'name': 'John Doe', 'phone': '0771234567', 'email': 'john@example.com', 'address': '123 Main St'},
        {'name': 'Jane Smith', 'phone': '0719876543', 'email': 'jane@example.com', 'address': '456 Oak Ave'},
        {'name': 'Alice Johnson', 'phone': '0755555555', 'email': 'alice@example.com', 'address': '789 Pine Rd'},
    ]

    customers = []
    for c in customers_data:
        cust, created = Customer.objects.get_or_create(email=c['email'], defaults=c)
        customers.append(cust)

    # 4. Vehicles
    vehicles_data = [
        {'make': 'Toyota', 'model': 'Corolla', 'year': 2018, 'plate_number': 'CAB-1234', 'customer_idx': 0},
        {'make': 'Honda', 'model': 'Civic', 'year': 2020, 'plate_number': 'CBA-5678', 'customer_idx': 1},
        {'make': 'Nissan', 'model': 'Sunny', 'year': 2015, 'plate_number': 'WP-1111', 'customer_idx': 2},
        {'make': 'Suzuki', 'model': 'WagonR', 'year': 2019, 'plate_number': 'BCC-2222', 'customer_idx': 0},
    ]

    vehicles = []
    for v in vehicles_data:
        idx = v.pop('customer_idx')
        vehicle, created = Vehicle.objects.get_or_create(plate_number=v['plate_number'], defaults={**v, 'customer': customers[idx]})
        vehicles.append(vehicle)

    # 5. Invoices
    # Create some invoices for today and past week
    today = timezone.now().date()
    
    # Paid Invoice Today
    if vehicles:
        Invoice.objects.get_or_create(
            invoice_number='INV-AUTO-001',
            defaults={
                'customer': vehicles[0].customer,
                'vehicle': vehicles[0],
                'date': today,
                'amount': 15000,
                'status': 'Paid'
            }
        )

        # Pending Invoice Today
        Invoice.objects.get_or_create(
            invoice_number='INV-AUTO-002',
            defaults={
                'customer': vehicles[1].customer,
                'vehicle': vehicles[1],
                'date': today,
                'amount': 8500,
                'status': 'Pending'
            }
        )

        # Paid Invoice Yesterday
        Invoice.objects.get_or_create(
            invoice_number='INV-AUTO-003',
            defaults={
                'customer': vehicles[2].customer,
                'vehicle': vehicles[2],
                'date': today - timedelta(days=1),
                'amount': 5000,
                'status': 'Paid'
            }
        )
        
        # Overdue Invoice (Old)
        Invoice.objects.get_or_create(
            invoice_number='INV-AUTO-004',
            defaults={
                'customer': vehicles[2].customer,
                'vehicle': vehicles[2],
                'date': today - timedelta(days=10),
                'amount': 12000,
                'status': 'Overdue'
            }
        )

    print("Database populated successfully!")

if __name__ == '__main__':
    run()
