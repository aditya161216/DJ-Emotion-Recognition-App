# DJEmotionRecognition
## An app that assists DJs with song choice based on crowd energy levels and emotions.

### If you have an iphone and want to use your phone camera as a source, download DroidCam on the App Store, and set the IP address in the code (specifically the variable "camera_address") to the given IP in the app.
### If you just want to use your laptop's webcam, comment out this line in the code:
### `cap.open(camera_address)`

### Run the script using `python3 main.py`
### Your webcam should open up, after which you should see the emotions of the faces in the frame displayed on the screen.
### Press 'q' on your keyboard to quit at anytime.


### ISSUES
### If you get the error "Can't receive frame (stream end?). Exiting ...", firstly disable 'Continuity camera' on your iphone (if using mac). Next close FaceTime (if open) and any other camera related apps, and then lock and unlock your mac. The error should be gone now.