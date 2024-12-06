# image-converter-web-application
An image converter app that allows users to upload and convert images to different formats.

## Features

- **File validation** to ensure they meet size and type requirements.
- **Batch conversion of files** (up to 10 images at a time).
- **Downloadable converted files**, including a bulk download option in ZIP format.
- **Format selection** to convert images into various formats (JPG, PNG, GIF, etc.).
- **Real-time feedback** and processing indicators to keep users informed throughout the conversion process.

## Installation

### Prerequisites

- Python 3.8+
- FastAPI
- FFmpeg (for image format conversion)

### Steps

1. Clone the repository:
   ```
   git clone https://github.com/josephr04/image-converter-web-application.git
   cd image-converter
   ```

2. Create and activate a virtual environment:
     ```
       python -m venv venv
       source venv/bin/activate  # For Linux/MacOS
       venv\Scripts\activate  # For Windows
     ```

3. Install FFmpeg if you haven't already:
     ```
     sudo apt install ffmpeg  # For Ubuntu
     brew install ffmpeg  # For MacOS (Homebrew)
     ```

4. Run the application:
     ```
     uvicorn main:app --reload
     ```

Contributions to this project are welcome!

## Maintainers
- **Joseph Rosas** - Lead Developer

For more documentation, you can refer to the [FastAPI documentation](https://fastapi.tiangolo.com) and the [FFmpeg documentation](https://ffmpeg.org/documentation.html).
