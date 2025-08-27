# GrooveGauge

A mobile app for DJs to analyze and visualize **crowd emotions in real-time** during live sets, helping improve song choices and audience engagement.

## Features

🎶 **Real-Time Emotion Detection**  
Uses the device camera and a Flask backend with `fer` and OpenCV to detect emotions in the crowd during your DJ set.

📈 **Post-Set Analytics**  
Displays graphs of crowd emotion trends over time to help DJs reflect and improve future sets.

📱 **Cross-Platform**  
- **iOS (React Native)** 
- **Android (React Native; Coming Soon)** 

🔐 **User Authentication**  
JWT-based auth system to securely store and retrieve session data.

## Tech Stack

- **Frontend:** React Native, TypeScript
- **Backend:** Flask, Python, OpenCV, `fer`
- **Auth:** JWT
- **Database:** PostgreSQL
- **Hosting:** AWS EC2 (backend), AWS RDS (database)

## How it works

1. The app captures crowd images every few seconds.
2. The Flask backend analyzes emotions frame-by-frame.
3. Emotion data is stored and visualized on a graph.
4. DJs can review which songs engaged the crowd best.

## Setup 

App is deployed to the App Store - click link in description to download.

## Screenshots

<p align="center">
  <img width="250" alt="IMG_2798 2" src="https://github.com/user-attachments/assets/ffa65d71-31d3-4293-881f-8d6ee0407372" /> 
  <img width="250" alt="IMG_2799 2" src="https://github.com/user-attachments/assets/6ed47ded-9a1d-4d63-b8a1-e883eeeeba9b" />
  <img src="https://github.com/user-attachments/assets/176a7acf-3f07-429b-a9ec-2aec223fec1a" width="250" />
  <img width="250" alt="IMG_2802 2" src="https://github.com/user-attachments/assets/2c363e74-6eb1-4e91-a072-54e35ff60c26" />
  <img width="250" alt="IMG_2803 2" src="https://github.com/user-attachments/assets/5b285231-94fd-40f7-b621-832e46ef7228" />
</p>


## Roadmap

✅ Frontend and backend integration  
✅ JWT user authentication  
✅ Emotion detection pipeline  
✅ Data visualization and CSV export  
✅ Deployment on AWS  
🚧 (Future plans) Shazam integration for track logging

## Why I built this

As a DJ, I often wondered how the crowd was actually feeling during sets beyond what I could see or guess. This app is designed to provide **objective feedback** on crowd engagement, helping DJs improve their track selection, energy flow, and connection with the audience.

## Contributing

Currently closed to external contributions while in early development. If interested, please contact me.

## Contact

👤 Aditya Vikrant  
🌐 [Portfolio](https://adityavikrant.netlify.app/)  
📧 vikrant.a@northeastern.edu
