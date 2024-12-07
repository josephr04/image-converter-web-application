import os
from typing import List

from fastapi import APIRouter, UploadFile, Form, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse

from app.config import settings
from app.api.utils import convert_image, periodic_cleaning, clean_uploads_folder

router = APIRouter()

UPLOAD_DIR = settings.UPLOAD_DIR
CONVERTED_DIR = settings.CONVERTED_DIR

# Starts periodic cleaning to remove processed images from the 'converted' directory that are no longer needed.
periodic_cleaning()

# Checks that no file exceeds the 10 MB size limit to prevent server overload.
async def validate_file_size(file: UploadFile):
    file_size = len(await file.read()) 
    if file_size > settings.MAX_SIZE:
        return JSONResponse(
            status_code=404,
            content={"detail": "One or more images exceeds the 10 MB size limit. Please try again."}
        )    

    await file.seek(0)

# Serves the processed image selected by the user for download.
@router.get("/converted/{file_name}")
async def download_file(file_name: str):

    file_path = os.path.join(CONVERTED_DIR, file_name)

    # Checks if the file exists in the 'converted' directory, and returns an error response if not.
    if not os.path.exists(file_path):
        return JSONResponse(
            status_code=404,
            content={"detail": "The image is no longer available. Please reload the page and convert it again."}
        )
    
    return FileResponse(file_path, media_type="application/octet-stream", filename=file_name)

# Converts the provided images to the selected format and serves them to the front-end.
@router.post("/convert/")
async def convert_images(background_tasks: BackgroundTasks, images: List[UploadFile], format: str = Form(...)):

    # Limit of 10 images per conversion to optimize performance.
    if len(images) > settings.MAX_FILES:
            return JSONResponse(
            status_code=404,
            content={"detail": "You can only process up to 10 images at once."}
        )
    
    # Validates the size of each file before proceeding with the conversion
    for image in images:
        size_check = await validate_file_size(image)
        if isinstance(size_check, JSONResponse):
            return size_check 

    try:
        converted_files = []
        for image in images:
            input_file = os.path.join(UPLOAD_DIR, image.filename)
            with open(input_file, "wb") as f:
                f.write(await image.read())
            
            output_file = convert_image(input_file, format.lower())
            converted_files.append(output_file)

        # Cleans the 'uploads' directory to prevent storage issues and optimize server space.
        background_tasks.add_task(clean_uploads_folder)

        return {"files": [str(file) for file in converted_files]}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
