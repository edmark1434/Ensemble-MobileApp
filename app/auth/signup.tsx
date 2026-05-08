import ContinueWithGoogle from '@/components/continue-with-google';
import { Colors } from '@/constants/theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { signInOauth, signUp,createUser, getUserByUsername, getUserByEmail } from '../../function/user';

export default function SignUp() {
	const router = useRouter();
	const [fullName, setFullName] = useState('');
	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [hidePassword, setHidePassword] = useState(true);
	const [hideConfirmPassword, setHideConfirmPassword] = useState(true);
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState('');
	const [isSuccess, setIsSuccess] = useState(false);
	const [errors, setErrors] = useState({
		fullName: '',
		username: '',
		email: '',
		password: '',
		confirmPassword: '',
	});

	const validateForm = async() => {
		const nextErrors = {
			fullName: '',
			username: '',
			email: '',
			password: '',
			confirmPassword: '',
		};

		if (!fullName.trim()) nextErrors.fullName = 'Full name is required';
		if (!username.trim()) {
			nextErrors.username = 'Username is required';
		} else {
			const user = await getUserByUsername(username);
			if (user.status === 200) {
				nextErrors.username = 'Username is already taken';
			}
		}
		if (!email.trim()) {
			nextErrors.email = 'Email is required';
		} else if (!/\S+@\S+\.\S+/.test(email)) {
			nextErrors.email = 'Email is invalid';
		} else {
			const user = await getUserByEmail(email);
			if (user.status === 200) {
				nextErrors.email = 'Email is already registered';
			}
		}

		if (!password) {
			nextErrors.password = 'Password is required';
		} else if (password.length < 6) {
			nextErrors.password = 'Password must be at least 6 characters';
		}

		if (!confirmPassword) {
			nextErrors.confirmPassword = 'Confirm password is required';
		} else if (password !== confirmPassword) {
			nextErrors.confirmPassword = 'Passwords do not match';
		}

		setErrors(nextErrors);

		return !Object.values(nextErrors).some((value) => value);
	};


	const handleCreateAccount = async () => {
	const isValid = await validateForm();

	if (!isValid) return;

	try {
		setLoading(true);
		setMessage('');
		setIsSuccess(false);

		// 1. CREATE AUTH USER
		const response = await signUp(email, password);

		if (response.user) {

		// 2. SAVE TO FIRESTORE
		await createUser({
			uid: response.user.uid,
			email: response.user.email,
			fullName,
			username,
		});

		setIsSuccess(true);
		setMessage('Account created successfully');

		router.push('/auth/login');
		}

	} catch (error) {
		console.log(error);
		setIsSuccess(false);
		setMessage('Error creating account');

	} finally {
		setLoading(false);
	}
	};

	const handleGoogleSuccess = (userInfo: any) => {
		try {
			setLoading(true);
			setMessage('');
			setIsSuccess(false);
			signInOauth(userInfo.data)
				.then((response: any) => {
					if (response.status === 200) {
						setIsSuccess(true);
						setMessage('Signed in with Google successfully');
						router.push('/(tabs)');
					} else {
						setIsSuccess(false);
						setMessage(response.error || 'Error signing in with Google');
					}
				})
				.catch(() => {
					setIsSuccess(false);
					setMessage('Error signing in with Google');
				})
				.finally(() => setLoading(false));
		} catch (error) {
			setIsSuccess(false);
			setMessage('Error signing in with Google');
		} finally {
			setLoading(false);
		}
	};

	const handleGoogleError = (message: string) => {
		setLoading(false);
		setIsSuccess(false);
		setMessage(message);
	};

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
				<Text style={styles.title}>Create account</Text>

				<View style={styles.form}>
					<TextInput
						style={styles.input}
						placeholder="Full Name"
						placeholderTextColor="#6B6F73"
						value={fullName}
						onChangeText={(text) => {
							setFullName(text);
							setErrors((prev) => ({ ...prev, fullName: '' }));
						}}
						autoCapitalize="words"
					/>
					{errors.fullName ? <Text style={styles.fieldError}>{errors.fullName}</Text> : null}

					<TextInput
						style={styles.input}
						placeholder="Username"
						placeholderTextColor="#6B6F73"
						value={username}
						onChangeText={(text) => {
							setUsername(text);
							setErrors((prev) => ({ ...prev, username: '' }));
						}}
						autoCapitalize="none"
					/>
					{errors.username ? <Text style={styles.fieldError}>{errors.username}</Text> : null}

					<TextInput
						style={styles.input}
						placeholder="Email"
						placeholderTextColor="#6B6F73"
						value={email}
						onChangeText={(text) => {
							setEmail(text);
							setErrors((prev) => ({ ...prev, email: '' }));
						}}
						keyboardType="email-address"
						autoCapitalize="none"
					/>
					{errors.email ? <Text style={styles.fieldError}>{errors.email}</Text> : null}

					<View style={styles.passwordInputWrapper}>
						<TextInput
							style={styles.passwordInput}
							placeholder="Password"
							placeholderTextColor="#6B6F73"
							value={password}
							onChangeText={(text) => {
								setPassword(text);
								setErrors((prev) => ({ ...prev, password: '' }));
							}}
							secureTextEntry={hidePassword}
							autoCapitalize="none"
						/>
						<TouchableOpacity onPress={() => setHidePassword(!hidePassword)} style={styles.eyeIconButton}>
							<MaterialIcons name={hidePassword ? 'visibility-off' : 'visibility'} size={18} color="#6B6F73" />
						</TouchableOpacity>
					</View>
					{errors.password ? <Text style={styles.fieldError}>{errors.password}</Text> : null}

					<View style={styles.passwordInputWrapper}>
						<TextInput
							style={styles.passwordInput}
							placeholder="Confirm Password"
							placeholderTextColor="#6B6F73"
							value={confirmPassword}
							onChangeText={(text) => {
								setConfirmPassword(text);
								setErrors((prev) => ({ ...prev, confirmPassword: '' }));
							}}
							secureTextEntry={hideConfirmPassword}
							autoCapitalize="none"
						/>
						<TouchableOpacity onPress={() => setHideConfirmPassword(!hideConfirmPassword)} style={styles.eyeIconButton}>
							<MaterialIcons name={hideConfirmPassword ? 'visibility-off' : 'visibility'} size={18} color="#6B6F73" />
						</TouchableOpacity>
					</View>
					{errors.confirmPassword ? <Text style={styles.fieldError}>{errors.confirmPassword}</Text> : null}

					{message ? (
						<Text style={[styles.message, isSuccess ? styles.successText : styles.errorText]}>{message}</Text>
					) : null}

					<TouchableOpacity
						style={[styles.createButton, loading && styles.disabledButton]}
						onPress={handleCreateAccount}
						activeOpacity={0.8}
						disabled={loading}
					>
						{loading ? <ActivityIndicator size="small" color="#111113" /> : null}
						<Text style={[styles.createButtonText, loading ? { marginLeft: 8 } : null]}>
							{loading ? 'CREATING...' : 'CREATE ACCOUNT'}
						</Text>
					</TouchableOpacity>

					<View style={styles.orRow}>
						<View style={styles.orLine} />
						<Text style={styles.orText}>OR CONTINUE WITH</Text>
						<View style={styles.orLine} />
					</View>

					<ContinueWithGoogle
						onSuccess={handleGoogleSuccess}
						onError={handleGoogleError}
						disabled={loading}
					/>

					<Text style={styles.footerText}>
						Already have an account?{' '}
						<Text style={styles.signInText} onPress={() => router.push('/auth/login')}>
							Sign In
						</Text>
					</Text>
				</View>

				<View style={styles.securityCard}>
					<View style={styles.shieldWrap}>
						<MaterialIcons name="verified-user" size={16} color={Colors.dark.tint} />
					</View>
					<View style={styles.securityTextWrap}>
						<Text style={styles.securityTitle}>ENSEMBLE SECURITY</Text>
						<Text style={styles.securityText}>
							Your project data and personal information are encrypted with industry-standard protocols for
							creative studio security.
						</Text>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#111113',
	},
	scrollContent: {
		flexGrow: 1,
		paddingHorizontal: 16,
		paddingTop: 10,
		paddingBottom: 18,
	},
	title: {
		color: Colors.dark.text,
		textAlign: 'center',
		fontSize: 20,
		fontWeight: '600',
		marginTop: 8,
		marginBottom: 18,
	},
	form: {
		borderTopWidth: 1,
		borderTopColor: '#151A23',
		paddingTop: 16,
	},
	input: {
		backgroundColor: '#131315',
		borderRadius: 9,
		borderWidth: 1,
		borderColor: '#2A2A2C',
		color: Colors.dark.text,
		paddingHorizontal: 12,
		paddingVertical: 12,
		marginBottom: 10,
		fontSize: 13,
	},
	passwordInputWrapper: {
		backgroundColor: '#131315',
		borderRadius: 9,
		borderWidth: 1,
		borderColor: '#2A2A2C',
		marginBottom: 10,
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 12,
	},
	passwordInput: {
		flex: 1,
		color: Colors.dark.text,
		paddingVertical: 12,
		fontSize: 13,
	},
	eyeIconButton: {
		paddingLeft: 8,
		paddingVertical: 4,
	},
	fieldError: {
		color: '#FF6161',
		fontSize: 12,
		marginTop: -4,
		marginBottom: 8,
	},
	message: {
		marginBottom: 10,
		fontSize: 12,
	},
	errorText: {
		color: '#FF6161',
	},
	successText: {
		color: '#36D98D',
	},
	createButton: {
		backgroundColor: Colors.dark.tint,
		borderRadius: 8,
		minHeight: 48,
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'row',
		marginTop: 2,
	},
	createButtonText: {
		color: '#041117',
		fontSize: 12,
		letterSpacing: 1,
		fontWeight: '800',
	},
	disabledButton: {
		opacity: 0.8,
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
		borderWidth: 1,
		borderColor: '#2A2A2C',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 4,
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
	footerText: {
		marginTop: 18,
		textAlign: 'center',
		color: '#778195',
		fontSize: 13,
	},
	signInText: {
		color: Colors.dark.tint,
		fontWeight: '700',
	},
	securityCard: {
		marginTop: 'auto',
		backgroundColor: '#121722',
		borderWidth: 1,
		borderColor: '#1B2332',
		borderRadius: 10,
		padding: 12,
		flexDirection: 'row',
		gap: 10,
	},
	shieldWrap: {
		width: 22,
		height: 22,
		borderRadius: 6,
		backgroundColor: '#0E2230',
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 2,
	},
	securityTextWrap: {
		flex: 1,
	},
	securityTitle: {
		color: '#D4DCEB',
		fontSize: 10,
		fontWeight: '800',
		letterSpacing: 0.6,
		marginBottom: 3,
	},
	securityText: {
		color: '#8C96AB',
		fontSize: 11,
		lineHeight: 15,
	},
});
