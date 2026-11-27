import logging
import json
from datetime import datetime, timezone
from typing import Any, Dict, Optional

def setup_logger(name: str = "app") -> logging.Logger:
    """Configure structured logger."""
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler()
        formatter = logging.Formatter('%(asctime)s [%(levelname)s] %(name)s: %(message)s')
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
    return logger

app_logger = setup_logger("university_recommender")

def log_event(event_type: str, details: Optional[Dict[str, Any]] = None, level: str = "info") -> None:
    """Log structured event with timestamp."""
    payload = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "event_type": event_type,
        "details": details or {}
    }
    msg = f"[{event_type}] {json.dumps(payload['details'])}"
    if level == "error":
        app_logger.error(msg)
    elif level == "warning":
        app_logger.warning(msg)
    else:
        app_logger.info(msg)
