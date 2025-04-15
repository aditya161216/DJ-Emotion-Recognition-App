import React, { useState } from 'react';
import { View, Button, StyleSheet, Text } from 'react-native';
import CameraCapture from './CameraCapture';
import EmotionGraph from './EmotionGraph';
import WelcomePage from './WelcomePage';

type CameraPosition = 'front' | 'back' | 'external';

export default function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [emotionLog, setEmotionLog] = useState<
    { timestamp: number; emotion: string }[]
  >([]);
  const [isWelcomePage, setIsWelcomePage] = useState(true);
  const [cameraPosition, setCameraPosition] = useState<CameraPosition>('back');

  return (
    <>
      {isWelcomePage ? (
        <>
          <WelcomePage />
          <View style={styles.restartButton}>
            <Button
              title="Start"
              onPress={() => {
                setCameraPosition('back'); 
                setIsWelcomePage(false);
                setIsRecording(true);
              }}
            />
          </View>
        </>
      ) : (
        <View style={{ flex: 1 }}>
          {isRecording ? (
            <CameraCapture
              onComplete={(log) => {
                setEmotionLog(log);
                setIsRecording(false);
              }}
              cameraPosition={cameraPosition}
              setCameraPosition={setCameraPosition}
            />
          ) : (
            <>
              {emotionLog.length > 0 ? (
                <EmotionGraph data={emotionLog} />
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>No data to show.</Text>
                  <Text style={styles.noDataSubtext}>
                    Start recording to see results!
                  </Text>
                </View>
              )}

              <View style={styles.buttonRow}>
                <View style={styles.buttonWrapper}>
                  <Button
                    title="Restart"
                    color="#1E90FF"
                    onPress={() => setIsRecording(true)} 
                  />
                </View>
                <View style={styles.buttonWrapper}>
                  <Button
                    title="Welcome Page"
                    color="#1E90FF"
                    onPress={() => setIsWelcomePage(true)}
                  />
                </View>
              </View>
            </>
          )}
        </View>
      )}
    </>
  );
}



const styles = StyleSheet.create({
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 40,
  },
  restartButton: {
    marginTop: 20,
    marginBottom: 40,
  },
  buttonWrapper: {
    flex: 1,
    marginHorizontal: 8,
    borderRadius: 10,
    overflow: 'hidden', 
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
    paddingHorizontal: 20,
  },
  noDataText: {
    color: '#00FFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  noDataSubtext: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
  },

});
