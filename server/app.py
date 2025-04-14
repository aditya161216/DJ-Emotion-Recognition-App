from flask import Flask, request, jsonify
from flask_cors import CORS
from fer import FER
import cv2
import numpy as np
import base64

app = Flask(__name__)
CORS(app)

detector = FER()

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
    except Exception as e:
        return jsonify({'error': f'Failed to decode image: {str(e)}'}), 400

    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    emotions = detector.detect_emotions(rgb_frame)

    all_top_emotions = [max(e["emotions"], key=e["emotions"].get) for e in emotions]
    
    if not all_top_emotions:
        return jsonify({'emotion': 'none', 'feedback': 'No faces detected.'})

    from collections import Counter
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
