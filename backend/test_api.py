import urllib.request
import urllib.error
import json

try:
    req = urllib.request.Request(
        "http://127.0.0.1:8000/docs",
        method="GET"
    )
    with urllib.request.urlopen(req, timeout=3) as response:
        print(f"Status: {response.status}")
except urllib.error.URLError as e:
    print(f"Failed to connect: {e}")
