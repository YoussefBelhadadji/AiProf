"""
AI Engine Validators
Input validation functions
"""

def validate_student_data(data):
    """
    Validate incoming student submission data
    
    Args:
        data: Dictionary with student submission
        
    Returns:
        bool: True if valid
        
    Raises:
        ValueError: If validation fails
    """
    required_fields = ['student_id', 'text', 'cohort_id']
    
    for field in required_fields:
        if field not in data:
            raise ValueError(f'Missing required field: {field}')
    
    if not isinstance(data['text'], str) or len(data['text']) == 0:
        raise ValueError('Text field cannot be empty')
    
    return True

def validate_config(config):
    """Validate configuration object"""
    if not isinstance(config, dict):
        raise ValueError('Config must be a dictionary')
    return True
