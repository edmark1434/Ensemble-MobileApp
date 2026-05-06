import { Colors } from '@/constants/theme';
import React, { useState } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hidePassword, setHidePassword] = useState(true);

  const handleLogin = () => {
    // TODO: wire up login
  };

  const handleForgot = () => {
    // TODO: forgot password flow
  };

  const handleGoogle = () => {
    // TODO: Google auth
  };

  const handleSignUp = () => {
    // TODO: navigate to sign up
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
        <Text style={styles.heading}>Welcome back</Text>
        <Text style={styles.subheading}>Log in to Ensemble</Text>

        <Text style={styles.label}>EMAIL</Text>
        <TextInput
          style={styles.input}
          placeholder="name@domain.com"
          placeholderTextColor="#6B6F73"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View>
          <Text style={styles.label}>PASSWORD</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#6B6F73"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={hidePassword}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={handleForgot} style={styles.forgotWrapInline}>
            <Text style={styles.forgot}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Log In</Text>
        </TouchableOpacity>

        <View style={styles.orRow}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>OR CONTINUE WITH</Text>
          <View style={styles.orLine} />
        </View>

        <TouchableOpacity style={styles.socialButton} onPress={handleGoogle} activeOpacity={0.9}>
          <Image source={require('@/assets/Google.svg.webp')} style={styles.googleIcon} />
          <Text style={styles.socialText}>Continue with Google</Text>
        </TouchableOpacity>

        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {"Don't have an account? "}
            <Text style={styles.signUp} onPress={handleSignUp}>Sign Up</Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111113',
    paddingHorizontal: 0,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingVertical: 6,
  },
  back: {
    padding: 8,
  },
  backText: {
    color: Colors.dark.tint,
    fontSize: 18,
  },
  title: {
    color: Colors.dark.text,
    fontWeight: '600',
    fontSize: 16,
    flex: 1,
    textAlign: 'left',
    marginLeft: 6,
  },
  loginLink: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  loginLinkText: {
    color: Colors.dark.tint,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  content: {
    marginTop: 24,
    paddingBottom: 24,
  },
  heading: {
    color: Colors.dark.text,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
  },
  subheading: {
    color: Colors.dark.icon,
    marginBottom: 20,
  },
  label: {
    color: Colors.dark.icon,
    fontSize: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#131315',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: Colors.dark.text,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1F1F21',
  },
  forgotWrapInline: {
    alignSelf: 'flex-end',
    marginTop: 6,
  },
  forgot: {
    color: Colors.dark.tint,
    fontSize: 12,
  },
  loginButton: {
    backgroundColor: Colors.dark.tint,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  loginButtonText: {
    color: '#111113',
    fontWeight: '700',
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#1F1F21',
  },
  orText: {
    color: Colors.dark.icon,
    marginHorizontal: 12,
    fontSize: 12,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#151515',
    paddingVertical: 12,
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    width: '100%',
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
    resizeMode: 'contain',
  },
  socialText: {
    color: Colors.dark.text,
    fontWeight: '600',
    fontSize: 15,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    color: Colors.dark.icon,
  },
  signUp: {
    color: Colors.dark.tint,
  },
});