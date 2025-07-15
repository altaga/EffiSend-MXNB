# Imports
from fastapi import FastAPI, Depends
from auth import check_api_key 
from pydantic import BaseModel
from deepface import DeepFace
from PIL import Image
from pathlib import Path
import base64
from io import BytesIO
import os

# Final Paths
TEMP_DIR = Path("deepface/productionTemp")
DB_DIR = Path("deepface/productionDB")

# Testing
img1_path = 'deepface/test/img1.jpg'
img2_path = 'deepface/test/img2.jpg'
result = DeepFace.verify(img1_path,img2_path, anti_spoofing = True )
print("Face API Status:",result["verified"])

# Fast API Classes

class ItemComparison(BaseModel):
    image1 : str
    image2 : str

class ItemUser(BaseModel):
    image : str
    address : str
    
class ItemUserFace(BaseModel):
    image : str
    nonce : str

class ItemFind(BaseModel):
    image : str

app = FastAPI(max_request_body_size=10 * 1024 * 1024)

@app.get("/", dependencies=[Depends(check_api_key)])
async def root():
    return {"message": "Hello World"}

@app.post("/fetchOrSave", dependencies=[Depends(check_api_key)])
async def findUser(item: ItemUserFace):
    # Define a function to handle image processing and facial recognition
    def process_image(image_data):
        # Save image to temporary file
        temp_file = TEMP_DIR / f"{os.urandom(32).hex()}.jpg"
        with open(temp_file, "wb") as f:
            f.write(base64.b64decode(image_data))
        
        # Perform facial recognition
        try:
            result = DeepFace.find(img_path=temp_file, db_path=DB_DIR, anti_spoofing=True)
            return result[0].identity[0].split('.')[0].split('/')[2]
        except Exception as e:
            return False
        finally:
            # Remove temporary file
            temp_file.unlink()

    # Define a function to handle database operations
    def save_image(image_data, nonce):
        image = Image.open(BytesIO(base64.b64decode(image_data)))
        image.save(DB_DIR / f"{nonce}.jpg")
        return True

    # Process image and facial recognition
    result = process_image(item.image)
    if result:
        return {"result": result}
    else:
        # Save image to database
        save_image(item.image, item.nonce)
        return {"result": True}
    
@app.post("/fetch", dependencies=[Depends(check_api_key)])
async def findUser(item: ItemFind):
    # Define a function to handle image processing and facial recognition
    def process_image(image_data):
        # Save image to temporary file
        temp_file = TEMP_DIR / f"{os.urandom(32).hex()}.jpg"
        with open(temp_file, "wb") as f:
            f.write(base64.b64decode(image_data))
        
        # Perform facial recognition
        try:
            result = DeepFace.find(img_path=temp_file, db_path=DB_DIR, anti_spoofing=True)
            return result[0].identity[0].split('.')[0].split('/')[2]
        except Exception as e:
            return False
        finally:
            # Remove temporary file
            temp_file.unlink()

    # Process image and facial recognition
    result = process_image(item.image)
    print(result)
    if result:
        return {"result": result}
    else:
        return {"result": False}