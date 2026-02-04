import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection

def fix_duration():
    with connection.cursor() as cursor:
        print("Checking current data...")
        cursor.execute("SELECT id, duration FROM services")
        rows = cursor.fetchall()
        for row in rows:
            print(f"ID: {row[0]}, Duration: {row[1]}")
            
        print("\nCleaning data...")
        # Simple heuristic cleaning
        cursor.execute("UPDATE services SET duration = '60' WHERE duration LIKE '%1 hr%'")
        cursor.execute("UPDATE services SET duration = '30' WHERE duration LIKE '%30 mins%'")
        cursor.execute("UPDATE services SET duration = '45' WHERE duration LIKE '%45 mins%'")
        cursor.execute("UPDATE services SET duration = '90' WHERE duration LIKE '%1.5 hr%'")
        # Strip any other non-numeric chars if possible or just set defaults for specific bad rows
        
        print("Verifying data...")
        cursor.execute("SELECT id, duration FROM services")
        rows = cursor.fetchall()
        for row in rows:
            print(f"ID: {row[0]}, Duration: {row[1]}")

        print("\nAltering column type...")
        try:
             cursor.execute("ALTER TABLE services MODIFY duration int(11) NOT NULL DEFAULT 60")
             print("Column altered successfully!")
        except Exception as e:
             print(f"Alter failed: {e}")

if __name__ == '__main__':
    fix_duration()
