from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from rest_framework.permissions import IsAuthenticated
from rest_framework import filters
from .models import Invoice
from .serializers import InvoiceSerializer
from decimal import Decimal

from django.http import HttpResponse
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle


def format_lkr(value):
    amount = Decimal(str(value or 0)).quantize(Decimal('0.01'))
    return f"Rs. {amount:,.2f}"

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['invoice_number', 'customer__name', 'vehicle__plate_number']

    @action(detail=True, methods=['get'])
    def download_pdf(self, request, pk=None):
        invoice = self.get_object()
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="Invoice_{invoice.invoice_number}.pdf"'

        doc = SimpleDocTemplate(response, pagesize=letter)
        elements = []
        styles = getSampleStyleSheet()
        
        # Custom Styles
        title_style = ParagraphStyle(
            'Title',
            parent=styles['Heading1'],
            fontSize=18,
            spaceAfter=12
        )
        normal_style = styles['Normal']
        
        # Header
        elements.append(Paragraph(f"Invoice: {invoice.invoice_number}", title_style))
        elements.append(Paragraph(f"Date: {invoice.date}", normal_style))
        if invoice.due_date:
            elements.append(Paragraph(f"Due Date: {invoice.due_date}", normal_style))
        if invoice.payment_method:
            elements.append(Paragraph(f"Payment Method: {invoice.payment_method}", normal_style))
        elements.append(Paragraph(f"Status: {invoice.status}", normal_style))
        elements.append(Spacer(1, 12))
        
        # Customer Info
        elements.append(Paragraph("<b>Customer Details:</b>", normal_style))
        elements.append(Paragraph(f"Name: {invoice.customer.name}", normal_style))
        if invoice.vehicle:
            elements.append(Paragraph(f"Vehicle: {invoice.vehicle.make} {invoice.vehicle.model} ({invoice.vehicle.plate_number})", normal_style))
        else:
            elements.append(Paragraph("Vehicle: N/A", normal_style))
        elements.append(Spacer(1, 20))
        
        # Data for Table
        data = [['Description', 'Type', 'Qty', 'Price', 'Total']]
        
        # Services
        for svc in invoice.services.all():
            data.append([
                svc.service.name, 'Service', '1', 
                format_lkr(svc.price), format_lkr(svc.price)
            ])
            
        # Parts
        for part in invoice.parts.all():
            total = part.price * part.quantity
            data.append([
                f"{part.part.name} ({part.part.part_number})", 'Part', str(part.quantity), 
                format_lkr(part.price), format_lkr(total)
            ])
            
        # Total Rows
        data.append(['', '', '', 'Subtotal:', format_lkr(invoice.subtotal)])
        data.append(['', '', '', 'Tax:', format_lkr(invoice.tax_amount)])
        data.append(['', '', '', 'Discount:', f"-{format_lkr(invoice.discount_amount)}"])
        data.append(['', '', '', 'Total Amount:', format_lkr(invoice.amount)])

        item_end_row = max(len(data) - 5, 1)
        total_start_row = max(len(data) - 4, 1)
        
        # Table Styling
        table = Table(data, colWidths=[250, 60, 40, 80, 80])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f1f5f9')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#64748b')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('ALIGN', (2, 1), (-1, -1), 'RIGHT'), # Qty, Price, Total right align
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
            ('BACKGROUND', (0, 1), (-1, item_end_row), colors.white),
            ('GRID', (0, 0), (-1, item_end_row), 1, colors.HexColor('#f1f5f9')),
            ('LINEBELOW', (0, 0), (-1, 0), 1, colors.HexColor('#cbd5e1')),
            ('FONTNAME', (-2, -4), (-1, -1), 'Helvetica-Bold'),
            ('TEXTCOLOR', (-2, -4), (-1, -1), colors.black),
            ('TOPPADDING', (0, total_start_row), (-1, -1), 10),
        ]))
        
        elements.append(table)
        elements.append(Spacer(1, 40))
        
        # Footer
        if invoice.notes:
            elements.append(Spacer(1, 16))
            elements.append(Paragraph("<b>Notes</b>", normal_style))
            elements.append(Paragraph(invoice.notes, normal_style))

        elements.append(Spacer(1, 16))
        elements.append(Paragraph("Thank you for your business!", normal_style))
        
        doc.build(elements)
        return response
