class Settings:
    # CORS configuration.
    CORS_ALLOWED_ORIGINS = ["*"]
    CORS_ALLOWED_METHODS = ["GET", "POST", "OPTIONS"]
    CORS_ALLOWED_CREDENTIALS = True
    CORS_ALLOWED_HEADERS = "*"

    # File storage configuration: Directories for uploaded and converted files.
    UPLOAD_DIR = "uploads"
    CONVERTED_DIR = "converted"

    # File handling limits: Defines file count and size allowed in the application.
    MAX_FILES = 10
    MAX_SIZE = 10 * 1024 * 1024  # 10 MB

    # Periodic cleaning configuration: Time interval for cleaning the 'converted' Directory.
    CLEANING_INTERVAL = 3600 # 1 Hour in seconds

settings = Settings()
