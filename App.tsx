import React, { useState } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import CameraCapture from './CameraCapture';
import EmotionGraph from './EmotionGraph';

export default function App() {
  const [isRecording, setIsRecording] = useState(true);
  const [emotionLog, setEmotionLog] = useState<
    { timestamp: number; emotion: string }[]
  >([]);

  return (
    <View style={{ flex: 1 }}>
      {isRecording ? (
        <CameraCapture
          onComplete={(log) => {
            setEmotionLog(log);
            setIsRecording(false);
          }}
        />
      ) : (
        <EmotionGraph data={emotionLog} />
      )}
      <Button
        title={isRecording ? 'End Set' : 'Restart'}
        onPress={() => setIsRecording(!isRecording)}
      />
    </View>
  );
}