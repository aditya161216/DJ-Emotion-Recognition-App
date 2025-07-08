# DJ Emotion Recognition App

A cross-platform app for DJs to analyze and visualize **crowd emotions in real-time** during live sets, helping improve song choices and audience engagement.

## Features

🎶 **Real-Time Emotion Detection**  
Uses the device camera and a Flask backend with `fer` and OpenCV to detect emotions in the crowd during your DJ set.

📈 **Post-Set Analytics**  
Displays graphs of crowd emotion trends over time to help DJs reflect and improve future sets.

📱 **Cross-Platform**  
- **iOS (React Native)** 
- **Andorid (React Native)** 

🔐 **User Authentication**  
JWT-based auth system to securely store and retrieve session data.

## Tech Stack

- **Frontend:** React Native, TypeScript
- **Backend:** Flask, Python, OpenCV, `fer`
- **Auth:** JWT
- **Database:** SQLite3
- **Hosting:** Currently in development (AWS planned)

## How it works

1. The app captures crowd images every few seconds.
2. The Flask backend analyzes emotions frame-by-frame.
3. Emotion data is stored and visualized on a graph.
4. DJs can review which songs engaged the crowd best.

## Setup (Coming Soon)

🚧 Deployment and setup instructions will be added once ready.

## Screenshots

> Will add after deployment for UI showcase.

## Roadmap

✅ Basic frontend and backend integration  
✅ JWT user authentication  
✅ Emotion detection pipeline  
✅ Data visualization and CSV export  
🚧 Deployment on AWS  
🚧 Shazam integration for track logging

## Why I built this

As a DJ, I often wondered how the crowd was actually feeling during sets beyond what I could see or guess. This app is designed to provide **objective feedback** on crowd engagement, helping DJs improve their track selection, energy flow, and connection with the audience.

## Contributing

Currently closed to external contributions while in early development. If interested, please contact me.

## Contact

👤 Aditya Vikrant  
🌐 [Portfolio](https://adityavikrant.netlify.app/)  
📧 vikrant.a@northeastern.edu
