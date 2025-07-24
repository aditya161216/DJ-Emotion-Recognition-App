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

export default function EmotionGraph({
    data,
    logDate,
}: {
    data: { timestamp: number; emotion: string }[];
    logDate?: string;
}) {
    const scores = data.map(e => emotionToScore(e.emotion));

    const startTime = data.length > 0 ? data[0].timestamp : 0;

    const chartData = {
        labels: data.map((e, index) => {
            if (index % Math.ceil(data.length / 6) === 0 || index === data.length - 1) {
                const totalSeconds = index * 2.5;   // each reading 2.5 sec apart
                const minutes = Math.floor(totalSeconds / 60);
                const seconds = Math.floor(totalSeconds % 60);
                return `${minutes}:${String(seconds).padStart(2, '0')}`;
            }
            return '';
        }),
        datasets: [{ data: scores, strokeWidth: 2 }],
    };

    // const chartData = {
    //     labels: data.map((e, index) => {
    //         if (index % Math.ceil(data.length / 6) === 0 || index === data.length - 1) {
    //             const date = new Date(e.timestamp);
    //             return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
    //         }
    //         return '';
    //     }),
    //     datasets: [{ data: scores, strokeWidth: 2 }],
    // };

    const dynamicWidth = Math.max(screenWidth - 40, data.length * 60);

    const avgHappiness = scores.length > 0
        ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
        : '0';

    const emotionCount: { [key: string]: number } = {};
    data.forEach(({ emotion }) => {
        emotionCount[emotion] = (emotionCount[emotion] || 0) + 1;
    });
    const mostFrequentEmotion = Object.entries(emotionCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    const peakMoment = data[scores.indexOf(Math.max(...scores))];
    const peakTime = peakMoment ? (() => {
        const peakIndex = data.indexOf(peakMoment);
        const totalSeconds = peakIndex * 2.5;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);
        return `${minutes}:${String(seconds).padStart(2, '0')}`;
    })() : 'N/A';

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Session Overview</Text>
                {logDate && (
                    <Text style={styles.date}>{logDate}</Text>
                )}
            </View>

            {/* Chart */}
            <View style={styles.chartContainer}>
                {/* Y-axis label */}
                <Text style={styles.yAxisLabel}>Engagement Level (%)</Text>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <LineChart
                        data={chartData}
                        width={dynamicWidth}
                        height={180}
                        yAxisSuffix="%"
                        yLabelsOffset={10}
                        chartConfig={{
                            backgroundColor: 'transparent',
                            backgroundGradientFrom: '#000',
                            backgroundGradientTo: '#000',
                            decimalPlaces: 0,
                            color: (opacity = 1) => `rgba(0, 255, 255, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.5})`,
                            propsForDots: {
                                r: '3',
                                strokeWidth: '1',
                                stroke: '#00FFFF',
                                fill: '#000'
                            },
                            propsForBackgroundLines: {
                                strokeDasharray: '3, 3',
                                stroke: 'rgba(255, 255, 255, 0.05)',
                                strokeWidth: 1,
                            },
                        }}
                        bezier
                        style={styles.chart}
                        withInnerLines={true}
                        withOuterLines={false}
                        withVerticalLabels={true}
                        withHorizontalLabels={true}
                        withShadow={false}
                    />
                </ScrollView>

                {/* X-axis label */}
                <Text style={styles.xAxisLabel}>Time (minutes:seconds)</Text>
            </View>

            {/* Metrics */}
            <View style={styles.metricsContainer}>
                <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>Average Happiness</Text>
                    <Text style={styles.metricValue}>{avgHappiness}%</Text>
                </View>

                <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>Dominant Emotion</Text>
                    <Text style={styles.metricValue}>{mostFrequentEmotion}</Text>
                </View>

                <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>Peak Time</Text>
                    <Text style={styles.metricValue}>{peakTime}</Text>
                </View>

                <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>Total Readings</Text>
                    <Text style={styles.metricValue}>{data.length}</Text>
                </View>
            </View>

            {/* Insight */}
            <View style={styles.insightContainer}>
                <Text style={styles.insightText}>
                    {Number(avgHappiness) >= 70
                        ? 'Excellent crowd engagement throughout your set.'
                        : Number(avgHappiness) >= 50
                            ? 'Good energy levels with room for peak moments.'
                            : 'Consider varying your track selection to boost crowd energy.'}
                </Text>
            </View>

            {/* Spacer for buttons */}
            <View style={{ height: 140 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    scrollContent: {
        paddingTop: 60,
    },
    header: {
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 4,
    },
    date: {
        fontSize: 14,
        color: '#666',
    },
    chart: {
        marginRight: 24,
    },
    metricsContainer: {
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    metricRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    metricLabel: {
        fontSize: 15,
        color: '#888',
        fontWeight: '400',
    },
    metricValue: {
        fontSize: 15,
        color: '#fff',
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    insightContainer: {
        marginHorizontal: 24,
        padding: 16,
        backgroundColor: 'rgba(0, 255, 255, 0.05)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(0, 255, 255, 0.1)',
    },
    insightText: {
        fontSize: 14,
        color: '#00FFFF',
        lineHeight: 20,
        textAlign: 'center',
    },
    chartContainer: {
        marginBottom: 32,
        paddingLeft: 17,  // Increased from 24 to make room for Y-axis label
        position: 'relative',
    },

    yAxisLabel: {
        position: 'absolute',
        left: -40,  // Adjusted from -50 to ensure it's visible
        top: 90,   // Center it vertically with the chart
        transform: [{ rotate: '-90deg' }],
        fontSize: 11,  // Slightly smaller for better fit
        color: '#666',
        fontWeight: '300',
        width: 120,  // Reduced from 150
        textAlign: 'center',
        zIndex: 10,  // Ensure it's above other elements
    },

    xAxisLabel: {
        textAlign: 'center',
        fontSize: 12,
        color: '#666',
        fontWeight: '300',
        marginTop: 8,
        marginRight: 24,
        paddingLeft: 36,  // Account for the extra left padding
    },
});