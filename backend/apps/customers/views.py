from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count
from .models import Customer
from .serializers import CustomerSerializer

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset().annotate(visit_count=Count('invoices'))
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)

        search = self.request.query_params.get('search')
        if search:
            query = Q(name__icontains=search) | Q(email__icontains=search) | Q(phone__icontains=search)
            if search.isdigit():
                query = query | Q(visit_count=int(search))
            queryset = queryset.filter(query)
        return queryset

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
