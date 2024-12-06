import subprocess
from pathlib import Path
from threading import Timer

from app.config import settings

UPLOAD_DIR = Path(settings.UPLOAD_DIR)
CONVERTED_DIR = Path(settings.CONVERTED_DIR)

# Clears the 'converted' directory to remove processed images that are no longer needed.
def clear_converted_folder():
    for file in CONVERTED_DIR.iterdir():
        try:
            if file.is_file():
                file.unlink()
        except Exception as e:
            print(f"Error al eliminar {file}: {e}")

# Clears the 'uploads' directory after processing all images to ensure temporary files do not accumulate.
def clean_uploads_folder():
    for file in UPLOAD_DIR.iterdir():
        try:
            if file.is_file():
                file.unlink()
        except Exception as e:
            print(f"Error deleting {file}: {e}")

# Periodic cleaning scheduled at regular intervals (every 1 hours in this case) to manage storage.
def periodic_cleaning():
    clear_converted_folder()
    Timer(settings.CLEANING_INTERVAL, periodic_cleaning).start()

# Converts an image to the specified format using FFmpeg and saves it in the 'converted' directory.
def convert_image(input_file: str, format: str) -> str:
    input_path = Path(input_file)
    output_file = CONVERTED_DIR / f"{input_path.stem}.{format}"

    command = [
        "ffmpeg",
        "-y",
        "-i", str(input_path),
        "-update", "true",
        "-frames:v", "1",
        str(output_file)
    ]
    
    subprocess.run(command, check=True)
    return output_file
