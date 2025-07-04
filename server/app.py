from flask import Flask, request, jsonify
from flask_cors import CORS
from fer import FER
import cv2
import numpy as np
import base64
from img_transformations import analyze_and_preprocess
from collections import Counter
from database.models import User
from database.db import SessionLocal
import bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt


# testing both preprocessed and non-preprocessed images
# num_preprocessed = 0
# num_non_preprocessed = 0
# total_images = 0
# brightness_vals = []
# contrast_vals = []

app = Flask(__name__)
CORS(app)
detector = FER()
app.config["JWT_SECRET_KEY"] = "your_secret_key"     # change later (PUT IN ENV VARIABLE)
jwt = JWTManager(app)

@app.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    session = SessionLocal()
    try:
        # retrieve the user’s identity (email) from the validated JWT
        user_email = get_jwt_identity()

        user = session.query(User).filter_by(email=user_email).first()

        if not user:
            return jsonify({'message': 'User not found'}), 404

        return jsonify({
            'email': user.email,
            'dj_name': user.dj_name,
            'user_type': user.user_type.value
        }), 200

    except Exception as e:
        return jsonify({'message': f'Error retrieving user: {str(e)}'}), 500

    finally:
        session.close()

# route to register a new user
@app.route('/register', methods=['POST'])
def register():

    # create a new session
    session = SessionLocal()

    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        dj_name = data.get('dj_name')
        user_type = data.get('user_type')

        # hash the password for security
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        hashed_password_str = hashed_password.decode('utf-8')  # store as string in DB

        # create a new user and add it to the database
        curr_user = User(email=email, password=hashed_password_str, dj_name=dj_name, user_type=user_type)
        session.add(curr_user)
        session.commit()

        # we also generare a  jwt token here so that the user can be logged in automatically instead of having to login manually AFTER creating an account
        access_token = create_access_token(identity=email)

        return jsonify({'message': 'User registered successfully', 'access_token': access_token}), 200
    
    except Exception as e:
        session.rollback()
        return jsonify({'message': f'Error registering user: {str(e)}'}), 500
    finally:
        session.close()


# route to login a user
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user_email = data.get('email')
    user_password = data.get('password')

    # create a new session
    session = SessionLocal()

    users_with_email = session.query(User).filter_by(email=user_email).all()

    if not users_with_email:
        return jsonify({'message': 'User not found'}), 404
    
    if not bcrypt.checkpw(user_password.encode('utf-8'), users_with_email[0].password.encode('utf-8')):
        return jsonify({'message': 'Invalid password'}), 401
    
    access_token = create_access_token(identity=users_with_email[0].email)
    return jsonify({'message': 'Login successful', 'access_token': access_token}), 200
    

# @app.route('/analyze-emotion', methods=['POST'])
# def analyze_emotion():
#     global num_preprocessed, num_non_preprocessed, total_images, brightness_vals, contrast_vals

#     data = request.json
#     image_b64 = data.get('image')

#     if not image_b64:
#         return jsonify({'error': 'No image provided'}), 400

#     try:
#         img_bytes = base64.b64decode(image_b64)
#         nparr = np.frombuffer(img_bytes, np.uint8)
#         original_frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

#         # Preprocess image + get metrics
#         preprocessed_frame, brightness, contrast = analyze_and_preprocess(original_frame)
#         brightness_vals.append(brightness)
#         contrast_vals.append(contrast)

#         # Convert both to RGB
#         rgb_original = cv2.cvtColor(original_frame, cv2.COLOR_BGR2RGB)
#         rgb_preprocessed = cv2.cvtColor(preprocessed_frame, cv2.COLOR_BGR2RGB)

#         # Detect emotions
#         emotions_raw = detector.detect_emotions(rgb_original)
#         emotions_proc = detector.detect_emotions(rgb_preprocessed)

#         top_raw = [max(e["emotions"], key=e["emotions"].get) for e in emotions_raw]
#         top_proc = [max(e["emotions"], key=e["emotions"].get) for e in emotions_proc]

#         overall_raw = Counter(top_raw).most_common(1)[0][0] if top_raw else 'none'
#         overall_proc = Counter(top_proc).most_common(1)[0][0] if top_proc else 'none'

#         # Track success
#         total_images += 1
#         if overall_raw != 'none':
#             num_non_preprocessed += 1
#         if overall_proc != 'none':
#             num_preprocessed += 1

#         # Logging
#         print(f"[{brightness:.1f} | {contrast:.1f}] Raw: {overall_raw.upper()}, Preprocessed: {overall_proc.upper()}")

#         # Print summary every 50 frames
#         if total_images % 50 == 0:
#             avg_brightness = sum(brightness_vals) / len(brightness_vals)
#             avg_contrast = sum(contrast_vals) / len(contrast_vals)
#             print("\n--- SUMMARY ---")
#             print(f"Frames: {total_images}")
#             print(f"Avg Brightness: {avg_brightness:.2f}")
#             print(f"Avg Contrast: {avg_contrast:.2f}")
#             print(f"Raw Success: {num_non_preprocessed} ({(num_non_preprocessed / total_images) * 100:.1f}%)")
#             print(f"Preprocessed Success: {num_preprocessed} ({(num_preprocessed / total_images) * 100:.1f}%)")
#             print("---------------\n")

#         feedback_proc = (
#             "The crowd is loving it your music - keep it up!"
#             if overall_proc in ['happy', 'surprise']
#             else "The crowd is not very engaged. Consider playing a more upbeat song."
#         )

#     except Exception as e:
#         return jsonify({'error': f'Processing failed: {str(e)}'}), 400

#     return jsonify({
#         'raw_emotion': overall_raw,
#         'processed_emotion': overall_proc,
#         'feedback': feedback_proc
#     })

@app.route('/analyze-emotion', methods=['POST'])
def analyze_emotion():
    data = request.json
    image_b64 = data.get('image')

    if not image_b64:
        return jsonify({'error': 'No image provided'}), 400

    # decode base64 to numpy array
    try:
        img_bytes = base64.b64decode(image_b64)
        nparr = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # preprocess the image (if required)
        # preprocessed_frame = analyze_and_preprocess(frame)
    except Exception as e:
        return jsonify({'error': f'Failed to decode image: {str(e)}'}), 400

    # convert to RGB
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    # detect emotions
    emotions = detector.detect_emotions(rgb_frame)

    all_top_emotions = [max(e["emotions"], key=e["emotions"].get) for e in emotions]
    
    if not all_top_emotions:
        return jsonify({'emotion': 'none', 'feedback': 'No faces detected.'})

   
    top_overall = Counter(all_top_emotions).most_common(1)[0][0]

    feedback = (
        "The crowd is loving it your music - keep it up!"
        if top_overall in ['happy', 'surprise']
        else "The crowd is not very engaged. Consider playing a more upbeat song."
    )

    return jsonify({
        'emotion': top_overall,
        'feedback': feedback
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000)