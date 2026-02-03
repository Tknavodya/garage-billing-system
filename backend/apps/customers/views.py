from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from rest_framework.permissions import IsAuthenticated
from rest_framework import filters
from .models import Customer
from .serializers import CustomerSerializer

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'email', 'phone']

    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        customer = self.get_object()
        
        # Get Invoices
        invoices = customer.invoices.all().order_by('-date')
        
        # Get Vehicles via invoices
        # Using a set to ensure uniqueness since distinct() on values might include invoice-specifics if not careful,
        # but values('field').distinct() is standard.
        unique_vehicles = customer.invoices.exclude(vehicle__isnull=True).values(
            'vehicle__id', 
            'vehicle__make', 
            'vehicle__model', 
            'vehicle__plate_number'
        ).distinct()

        return Response({
            'invoices': [{
                'id': inv.id,
                'invoice_number': inv.invoice_number,
                'date': inv.date,
                'amount': inv.amount,
                'status': inv.status,
                'vehicle_str': f"{inv.vehicle.make} {inv.vehicle.model}" if inv.vehicle else "N/A"
            } for inv in invoices],
            'vehicles': list(unique_vehicles)
        })
