from flask_cors import CORS
from fer import FER
import cv2
import numpy as np
import base64


# apply gamma correction to the image
def apply_gamma_correction(img, gamma=0.5):
    inv_gamma = 1.0 / gamma
    table = np.array([(i / 255.0) ** inv_gamma * 255 for i in np.arange(0, 256)]).astype("uint8")
    return cv2.LUT(img, table)

# apply CLAHE to the image
def apply_clahe(img):
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    cl = clahe.apply(l)
    merged = cv2.merge((cl, a, b))
    return cv2.cvtColor(merged, cv2.COLOR_LAB2BGR)
    
# apply denoising to the image
def apply_denoising(img):
    return cv2.fastNlMeansDenoisingColored(img, None, 10, 10, 7, 21)

# analyzes and preprocess the given image based on brightness and contrast
def analyze_and_preprocess(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    brightness = np.mean(gray)
    contrast = np.std(gray)

    if brightness < 60:
        img = apply_gamma_correction(img, gamma=0.5)

    if contrast < 40:
        img = apply_clahe(img)

    if np.var(gray) > 1000:  # simplistic noise check
        img = apply_denoising(img)

    return img, brightness, contrast
