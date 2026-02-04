import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection

def fix_tables():
    with connection.cursor() as cursor:
        print("Creating table invoices_invoiceservice...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS invoices_invoiceservice (
                id INT AUTO_INCREMENT PRIMARY KEY,
                invoice_id INT NOT NULL,
                service_id INT NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
                FOREIGN KEY (service_id) REFERENCES services(id)
            )
        """)
        print("Table invoices_invoiceservice created.")

        print("Creating table invoices_invoicepart...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS invoices_invoicepart (
                id INT AUTO_INCREMENT PRIMARY KEY,
                invoice_id INT NOT NULL,
                part_id INT NOT NULL,
                quantity INT NOT NULL DEFAULT 1,
                price DECIMAL(10, 2) NOT NULL,
                FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
                FOREIGN KEY (part_id) REFERENCES parts(id)
            )
        """)
        print("Table invoices_invoicepart created.")

        # Also verify 'amount' column in invoices
        cursor.execute("DESCRIBE invoices")
        columns = [col[0] for col in cursor.fetchall()]
        print(f"Invoices columns: {columns}")
        
        if 'amount' not in columns:
            if 'total_amount' in columns:
                print("Renaming total_amount to amount...")
                cursor.execute("ALTER TABLE invoices CHANGE total_amount amount decimal(10,2) NOT NULL DEFAULT 0.00")
            else:
                print("Adding amount column...")
                cursor.execute("ALTER TABLE invoices ADD COLUMN amount decimal(10,2) NOT NULL DEFAULT 0.00")

if __name__ == '__main__':
    fix_tables()
