"""
AI Engine Parsers
Configuration and data parsing utilities
"""

import yaml
from pathlib import Path

def parse_yaml_config(filepath):
    """
    Parse YAML configuration file
    
    Args:
        filepath: Path to YAML file
        
    Returns:
        dict: Parsed YAML content
    """
    try:
        with open(filepath, 'r') as f:
            config = yaml.safe_load(f)
        return config
    except FileNotFoundError:
        raise ValueError(f'Config file not found: {filepath}')
    except yaml.YAMLError as e:
        raise ValueError(f'Invalid YAML: {e}')

def parse_feedback_templates(config_path):
    """Parse feedback templates from YAML"""
    return parse_yaml_config(config_path)

def parse_rules(config_path):
    """Parse rules configuration from YAML"""
    return parse_yaml_config(config_path)

def parse_thresholds(config_path):
    """Parse thresholds configuration from YAML"""
    return parse_yaml_config(config_path)
