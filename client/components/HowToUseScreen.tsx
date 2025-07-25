import React, { useRef, useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Text,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Platform,
    LayoutChangeEvent
} from 'react-native';
import { API_BASE_URL, API_PROD_BASE_URL } from '@env';

// check for backend url
if (!API_PROD_BASE_URL) {
    throw new Error("Backend URL missing from env file");
}

interface Props {
    navigation: any;
}

const { width } = Dimensions.get('window');

interface Section {
    id: string;
    title: string;
    icon: string;
    content: {
        subtitle?: string;
        steps?: string[];
        tips?: string[];
        note?: string;
    };
}

const sections: Section[] = [
    {
        id: 'getting-started',
        title: 'Getting Started',
        icon: '',
        content: {
            subtitle: 'Begin tracking emotions during your DJ sets',
            steps: [
                'Tap "Start Recording" from the welcome screen',
                'Grant camera and microphone permissions when prompted',
                'Position your device to capture the crowd\'s reactions',
                'The app will automatically start recording video and analyzing emotions'
            ],
            tips: [
                'Use a phone stand or tripod for stable recording',
                'Ensure good lighting on the crowd for better emotion detection'
            ]
        }
    },
    {
        id: 'recording',
        title: 'During Recording',
        icon: '',
        content: {
            subtitle: 'What happens while you\'re performing',
            steps: [
                'The app captures snapshots every 2.5 seconds',
                'Each snapshot is analyzed for dominant emotions',
                'You\'ll see real-time emotion feedback at the top of the screen',
                'A full video is recorded simultaneously for your records'
            ],
            tips: [
                'The emotion detection works best with clear facial visibility',
                'Multiple faces can be detected in each frame'
            ],
            note: 'Recording indicator (REC) shows when video is being captured'
        }
    },
    {
        id: 'camera-controls',
        title: 'Camera Controls',
        icon: '',
        content: {
            subtitle: 'Customize your recording setup',
            steps: [
                'Tap "Select Camera" to switch between front/back cameras',
                'Use back camera to capture crowd emotions',
                'Use front camera to record yourself while performing',
                'External camera option available for professional setups'
            ]
        }
    },
    {
        id: 'stopping',
        title: 'Ending Your Session',
        icon: '',
        content: {
            subtitle: 'Save and analyze your performance data',
            steps: [
                'Tap "Stop Recording" when your set is complete',
                'Confirm you want to end the recording',
                'Video is automatically saved to your camera roll',
                'Emotion analysis results are displayed in a graph'
            ],
            note: 'Make sure to wait for "Saving video..." to complete'
        }
    },
    {
        id: 'analysis',
        title: 'Understanding Results',
        icon: '',
        content: {
            subtitle: 'Interpret your emotion tracking data',
            steps: [
                'View the emotion timeline graph showing crowd reactions over time',
                'See which emotions dominated during different parts of your set',
                'Identify peaks and valleys in crowd engagement',
                'Use insights to improve future performances'
            ],
            tips: [
                'Happy and Surprised emotions often indicate high energy moments',
                'Neutral might suggest crowd is focused or waiting for a drop'
            ]
        }
    },
    {
        id: 'export-import',
        title: 'Managing Sessions',
        icon: '',
        content: {
            subtitle: 'Save and share your performance data',
            steps: [
                'Export Log: Save emotion data as CSV file',
                'Import Log: Load previously saved sessions',
                'Share files via email, cloud storage, or messaging apps',
                'Compare different performances by importing past sessions'
            ],
            note: 'Exported files include timestamps and detected emotions'
        }
    },
    {
        id: 'tips',
        title: 'Pro Tips',
        icon: '',
        content: {
            subtitle: 'Get the most out of CrowdControl',
            tips: [
                'Ensure proper lighting conditions to get the most accurate data',
                'Record during peak hours for more diverse emotion data',
                'Test different music styles and observe crowd reactions',
                'Keep your device plugged in for longer sets',
                'Review past sessions before similar gigs',
                'Share successful set analyses with other DJs',
            ]
        }
    }
];

export default function HowToUseScreen({ navigation }: Props) {
    const [activeSection, setActiveSection] = useState<string>('getting-started');
    const scrollViewRef = useRef<ScrollView>(null);
    const navScrollRef = useRef<ScrollView>(null);
    const sectionRefs = useRef<{ [key: string]: View | null }>({});
    const sectionPositions = useRef<{ [key: string]: number }>({});
    const navPillRefs = useRef<{ [key: string]: View | null }>({});

    // Store section positions when they mount
    const handleSectionLayout = (sectionId: string, event: LayoutChangeEvent) => {
        const { y } = event.nativeEvent.layout;
        sectionPositions.current[sectionId] = y;
    };

    // Scroll to section with accurate position
    const scrollToSection = (sectionId: string) => {
        setActiveSection(sectionId);

        // Scroll main content to section
        const yPosition = sectionPositions.current[sectionId];
        if (yPosition !== undefined && scrollViewRef.current) {
            scrollViewRef.current.scrollTo({
                y: yPosition,
                animated: true
            });
        }

        // Auto-scroll navigation pills to center the active pill
        if (navPillRefs.current[sectionId] && navScrollRef.current) {
            navPillRefs.current[sectionId]?.measureLayout(
                navScrollRef.current as any,
                (x, y, width, height) => {
                    // Center the pill in the viewport
                    const scrollX = x - (Dimensions.get('window').width / 2) + (width / 2);
                    navScrollRef.current?.scrollTo({
                        x: Math.max(0, scrollX),
                        animated: true
                    });
                }
            );
        }
    };

    // Track scroll position to update active section
    const handleScroll = (event: any) => {
        const scrollY = event.nativeEvent.contentOffset.y;

        // Find which section is currently visible
        let currentSection = sections[0].id;
        for (const section of sections) {
            const sectionY = sectionPositions.current[section.id];
            if (sectionY !== undefined && scrollY >= sectionY - 100) {
                currentSection = section.id;
            }
        }

        if (currentSection !== activeSection) {
            setActiveSection(currentSection);

            // Auto-scroll nav to show active pill
            if (navPillRefs.current[currentSection] && navScrollRef.current) {
                navPillRefs.current[currentSection]?.measureLayout(
                    navScrollRef.current as any,
                    (x, y, width, height) => {
                        const scrollX = x - (Dimensions.get('window').width / 2) + (width / 2);
                        navScrollRef.current?.scrollTo({
                            x: Math.max(0, scrollX),
                            animated: true
                        });
                    }
                );
            }
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>How To Use</Text>
                <View style={styles.headerSpacer} />
            </View>

            {/* Navigation Pills */}
            <ScrollView
                ref={navScrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.navContainer}
                contentContainerStyle={styles.navContent}
            >
                {sections.map((section) => (
                    <TouchableOpacity
                        key={section.id}
                        ref={(ref) => {
                            if (ref) {
                                navPillRefs.current[section.id] = ref;
                            }
                        }}
                        onPress={() => scrollToSection(section.id)}
                        style={[
                            styles.navPill,
                            activeSection === section.id && styles.navPillActive
                        ]}
                    >
                        <Text
                            style={[
                                styles.navText,
                                activeSection === section.id && styles.navTextActive
                            ]}
                            allowFontScaling={false}
                        >
                            {section.title}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Content */}
            <ScrollView
                ref={scrollViewRef}
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                {sections.map((section, index) => (
                    <View
                        key={section.id}
                        ref={(ref) => {
                            if (ref) {
                                sectionRefs.current[section.id] = ref;
                            }
                        }}
                        onLayout={(event) => handleSectionLayout(section.id, event)}
                        style={[
                            styles.section,
                            index === sections.length - 1 && styles.lastSection
                        ]}
                    >
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionTitleContainer}>
                                <Text style={styles.sectionTitle}>{section.title}</Text>
                                {section.content.subtitle && (
                                    <Text style={styles.sectionSubtitle}>
                                        {section.content.subtitle}
                                    </Text>
                                )}
                            </View>
                        </View>

                        {section.content.steps && (
                            <View style={styles.stepsContainer}>
                                {section.content.steps.map((step, stepIndex) => (
                                    <View key={stepIndex} style={styles.step}>
                                        <View style={styles.stepNumber}>
                                            <Text style={styles.stepNumberText}>
                                                {stepIndex + 1}
                                            </Text>
                                        </View>
                                        <Text style={styles.stepText}>{step}</Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {section.content.tips && (
                            <View style={styles.tipsContainer}>
                                <Text style={styles.tipsTitle}>
                                    {section.id === 'tips' ? 'Recommendations' : 'Tips'}
                                </Text>
                                {section.content.tips.map((tip, tipIndex) => (
                                    <View key={tipIndex} style={styles.tip}>
                                        <Text style={styles.tipBullet}>•</Text>
                                        <Text style={styles.tipText}>{tip}</Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {section.content.note && (
                            <View style={styles.noteContainer}>
                                <Text style={styles.noteLabel}>Note</Text>
                                <Text style={styles.noteText}>{section.content.note}</Text>
                            </View>
                        )}
                    </View>
                ))}

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Need more help? Contact support at
                    </Text>
                    <Text style={styles.footerEmail}>adityav171@gmail.com</Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'ios' ? 50 : 30,
        paddingBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: '#000',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    backButton: {
        padding: 8,
    },
    backButtonText: {
        color: '#00FFFF',
        fontSize: 16,
        fontWeight: '400',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '300',
        letterSpacing: 0.5,
    },
    headerSpacer: {
        width: 60, // Match back button width for centering
    },
    navContainer: {
        maxHeight: 60,
        backgroundColor: '#000',
    },
    navContent: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        gap: 12,
    },
    navPill: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingVertical: 5,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        marginRight: 8,
        height: 36,
    },
    navPillActive: {
        borderWidth: 1,
        borderColor: 'rgba(0, 255, 255, 0.3)',
    },
    navIcon: {
        fontSize: 16,
        marginRight: 6,
    },
    navText: {
        color: '#666',
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 16,
    },
    navTextActive: {
        color: '#00FFFF',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    section: {
        paddingHorizontal: 24,
        paddingVertical: 32,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    lastSection: {
        borderBottomWidth: 0,
    },
    sectionHeader: {
        marginBottom: 24,
    },
    sectionTitleContainer: {
        flex: 1,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '300',
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    sectionSubtitle: {
        color: '#666',
        fontSize: 15,
        fontWeight: '300',
        lineHeight: 20,
    },
    stepsContainer: {
        marginBottom: 20,
    },
    step: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    stepNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(0, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    stepNumberText: {
        color: '#00FFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    stepText: {
        flex: 1,
        color: '#ccc',
        fontSize: 15,
        fontWeight: '300',
        lineHeight: 22,
    },
    tipsContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
    },
    tipsTitle: {
        color: '#00FFFF',
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    tip: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    tipBullet: {
        color: '#00FFFF',
        fontSize: 16,
        marginRight: 8,
        lineHeight: 20,
    },
    tipText: {
        flex: 1,
        color: '#999',
        fontSize: 14,
        fontWeight: '300',
        lineHeight: 20,
    },
    noteContainer: {
        backgroundColor: 'rgba(0, 255, 255, 0.05)',
        borderLeftWidth: 3,
        borderLeftColor: '#00FFFF',
        borderRadius: 4,
        padding: 12,
        marginTop: 16,
    },
    noteLabel: {
        color: '#00FFFF',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    noteText: {
        color: '#ccc',
        fontSize: 14,
        fontWeight: '300',
        lineHeight: 20,
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 24,
    },
    footerText: {
        color: '#666',
        fontSize: 14,
        fontWeight: '300',
        marginBottom: 4,
    },
    footerEmail: {
        color: '#00FFFF',
        fontSize: 14,
        fontWeight: '400',
    },
});