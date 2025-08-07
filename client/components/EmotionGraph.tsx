import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const emotionToScore = (emotion: string): number => {
    switch (emotion) {
        case 'happy': return 100;
        case 'surprise': return 75;
        case 'neutral': return 50;
        case 'fear': return 35;
        case 'anger': return 25;
        case 'sad': return 20;
        default: return 0;
    }
};

const emotionToValue = (emotion: string): number => {
    switch (emotion) {
        case 'happy': return 6;
        case 'surprise': return 5;
        case 'neutral': return 4;
        case 'fear': return 3;
        case 'anger': return 2;
        case 'sad': return 1;
        default: return 0;
    }
};

type ChartType = 'engagement' | 'scatter';

export default function EmotionGraph({
    data,
    logDate,
}: {
    data: { timestamp: number; emotion: string }[];
    logDate?: string;
}) {
    const [chartType, setChartType] = useState<ChartType>('engagement');

    const scores = data.map(e => emotionToScore(e.emotion));

    const startTime = data.length > 0 ? data[0].timestamp : 0;

    // Generate time labels
    const timeLabels = data.map((e, index) => {
        if (index % Math.ceil(data.length / 6) === 0 || index === data.length - 1) {
            const totalSeconds = index * 2.5;
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = Math.floor(totalSeconds % 60);
            return `${minutes}:${String(seconds).padStart(2, '0')}`;
        }
        return '';
    });

    // Engagement chart data
    const engagementChartData = {
        labels: timeLabels,
        datasets: [{ data: scores, strokeWidth: 2 }],
    };

    const dynamicWidth = Math.max(screenWidth - 40, data.length * 60);

    // Calculate metrics
    const avgHappiness = scores.length > 0
        ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
        : '0';

    const emotionCount: { [key: string]: number } = {};
    data.forEach(({ emotion }) => {
        emotionCount[emotion] = (emotionCount[emotion] || 0) + 1;
    });
    const mostFrequentEmotion = Object.entries(emotionCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    // Get distinct emotions and their values for dynamic segments
    const distinctEmotions = [...new Set(data.map(d => d.emotion))];
    const distinctEmotionValues = distinctEmotions.map(e => emotionToValue(e)).sort((a, b) => a - b);

    const peakMoment = data[scores.indexOf(Math.max(...scores))];
    const peakTime = peakMoment ? (() => {
        const peakIndex = data.indexOf(peakMoment);
        const totalSeconds = peakIndex * 2.5;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);
        return `${minutes}:${String(seconds).padStart(2, '0')}`;
    })() : 'N/A';

    const chartConfig = {
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
    };

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

            {/* Chart Type Switcher */}
            <View style={styles.chartSwitcher}>
                <TouchableOpacity
                    style={[
                        styles.switcherButton,
                        chartType === 'engagement' && styles.activeSwitcherButton
                    ]}
                    onPress={() => setChartType('engagement')}
                    activeOpacity={0.7}
                >
                    <Text style={[
                        styles.switcherText,
                        chartType === 'engagement' && styles.activeSwitcherText
                    ]}>
                        Engagement
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.switcherButton,
                        chartType === 'scatter' && styles.activeSwitcherButton
                    ]}
                    onPress={() => setChartType('scatter')}
                    activeOpacity={0.7}
                >
                    <Text style={[
                        styles.switcherText,
                        chartType === 'scatter' && styles.activeSwitcherText
                    ]}>
                        Emotion
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Chart */}
            {chartType === 'scatter' ? (
                <View style={styles.scatterContainer}>
                    <View style={styles.scatterChart}>
                        {/* Y-axis label - rotated */}
                        <View style={styles.scatterYLabelContainer}>
                            <Text style={styles.scatterYLabelRotated}>Engagement (%)</Text>
                        </View>

                        {/* Y-axis labels */}
                        <View style={styles.scatterYAxis}>
                            <Text style={styles.scatterAxisText}>100</Text>
                            <Text style={styles.scatterAxisText}>75</Text>
                            <Text style={styles.scatterAxisText}>50</Text>
                            <Text style={styles.scatterAxisText}>25</Text>
                            <Text style={styles.scatterAxisText}>0</Text>
                        </View>

                        {/* Scatter plot area */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={[styles.scatterPlotArea, { width: dynamicWidth }]}>
                                {/* Grid lines */}
                                <View style={styles.scatterGrid}>
                                    {[0, 25, 50, 75, 100].map((val) => (
                                        <View
                                            key={val}
                                            style={[
                                                styles.scatterGridLine,
                                                { bottom: `${val}%` }
                                            ]}
                                        />
                                    ))}
                                </View>

                                {/* Data points */}
                                {data.map((point, index) => {
                                    const xPosition = (index / (data.length - 1)) * (dynamicWidth - 60);
                                    const yPosition = emotionToScore(point.emotion);
                                    const emotionColor = {
                                        happy: '#4CAF50',
                                        surprise: '#FFC107',
                                        neutral: '#2196F3',
                                        fear: '#FF9800',
                                        anger: '#F44336',
                                        sad: '#9C27B0'
                                    }[point.emotion] || '#00FFFF';

                                    return (
                                        <View
                                            key={index}
                                            style={[
                                                styles.scatterPoint,
                                                {
                                                    left: xPosition,
                                                    bottom: `${yPosition}%`,
                                                    backgroundColor: emotionColor,
                                                }
                                            ]}
                                        >
                                            <View style={[styles.scatterPointInner, { backgroundColor: emotionColor }]} />
                                        </View>
                                    );
                                })}
                            </View>
                        </ScrollView>
                    </View>

                    {/* X-axis labels */}
                    <View style={styles.scatterXAxis}>
                        {timeLabels.map((label, index) =>
                            label ? (
                                <Text key={index} style={styles.scatterAxisText}>{label}</Text>
                            ) : null
                        )}
                    </View>
                    <Text style={styles.xAxisLabel}>Time (minutes:seconds)</Text>

                    {/* Legend */}
                    <View style={styles.scatterLegend}>
                        {Object.entries({
                            happy: '#4CAF50',
                            surprise: '#FFC107',
                            neutral: '#2196F3',
                            fear: '#FF9800',
                            anger: '#F44336',
                            sad: '#9C27B0'
                        }).filter(([emotion]) => distinctEmotions.includes(emotion)).map(([emotion, color]) => (
                            <View key={emotion} style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: color }]} />
                                <Text style={styles.legendText}>{emotion}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            ) : (
                <View style={styles.chartContainer}>
                    {/* Y-axis label */}
                    <View style={styles.yAxisLabelContainer}>
                        <Text style={styles.yAxisLabel} allowFontScaling={false}>
                            Engagement (%)
                        </Text>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <LineChart
                            data={engagementChartData}
                            width={dynamicWidth}
                            height={180}
                            yAxisSuffix="%"
                            yLabelsOffset={10}
                            chartConfig={chartConfig}
                            bezier
                            style={styles.chart}
                            withInnerLines={true}
                            withOuterLines={false}
                            withVerticalLabels={true}
                            withHorizontalLabels={true}
                            withShadow={false}
                            segments={5}
                        />
                    </ScrollView>

                    {/* X-axis label */}
                    <Text style={styles.xAxisLabel}>Time (minutes:seconds)</Text>
                </View>
            )}

            {/* Metrics */}
            <View style={styles.metricsContainer}>
                <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>Average Engagement</Text>
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
            <View style={{ height: 200 }} />
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
    chartSwitcher: {
        flexDirection: 'row',
        marginHorizontal: 24,
        marginBottom: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 8,
        padding: 4,
    },
    switcherButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 6,
        alignItems: 'center',
    },
    activeSwitcherButton: {
        backgroundColor: 'rgba(0, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(0, 255, 255, 0.3)',
    },
    switcherText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    activeSwitcherText: {
        color: '#00FFFF',
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
        marginBottom: 20,
    },
    insightText: {
        fontSize: 14,
        color: '#00FFFF',
        lineHeight: 20,
        textAlign: 'center',
    },
    chartContainer: {
        marginBottom: 32,
        paddingLeft: 33,
        position: 'relative',
    },
    yAxisLabelContainer: {
        position: 'absolute',
        left: 7,
        top: 0,
        bottom: 0,
        width: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    yAxisLabel: {
        transform: [{ rotate: '-90deg' }],
        fontSize: 11,
        color: '#666',
        fontWeight: '300',
        width: 120,
        textAlign: 'center',
    },
    xAxisLabel: {
        textAlign: 'center',
        fontSize: 12,
        color: '#666',
        fontWeight: '300',
        marginTop: 8,
        marginRight: 24,
        paddingLeft: 40,
    },
    // Scatter plot styles
    scatterContainer: {
        marginBottom: 32,
        paddingHorizontal: 24,
    },
    scatterChart: {
        flexDirection: 'row',
        height: 220,
        marginTop: 10,
        paddingVertical: 10,
    },
    scatterYLabelContainer: {
        width: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: -20,
    },
    scatterYLabelRotated: {
        fontSize: 11,
        color: '#666',
        fontWeight: '300',
        transform: [{ rotate: '-90deg' }],
        width: 100,
        textAlign: 'center',
    },
    scatterYAxis: {
        width: 30,
        justifyContent: 'space-between',
        paddingVertical: 0,
    },
    scatterAxisText: {
        fontSize: 10,
        color: '#666',
        textAlign: 'right',
    },
    scatterPlotArea: {
        flex: 1,
        position: 'relative',
        marginLeft: 10,
        paddingVertical: 6,
    },
    scatterGrid: {
        position: 'absolute',
        top: 6,
        left: 0,
        right: 0,
        bottom: 6,
    },
    scatterGridLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    scatterPoint: {
        position: 'absolute',
        width: 12,
        height: 12,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scatterPointInner: {
        width: 8,
        height: 8,
        borderRadius: 4,
        opacity: 0.8,
    },
    scatterXAxis: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 70,
        marginTop: 10,
    },
    scatterLegend: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop: 20,
        paddingHorizontal: 20,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 10,
        marginVertical: 4,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 6,
    },
    legendText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '400',
        textTransform: 'capitalize',
    },
});