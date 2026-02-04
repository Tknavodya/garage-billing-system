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
    data={'email': 'admin@example.com', 'password': 'password123'}
)

print(f"Login Status: {status}")
if status != 200:
    print("Login Failed:", body)
    exit(1)

tokens = json.loads(body)
access_token = tokens['access']
print("Login Successful.")

# 2. Fetch Services
print("Fetching services...")
status, body = make_request(
    'http://localhost:8001/api/services/',
    headers={'Authorization': f'Bearer {access_token}'}
)

print(f"Services Status: {status}")
print("Response:", body)
