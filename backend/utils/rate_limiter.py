from datetime import datetime, timedelta
from collections import defaultdict

class RateLimiter:
    def __init__(self, max_requests=10, window_minutes=60):
        self.max_requests = max_requests
        self.window_minutes = window_minutes
        self.requests = defaultdict(list)
    
    def is_allowed(self, ip_address):
        now = datetime.now()
        window_start = now - timedelta(minutes=self.window_minutes)
        
        # Clean up old requests
        self.requests[ip_address] = [
            req_time for req_time in self.requests[ip_address] 
            if req_time > window_start
        ]
        
        # Check if under limit
        if len(self.requests[ip_address]) < self.max_requests:
            self.requests[ip_address].append(now)
            return True
            
        return False
