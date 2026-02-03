from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from rest_framework.permissions import IsAuthenticated
from rest_framework import filters
from .models import Vehicle
from .serializers import VehicleSerializer

class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['plate_number', 'make', 'model', 'customer__name']

    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        vehicle = self.get_object()
        invoices = vehicle.invoices.all().order_by('-date')
        
        data = []
        for inv in invoices:
            # Get services names
            services = [s.service.name for s in inv.services.all()]
            
            data.append({
                'id': inv.id,
                'invoice_number': inv.invoice_number,
                'date': inv.date,
                'amount': inv.amount,
                'status': inv.status,
                'services': services
            })

        return Response(data)
