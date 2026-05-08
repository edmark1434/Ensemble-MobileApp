import { AppTitle } from '@/components/app-title';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

const steps = ['Document', 'Liveness', 'Finish'];

export default function VerificationScreen() {
  const [step, setStep] = useState(0);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <AppTitle size="sm" />
          <MaterialIcons name="help-outline" size={20} color="#15C8FF" />
        </View>

        <Text style={styles.title}>Identity Verification</Text>

        <View style={styles.stepper}>
          {steps.map((label, index) => {
            const active = index === step;
            const done = index < step;
            return (
              <Pressable key={label} onPress={() => setStep(index)} style={styles.stepItem}>
                <View style={[styles.stepCircle, active && styles.stepCircleActive, done && styles.stepCircleDone]}>
                  <Text style={[styles.stepCircleText, (active || done) && styles.stepCircleTextActive]}>{index + 1}</Text>
                </View>
                <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.card}>
          {step === 0 ? (
            <>
              <MaterialIcons name="badge" size={56} color="#8A93A3" />
              <Text style={styles.cardTitle}>Position the front of your government ID within the frame.</Text>
              <Text style={styles.cardText}>Ensure all details are readable, avoid glare and use a dark, flat surface.</Text>
            </>
          ) : step === 1 ? (
            <>
              <MaterialIcons name="face" size={56} color="#8A93A3" />
              <Text style={styles.cardTitle}>Center your face in the circle</Text>
              <Text style={styles.cardText}>Follow the on-screen prompts to blink or turn your head.</Text>
            </>
          ) : (
            <>
              <MaterialIcons name="verified" size={56} color="#35E3A4" />
              <Text style={styles.cardTitle}>Verification almost done</Text>
              <Text style={styles.cardText}>Your identity details are being reviewed securely.</Text>
            </>
          )}
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>Tips for success</Text>
          <Text style={styles.tipText}>• Use a dark background</Text>
          <Text style={styles.tipText}>• Remove hats or glasses for liveness</Text>
          <Text style={styles.tipText}>• Keep the camera steady</Text>
        </View>

        <Pressable
          style={styles.primaryButton}
          onPress={() => setStep((current) => Math.min(current + 1, steps.length - 1))}
        >
          <Text style={styles.primaryButtonText}>{step < 2 ? 'Continue' : 'Finish Verification'}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#090B10' },
  content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 28 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  title: { color: '#F4F8FF', fontSize: 22, fontWeight: '900', marginBottom: 16 },
  stepper: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
  stepItem: { alignItems: 'center', gap: 8, flex: 1 },
  stepCircle: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: '#2A3444', alignItems: 'center', justifyContent: 'center', backgroundColor: '#11151C' },
  stepCircleActive: { borderColor: '#15C8FF', backgroundColor: '#0E2230' },
  stepCircleDone: { borderColor: '#35E3A4', backgroundColor: '#113126' },
  stepCircleText: { color: '#8A93A3', fontWeight: '800' },
  stepCircleTextActive: { color: '#F4F8FF' },
  stepLabel: { color: '#8A93A3', fontSize: 11, fontWeight: '700' },
  stepLabelActive: { color: '#15C8FF' },
  card: { minHeight: 260, backgroundColor: '#11151C', borderWidth: 1, borderColor: '#1B2230', borderRadius: 22, padding: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  cardTitle: { color: '#F4F8FF', fontSize: 18, fontWeight: '900', textAlign: 'center', marginTop: 16, marginBottom: 8 },
  cardText: { color: '#8A93A3', fontSize: 13, textAlign: 'center', lineHeight: 19 },
  tipCard: { backgroundColor: '#11151C', borderWidth: 1, borderColor: '#1B2230', borderRadius: 18, padding: 14, marginBottom: 18 },
  tipTitle: { color: '#F4F8FF', fontSize: 14, fontWeight: '800', marginBottom: 8 },
  tipText: { color: '#D8E0EE', fontSize: 12, marginBottom: 6 },
  primaryButton: { backgroundColor: '#15C8FF', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  primaryButtonText: { color: '#041117', fontWeight: '900', fontSize: 14 },
});
