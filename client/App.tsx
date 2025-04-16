import React, { useState } from 'react';
import { View, Button, StyleSheet, Text } from 'react-native';
import CameraCapture from './CameraCapture';
import EmotionGraph from './EmotionGraph';
import WelcomePage from './WelcomePage';
import RNFS from 'react-native-fs';
import { Alert } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import Share from 'react-native-share';

type CameraPosition = 'front' | 'back' | 'external';

export default function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [emotionLog, setEmotionLog] = useState<
    { timestamp: number; emotion: string }[]
  >([]);
  const [isWelcomePage, setIsWelcomePage] = useState(true);
  const [cameraPosition, setCameraPosition] = useState<CameraPosition>('back');
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showRestartModal, setShowRestartModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const exportEmotionLog = async (log: { timestamp: string | number | Date; emotion: any; }[]) => {
    if (log.length === 0) {
      Alert.alert("No Data", "There's no emotion data to export.");
      return;
    }

    const csvData = 'Timestamp,Emotion\n' + log.map(entry => {
      const time = new Date(entry.timestamp).toISOString();
      return `${time},${entry.emotion}`;
    }).join('\n');

    const formattedDate = new Date().toISOString().replace(/[:.]/g, '-');
    const path = `${RNFS.DocumentDirectoryPath}/emotion_log_${formattedDate}.csv`;

    try {
      await RNFS.writeFile(path, csvData, 'utf8');
      await Share.open({
        url: 'file://' + path,
        type: 'text/csv',
        failOnCancel: false,
      });
    } catch (err) {
      console.error("Error saving file:", err);
      Alert.alert("Error", "Failed to save or share the file.");
    }
  };

  const importEmotionLog = async () => {
    try {
      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.plainText],
      });

      const fileContent = await RNFS.readFile(res.uri, 'utf8');

      const parsedData = fileContent
        .split('\n')
        .slice(1)
        .map((line) => {
          const [timestampStr, emotion] = line.split(',');
          return {
            timestamp: new Date(timestampStr).getTime(),
            emotion: emotion.trim(),
          };
        });

      setEmotionLog(parsedData);

    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        console.error('Import error:', err);
      }
    }
  };

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
                setShowSavePrompt(true);
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
                    onPress={() => setShowRestartModal(true)}
                  />
                </View>
                <View style={styles.buttonWrapper}>
                  <Button
                    title="Back To Welcome Page"
                    color="#1E90FF"
                    onPress={() => setShowWelcomeModal(true)}
                  />
                </View>
              </View>
              <View style={styles.importExportRow}>
                <View style={styles.buttonWrapper}>
                  <Button
                    title="Export Log"
                    color="#1E90FF"
                    onPress={() => exportEmotionLog(emotionLog)}
                  />
                </View>
                <View style={styles.buttonWrapper}>
                  <Button
                    title="Import Log"
                    color="#1E90FF"
                    onPress={() => setShowImportModal(true)}
                  />
                </View>
              </View>
            </>
          )}

          {showSavePrompt && (
            <View style={styles.saveModal}>
              <Text style={styles.savePromptText}>Do you want to save this emotion log?</Text>
              <View style={styles.saveButtonRow}>
                <Button
                  title="Yes"
                  onPress={async () => {
                    await exportEmotionLog(emotionLog);
                    setShowSavePrompt(false);
                  }}
                />
                <Button
                  title="No"
                  color="gray"
                  onPress={() => setShowSavePrompt(false)}
                />
              </View>
            </View>
          )}

          {showImportModal && (
            <View style={styles.saveModal}>
              <Text style={styles.savePromptText}>WARNING: This will overwrite your current emotion log. Make sure you have saved your current log before importing a new one.</Text>
              <View style={styles.saveButtonRow}>
                <Button
                  title="Proceed"
                  onPress={async () => {
                    await importEmotionLog();
                    setShowImportModal(false);
                  }}
                />
                <Button
                  title="Go Back"
                  color="gray"
                  onPress={() => setShowImportModal(false)}
                />
              </View>
            </View>
          )}

          {showRestartModal && (
            <View style={styles.saveModal}>
              <Text style={styles.savePromptText}>Are you sure you want to restart? This will clear the current session.</Text>
              <View style={styles.saveButtonRow}>
                <Button
                  title="Restart"
                  onPress={() => {
                    setIsRecording(true);
                    setShowRestartModal(false);
                  }}
                />
                <Button
                  title="Cancel"
                  color="gray"
                  onPress={() => setShowRestartModal(false)}
                />
              </View>
            </View>
          )}

          {showWelcomeModal && (
            <View style={styles.saveModal}>
              <Text style={styles.savePromptText}>Go back to welcome page? This will clear the current emotion log.</Text>
              <View style={styles.saveButtonRow}>
                <Button
                  title="Yes"
                  onPress={() => {
                    setIsWelcomePage(true);
                    setShowWelcomeModal(false);
                  }}
                />
                <Button
                  title="Cancel"
                  color="gray"
                  onPress={() => setShowWelcomeModal(false)}
                />
              </View>
            </View>
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
    marginBottom: 20,
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
  saveModal: {
    position: 'absolute',
    top: '30%',
    left: '10%',
    right: '10%',
    backgroundColor: '#222',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 5,
    zIndex: 9999,
  },
  savePromptText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  saveButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  importExportRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: 16,
    marginBottom: 70,
  },
});
