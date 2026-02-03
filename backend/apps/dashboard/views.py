from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta
from apps.invoices.models import Invoice
from apps.invoices.serializers import InvoiceSerializer

class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        week_start = today - timedelta(days=7)

        # 1. Today's Revenue (Sum of 'Paid' invoices with date=today)
        # Note: In a real app, might want to track Payment transaction date separately. 
        # For now, using Invoice date for simplicity.
        revenue_today = Invoice.objects.filter(
            status='Paid', 
            date=today
        ).aggregate(Sum('amount'))['amount__sum'] or 0

        # 2. Pending Invoices Count
        pending_count = Invoice.objects.filter(status='Pending').count()
        overdue_count = Invoice.objects.filter(status='Overdue').count()

        # 3. Vehicles Serviced (This Week)
        # Count unique vehicles in invoices from the last 7 days
        vehicles_serviced = Invoice.objects.filter(
            date__gte=week_start
        ).values('vehicle').distinct().count()

        # 4. Outstanding Amount (Pending + Overdue)
        outstanding_amount = Invoice.objects.filter(
            status__in=['Pending', 'Overdue']
        ).aggregate(Sum('amount'))['amount__sum'] or 0

        # 5. Recent Invoices (Top 5)
        recent_invoices_qs = Invoice.objects.all().order_by('-created_at')[:5]
        recent_invoices = InvoiceSerializer(recent_invoices_qs, many=True).data

        data = {
            "revenue_today": revenue_today,
            "pending_count": pending_count,
            "overdue_count": overdue_count,
            "vehicles_serviced": vehicles_serviced,
            "outstanding_amount": outstanding_amount,
            "recent_invoices": recent_invoices
        }

        return Response(data)
