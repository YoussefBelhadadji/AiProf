
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from ai_engine.main import run_pipeline


def main():
    if len(sys.argv) < 2:
        print("Usage: python run_pipeline.py '<student_json>'")
        print("Example: python run_pipeline.py '{\"student_id\": \"123\", \"submissions\": []}'")
        sys.exit(1)
    
    try:
        data = json.loads(sys.argv[1])
        result = run_pipeline(data)
        print(json.dumps(result, indent=2))
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON - {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
