"""
Unified Logging System
======================

Centralized logging for:
- Pipeline execution (pipeline.log)
- Errors (errors.log)
- Decisions (decisions.log)

All logs go to: logs/ folder at project root
"""

import logging
import sys
from pathlib import Path
from datetime import datetime


class LoggerSetup:
    """Initialize and manage loggers for the AI engine"""
    
    _loggers = {}
    
    @staticmethod
    def get_logger(name: str, log_type: str = "general") -> logging.Logger:
        """
        Get or create a logger
        
        Args:
            name: Logger name (usually __name__)
            log_type: Type of log (general, error, decision, pipeline)
        
        Returns:
            Configured logger instance
        """
        if name in LoggerSetup._loggers:
            return LoggerSetup._loggers[name]
        
        logger = logging.getLogger(name)
        logger.setLevel(logging.DEBUG)
        
        # Log file path
        logs_dir = Path(__file__).resolve().parents[2] / "logs"
        logs_dir.mkdir(exist_ok=True)
        
        # Map log type to filename
        log_files = {
            "pipeline": logs_dir / "pipeline.log",
            "error": logs_dir / "errors.log",
            "decision": logs_dir / "decisions.log",
            "general": logs_dir / "general.log"
        }
        
        log_file = log_files.get(log_type, log_files["general"])
        
        # Handler for file logging
        file_handler = logging.FileHandler(log_file)
        file_handler.setLevel(logging.DEBUG)
        
        # Handler for console output
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.INFO)
        
        # Formatter
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        
        file_handler.setFormatter(formatter)
        console_handler.setFormatter(formatter)
        
        if not logger.handlers:
            logger.addHandler(file_handler)
            logger.addHandler(console_handler)
        
        LoggerSetup._loggers[name] = logger
        return logger


# Convenience functions for common logging needs
def log_pipeline_start(student_id: str):
    """Log the start of pipeline for a student"""
    logger = LoggerSetup.get_logger("pipeline", "pipeline")
    logger.info(f"Pipeline started for student: {student_id}")


def log_pipeline_complete(student_id: str, success: bool):
    """Log pipeline completion"""
    logger = LoggerSetup.get_logger("pipeline", "pipeline")
    status = "SUCCESS" if success else "FAILED"
    logger.info(f"Pipeline {status} for student: {student_id}")


def log_decision(student_id: str, decision: dict):
    """Log AI decision"""
    logger = LoggerSetup.get_logger("decision", "decision")
    logger.info(f"Decision for {student_id}: {decision}")


def log_error(error: Exception, context: str = ""):
    """Log errors"""
    logger = LoggerSetup.get_logger("error", "error")
    logger.error(f"Error {context}: {str(error)}", exc_info=True)
