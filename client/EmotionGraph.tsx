import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const emotionToScore = (emotion: string): number => {
    switch (emotion) {
        case 'happy': return 100;
        case 'surprise': return 75;
        case 'neutral': return 50;
        case 'sad': return 20;
        default: return 0;
    }
};

export default function EmotionGraph({ data }: { data: { timestamp: number; emotion: string }[] }) {
    const scores = data.map(e => emotionToScore(e.emotion));

    const chartData = {
        labels: data.map(e => {
            const date = new Date(e.timestamp);
            return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
        }),
        datasets: [{ data: scores, strokeWidth: 2 }],
    };

    const dynamicWidth = Math.max(screenWidth, data.length * 50);

    const avgHappiness = scores.length > 0
        ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
        : '0';

    const emotionCount: { [key: string]: number } = {};
    data.forEach(({ emotion }) => {
        emotionCount[emotion] = (emotionCount[emotion] || 0) + 1;
    });
    const mostFrequentEmotion = Object.entries(emotionCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    const peakMoment = data[scores.indexOf(Math.max(...scores))];
    const peakTime = peakMoment
        ? new Date(peakMoment.timestamp).toLocaleTimeString()
        : 'N/A';

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🎶 Crowd Happiness Trend</Text>

            <View style={styles.graphWrapper}>
                <View style={styles.yAxisWrapper}>
                    <Text style={styles.axisLabelY}>Happiness %</Text>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.chartContainer}>
                        <LineChart
                            data={chartData}
                            width={dynamicWidth}
                            height={220}
                            yAxisSuffix="%"
                            yLabelsOffset={10}
                            chartConfig={{
                                backgroundColor: '#1E2923',
                                backgroundGradientFrom: '#08130D',
                                backgroundGradientTo: '#08130D',
                                decimalPlaces: 0,
                                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                                propsForDots: {
                                    r: '4',
                                    strokeWidth: '2',
                                    stroke: '#00FFFF',
                                },
                            }}
                            bezier
                            style={styles.chart}
                        />
                    </View>
                </ScrollView>

            </View>

            <Text style={styles.axisLabelX}>Time →</Text>

            <View style={styles.statsContainer}>
                <Text style={styles.stat}>Average Happiness: {avgHappiness}%</Text>
                <Text style={styles.stat}>Most Common Emotion: {mostFrequentEmotion.toUpperCase()}</Text>
                <Text style={styles.stat}>Peak Happiness Time: {peakTime}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 48,
        paddingBottom: 16,
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'flex-start',
    },
    title: {
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'bold',
        color: '#00FFFF',
        marginBottom: 16,
    },
    graphWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    yAxisWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 4,
    },
    axisLabelY: {
        transform: [{ rotate: '-90deg' }],
        color: '#fff',
        fontSize: 12,
        width: 70,
        textAlign: 'center',
    },
    chart: {
        borderRadius: 8,
        marginLeft: 5,
    },

    axisLabelX: {
        color: '#fff',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 6,
    },
    statsContainer: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 32,
    },
    stat: {
        fontSize: 16,
        color: '#fff',
        marginBottom: 6,
        textAlign: 'center',
    },
    chartContainer: {
        paddingLeft: 0,   // <-- reduces whitespace to the left
        marginLeft: -12,  // <-- shifts the graph more left
    },
});
