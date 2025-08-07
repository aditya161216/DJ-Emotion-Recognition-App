from collections import Counter
import cv2 as cv
import numpy as np
from fer import FER
import psutil
import time
from plyer import notification


# start video capture
cap = cv.VideoCapture(0)

# initialize emotion detection module
detector = FER()
camera_address = None

last_notification_time = time.time()

# send notifs every x seconds
notification_interval = 10  


# check if camera opened successfully
if not cap.isOpened():
    print("Cannot open camera")
    exit()


# give the user feedback based on the top crowd emotion
def get_user_feedback(top_overall_emotion):
    if top_overall_emotion != 'happy' and top_overall_emotion != 'surprise':
        return "The crowd is not very engaged. Consider playing a more upbeat song."

    elif top_overall_emotion == 'happy' or top_overall_emotion == 'surprise':
        return "The crowd is loving it your music - keep it up!"

    return ""

# sends an alert to the user based on the feedback 
def send_notification(text_to_send, notification_interval):
    global last_notification_time

    # send real time notification
    current_time = time.time()

    # check if enough time has passed since last notification
    if current_time - last_notification_time > notification_interval:
        notification.notify(title="Alert", message=text_to_send, timeout=5)
        last_notification_time = current_time 

while cap.isOpened():

    # capture video frame by frame
    ret, frame = cap.read()

    # if frame is read correctly ret is True
    if not ret:
        print("Can't receive frame (stream end?). Exiting ...")
        break


    rgb_frame = cv.cvtColor(frame, cv.COLOR_BGR2RGB)
    rgb_frame = cv.flip(rgb_frame, 1)     # invert camera

    emotions = detector.detect_emotions(rgb_frame)    # detect multiple emotions

    # get size of the current frame
    frame_height, frame_width, _ = rgb_frame.shape

    # array of top emotions of every face
    all_top_emotions = []

    # get the top emotion of every face
    for e in emotions:

        # we get the boundary of the face detected and scores of all emotions
        boundary_box = e["box"]
        all_emotions_dict = e["emotions"]

        # now get top emotion and its corresponding score
        top_emotion = max(all_emotions_dict, key=all_emotions_dict.get)
        all_top_emotions.append(top_emotion)    # add to list of top emotions of every face
        top_emotion_score = all_emotions_dict[top_emotion]

        # draw bounding box around face
        x, y, w, h = boundary_box
        cv.rectangle(rgb_frame, (x, y), (x + w, y + h), (255, 0, 0), 2)

        # display emotion above face
        text = f"{top_emotion}: {top_emotion_score:.2f}"
        cv.putText(rgb_frame, text, (x, y - 10), cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

    # keeps track of the top overall emotion
    top_overall_emotion = None

    font_size = min(frame_width, frame_height) / 1000
    font_thickness = max(1, int(font_size * 2))

    # get overall top emotion
    if all_top_emotions:
        c = Counter(all_top_emotions)   
        top_overall_emotion = max(c, key=c.get)

        # print out top overall emotion
        text = f"Top crowd emotion: {top_overall_emotion}"
        cv.putText(rgb_frame, text, (int(frame_width * 0.05), int(frame_height * 0.1)), cv.FONT_HERSHEY_SIMPLEX, font_size, (0, 0, 255), font_thickness)


    # now give feedback based on the crowd emotions
    curr_text = get_user_feedback(top_overall_emotion)
    cv.putText(rgb_frame, curr_text, (int(frame_width * 0.05), int(frame_height * 0.15)), cv.FONT_HERSHEY_SIMPLEX, 1.5, (0, 0, 255), 2)

    # send notification to user
    send_notification(curr_text, notification_interval)
    
    # display the frame
    cv.imshow('Crowd Emotion Detection', rgb_frame)

    # press q to quit
    if cv.waitKey(1) == ord('q'):
        break


# release the capture after everything is done
cap.release()
cv.destroyAllWindows()

