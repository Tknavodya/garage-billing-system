import urllib.request
import json
import urllib.error

def make_request(url, method='GET', data=None, headers=None):
    if headers is None:
        headers = {}
    
    if data:
        data = json.dumps(data).encode('utf-8')
        headers['Content-Type'] = 'application/json'
        
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as response:
            return response.status, response.read().decode('utf-8')
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8')
    except Exception as e:
        return 0, str(e)

# 1. Login
print("Logging in...")
status, body = make_request(
    'http://localhost:8001/api/users/auth/login/',
    method='POST',
    data={'email': 'tknawodya@gmail.com', 'password': 'password'}
)

if status != 200:
    print("Login Failed:", body)
    exit(1)

tokens = json.loads(body)
access_token = tokens['access']
print("Login Successful.")

# 2. Create Invoice
print("Creating invoice...")
invoice_data = {
    "customer": 1,
    "vehicle": 1,
    "date": "2026-02-04",
    "selected_services": [{"id": 1, "price": 49.99}],
    "selected_parts": [{"id": 1, "quantity": 1, "price": 12.50}]
}

status, body = make_request(
    'http://localhost:8001/api/invoices/',
    method='POST',
    headers={'Authorization': f'Bearer {access_token}'},
    data=invoice_data
)

print(f"Invoice Creation Status: {status}")
print("Response:", body)
