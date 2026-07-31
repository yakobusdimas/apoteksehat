"""
Shared Flask extensions (module-level instances).

Keeping the limiter here avoids circular imports so routes can apply
per-endpoint limits with @limiter.limit(...).
"""

from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# In-memory storage for demo; use Redis for production
limiter = Limiter(key_func=get_remote_address, storage_uri='memory://')
