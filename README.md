# DJ Emotion Recognition App

A cross-platform mobile app for DJs to analyze and visualize **crowd emotions in real-time** during live sets, helping improve song choices and audience engagement.

## Features

🎶 **Real-Time Emotion Detection**  
Uses the device camera and a Flask backend with `fer` and OpenCV to detect emotions in the crowd during your DJ set.

📈 **Post-Set Analytics**  
Displays graphs of crowd emotion trends over time to help DJs reflect and improve future sets.

📱 **Cross-Platform**  
- **iOS (React Native)** 
- **Android (React Native)** 

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

## Setup (Coming Soon)

🚧 Currently in beta. App is deployed and undergoing testing ahead of a public App Store release.

## Screenshots

> Beta build - Currently undergoing testing.
<p align="center">
  <img src="https://github.com/user-attachments/assets/08cca286-3e68-41f7-9e84-d281a42c786a" width="250" />
  <img src="https://github.com/user-attachments/assets/e822c040-88d8-4823-9a7f-e8453083a1c1" width="250" />
  <img src="https://github.com/user-attachments/assets/85d712fc-980c-47cf-a4c4-c05fc65fd04d" width="250" />
  <img src="https://github.com/user-attachments/assets/176a7acf-3f07-429b-a9ec-2aec223fec1a" width="250" />
  <img src="https://github.com/user-attachments/assets/b16420f5-9df9-4f7a-826a-9d77b0002de9" width="250" />
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
