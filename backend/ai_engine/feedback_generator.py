import yaml

def load_templates(path: str):
    """
    Loads feedback templates from a YAML file.
    """
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)["feedback_templates"]

def generate_feedback_text(feedback_types: str, templates: dict) -> str:
    """
    Converts a list of triggered feedback type IDs into a single coherent feedback message.
    """
    if not feedback_types:
        return "No specific writing needs detected. Continue following the task guidelines."
        
    parts = []
    # Split by semicolon and strip whitespace
    types_list = [x.strip() for x in feedback_types.split(";") if x.strip()]
    
    for ft in types_list:
        if ft in templates:
            # Avoid duplicate template text
            if templates[ft] not in parts:
                parts.append(templates[ft].strip())
        else:
            print(f"Warning: Template not found for {ft}")
            
    return " ".join(parts)

if __name__ == "__main__":
    print("Feedback Generator module ready.")
