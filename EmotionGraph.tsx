import React from 'react';
import { View, Text } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { ScrollView, Dimensions } from 'react-native';


const screenWidth = Dimensions.get('window').width;

const emotionToScore = (emotion: string): number => {
    switch (emotion) {
        case 'happy': return 3;
        case 'surprise': return 2;
        case 'neutral': return 1;
        case 'sad': return 0;
        default: return 0;
    }
};

export default function EmotionGraph({ data }: { data: { timestamp: number; emotion: string }[] }) {
    const chartData = {
        labels: data.map(e => {
            const date = new Date(e.timestamp);
            return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
        }),
        datasets: [
            {
                data: data.map(e => emotionToScore(e.emotion)),
                strokeWidth: 2,
            },
        ],
    };

    const dynamicWidth = Math.max(screenWidth, data.length * 50);

    return (
        <View style={{paddingTop: 24 }}>
            <Text style={{ textAlign: 'center', marginTop: 16, fontSize: 18, color: 'white' }}>Crowd Energy Over Time</Text>
            <ScrollView horizontal>
            <LineChart
                data={chartData}
                width={dynamicWidth}
                height={220}
                yAxisLabel=""
                yAxisSuffix=""
                chartConfig={{
                    backgroundColor: '#1E2923',
                    backgroundGradientFrom: '#08130D',
                    backgroundGradientTo: '#08130D',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                }}
                bezier
                    style={{ marginVertical: 16, borderRadius: 8, alignSelf: 'center' }}
                />
            </ScrollView>
        </View>
    );
}