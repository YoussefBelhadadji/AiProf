"""
AI Engine Logging Utility
"""

import logging
import sys

def get_logger(name):
    """Get configured logger for AI engine"""
    logger = logging.getLogger(name)
    handler = logging.StreamHandler(sys.stdout)
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)
    return logger
