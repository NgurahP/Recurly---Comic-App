import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Mail, Lock, Eye, EyeOff, Bolt, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth, useSignIn, useSSO } from "@clerk/expo";
import * as WebBrowser from "expo-web-browser";

// WAJIB: Menangani redirect setelah login OAuth selesai di browser bawaan
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
    const router = useRouter();
    const { isLoaded, isSignedIn } = useAuth();
    const { signIn, setActive, isLoaded: isSignInLoaded } = useSignIn();
    const { startSSOFlow } = useSSO();

    // State Manajemen Formulir
    const [emailAddress, setEmailAddress] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // State Loading
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    // Fungsi Sign In Email & Password
    const handleSignIn = async () => {
        if (!isSignInLoaded || !signIn) return;

        if (!emailAddress || !password) {
            Alert.alert("Gagal Masuk", "Harap isi email dan password Anda.");
            return;
        }

        setIsLoading(true);
        try {
            const signInAttempt = await signIn.create({
                identifier: emailAddress,
                password,
            });

            if (signInAttempt.status === 'complete') {
                await setActive({ session: signInAttempt.createdSessionId });
                router.replace('/(tabs)');
            } else {
                console.log(JSON.stringify(signInAttempt, null, 2));
                Alert.alert("Verifikasi Diperlukan", "Silakan selesaikan langkah verifikasi tambahan.");
            }
        } catch (err: any) {
            console.error("Sign-in error:", err);
            const errorMessage = err?.errors?.[0]?.message || err?.message || "Email atau password yang Anda masukkan salah.";
            Alert.alert("Gagal Masuk", errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Handler untuk Google Sign-In via SSO (Standard Expo Web Browser OAuth)
    const handleGoogleSignIn = async () => {
        setIsGoogleLoading(true);
        try {
            const { createdSessionId, setActive: setSSOActive, signUp, signIn: ssoSignIn } = await startSSOFlow({
                strategy: 'oauth_google',
            });

            if (createdSessionId && setSSOActive) {
                await setSSOActive({ session: createdSessionId });
                router.replace('/(tabs)');
                return;
            }

            if (ssoSignIn?.status === 'complete' && setSSOActive) {
                await setSSOActive({ session: ssoSignIn.createdSessionId });
                router.replace('/(tabs)');
                return;
            }

            if (signUp?.status === 'complete' && setSSOActive) {
                await setSSOActive({ session: signUp.createdSessionId });
                router.replace('/(tabs)');
                return;
            }

            if (ssoSignIn?.status === 'needs_signup' && signUp) {
                const signUpResponse = await signUp.create({ transfer: true });
                if (signUpResponse.status === 'complete' && setSSOActive) {
                    await setSSOActive({ session: signUpResponse.createdSessionId });
                    router.replace('/(tabs)');
                    return;
                }
            }
        } catch (err: any) {
            console.error('Google sign-in error:', err);
            Alert.alert("Gagal Masuk", err?.message || "Terjadi kesalahan saat masuk dengan Google.");
        } finally {
            setIsGoogleLoading(false);
        }
    };

    if (!isLoaded) {
        return null;
    }

    if (isSignedIn) {
        return (
            <View className="flex-1 bg-[#131315] justify-center items-center">
                <Text className="text-white text-lg font-bold">You are already signed in.</Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-[#131315]" showsVerticalScrollIndicator={false}>
            {/* Kontainer Utama */}
            <View className="relative min-h-screen flex flex-col max-w-[430px] mx-auto pb-10">

                {/* Tombol Kembali */}
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="absolute top-12 left-5 z-20 p-2 bg-black/40 rounded-full"
                >
                    <ArrowLeft color="white" size={24} />
                </TouchableOpacity>

                {/* Bagian Atas: Latar Belakang Sinematik */}
                <View className="relative h-[40vh] w-full overflow-hidden">
                    <Image
                        source={{ uri: "https://lh3.googleusercontent.com/aida-public/AP1WRLvc6ngMKMANUy_-hkYp0H0Sol1TShGpcyslzoKCc8k66KipHRjwOdIFnl4nNnt1CzgTkQquG4W_MQYc_m99VxG8pL0fyC6wzm48VTZcuaiUJ6CypQ6Y4rHJ4yfkwPZMcNbw1fN-JGnkFtpL9Pw13soII6l-jRuPErnWmkfFaxRFuGZUTp10x_UhdZCrQd1lJOoYwJKtsAWy-svKJAwbt3ULqVNzubkICuIcsLgQh0xD-MRpjo7vuRnixi8P" }}
                        style={{ width: '100%', height: '100%', position: 'absolute' }}
                    />
                    <View className="absolute inset-0 bg-gradient-to-t from-[#131315] via-transparent to-transparent" />

                    <View className="absolute top-12 left-0 w-full px-6 flex items-center">
                        <Text className="text-xl font-extrabold text-[#ff5451] tracking-tighter uppercase">
                            KATALOG KOMIK
                        </Text>
                    </View>
                </View>

                {/* Bagian Bawah: Form Login */}
                <View className="flex-1 px-6 -mt-10 z-10">

                    {/* Header Sapaan */}
                    <View className="mb-8">
                        <Text className="text-3xl font-bold text-[#e5e1e4] mb-1">
                            Welcome Back!
                        </Text>
                        <Text className="text-base text-[#c8c5ca] opacity-70">
                            Sign in to your account to continue.
                        </Text>
                    </View>

                    {/* Form Input */}
                    <View className="space-y-4">

                        {/* Input Email */}
                        <View className="space-y-1.5 mb-4">
                            <Text className="text-sm font-semibold text-[#e4beba] ml-1 mb-1">Email Address</Text>
                            <View className="relative flex-row items-center bg-[#2a2a2c] rounded-xl px-4 h-14">
                                <Mail color="#b6b4b8" size={20} style={{ marginRight: 12 }} />
                                <TextInput
                                    className="flex-1 text-[#e5e1e4] text-base"
                                    placeholder="hero@katalogkomik.com"
                                    placeholderTextColor="#46464a"
                                    value={emailAddress}
                                    onChangeText={setEmailAddress}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>
                        </View>

                        {/* Input Password */}
                        <View className="space-y-1.5 mb-6">
                            <Text className="text-sm font-semibold text-[#e4beba] ml-1 mb-1">Password</Text>
                            <View className="relative flex-row items-center bg-[#2a2a2c] rounded-xl px-4 h-14">
                                <Lock color="#b6b4b8" size={20} style={{ marginRight: 12 }} />
                                <TextInput
                                    className="flex-1 text-[#e5e1e4] text-base"
                                    placeholder="••••••••"
                                    placeholderTextColor="#46464a"
                                    secureTextEntry={!showPassword}
                                    value={password}
                                    onChangeText={setPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff color="#b6b4b8" size={20} /> : <Eye color="#b6b4b8" size={20} />}
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Tombol Utama (Sign In) */}
                        <TouchableOpacity
                            onPress={handleSignIn}
                            disabled={isLoading}
                            className="w-full h-14 bg-[#ff5451] rounded-full flex-row items-center justify-center gap-2 shadow-lg shadow-red-500/20 active:scale-95 transition-all"
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#5c0008" />
                            ) : (
                                <>
                                    <Text className="text-lg font-bold text-[#5c0008]">Sign In</Text>
                                    <Bolt color="#5c0008" size={20} />
                                </>
                            )}
                        </TouchableOpacity>

                    </View>

                    {/* Garis Pembatas */}
                    <View className="flex-row items-center my-8 gap-4">
                        <View className="h-[1px] flex-1 bg-[#353437]" />
                        <Text className="text-xs font-medium text-[#c8c5ca] uppercase tracking-widest opacity-50">
                            or sign in with
                        </Text>
                        <View className="h-[1px] flex-1 bg-[#353437]" />
                    </View>

                    {/* Tombol Login Sosial (Google) */}
                    <TouchableOpacity
                        onPress={handleGoogleSignIn}
                        disabled={isGoogleLoading}
                        className="w-full h-14 bg-transparent border border-[#5b403e] rounded-full flex-row items-center justify-center gap-3 active:scale-95 transition-colors"
                    >
                        {isGoogleLoading ? (
                            <ActivityIndicator color="#e5e1e4" />
                        ) : (
                            <>
                                <Text className="text-white font-bold text-lg">G</Text>
                                <Text className="text-base font-semibold text-[#e5e1e4]">Continue with Google</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {/* Footer Navigasi Daftar */}
                    <View className="mt-8 mb-12 flex-row justify-center items-center">
                        <Text className="text-base text-[#e4beba]">Don't have an account? </Text>
                        <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
                            <Text className="text-base font-bold text-[#ff5451] underline">Sign Up</Text>
                        </TouchableOpacity>
                    </View>

                </View>

            </View>
        </ScrollView>
    );
}
