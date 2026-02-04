import socket
import sys

def test_connect(host, port):
    result = f"Testing connection to {host}:{port}...\n"
    try:
        s = socket.create_connection((host, port), timeout=5)
        result += "Success!\n"
        s.close()
        return True, result
    except Exception as e:
        result += f"Failed: {e}\n"
        return False, result

output = "--- Connection Test ---\n"
r1, l1 = test_connect("localhost", 3306)
output += l1
r2, l2 = test_connect("127.0.0.1", 3306)
output += l2
r3, l3 = test_connect("::1", 3306)
output += l3

if r2 and not r1:
    output += "\nCONCLUSION: 'localhost' is failing but '127.0.0.1' works. Change DATABASE_HOST to '127.0.0.1'.\n"
else:
    output += "\nCONCLUSION: Check the results above.\n"

with open("connection_result.txt", "w") as f:
    f.write(output)
