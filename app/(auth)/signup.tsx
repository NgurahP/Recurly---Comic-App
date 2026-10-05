import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Mail, Lock, Eye, EyeOff, Bolt, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth, useSignUp, useSSO } from "@clerk/expo";
import * as WebBrowser from "expo-web-browser";

// WAJIB: Menangani redirect setelah login OAuth selesai di browser bawaan
WebBrowser.maybeCompleteAuthSession();

export default function SignUpScreen() {
    const router = useRouter();
    const { isLoaded, isSignedIn } = useAuth();
    const { signUp } = useSignUp();

    const { startSSOFlow } = useSSO();

    // State Manajemen Formulir
    const [emailAddress, setEmailAddress] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [code, setCode] = useState('');

    // State Render Bersyarat untuk OTP
    const [isVerify, setIsVerify] = useState(false);

    // State loading khusus tombol Google
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    // Fungsi Sign Up Email & Password
    const handleSignUp = async () => {
        if (!signUp) return;

        const { error } = await signUp.password({ emailAddress, password });
        if (error){
            Alert.alert("Gagal Mendaftar", error.message || "Pastikan format email benar dan password memenuhi syarat.");
            return;
        }

        const { error: sendError } = await signUp.verifications.sendEmailCode();
        if (sendError) {
            Alert.alert("Gagal", sendError.message || "Gagal mengirim kode OTP ke email.");
            return;
        }

        setIsVerify(true);
    }

    // Fungsi Verifikasi OTP
    const handleVerify = async () => {
        if (!signUp) return;

        const { error } = await signUp.verifications.verifyEmailCode({ code });
        if (error) {
            Alert.alert("Gagal Verifikasi", error.message || "Kode OTP salah atau sudah kedaluwarsa.");
            return;
        }

        const { error: finalizeError } = await signUp.finalize();
        if (finalizeError) {
            Alert.alert("Gagal Aktivasi", finalizeError.message || "Terjadi kesalahan saat menyelesaikan pendaftaran.");
            return;
        }
        router.replace('/(tabs)');
    }

    // Fungsi BARU: Sign Up/Sign In dengan Google SSO (Standard Expo Web Browser OAuth)
    const handleGoogleSignUp = async () => {
        setIsGoogleLoading(true);
        try {
            const { createdSessionId, setActive, signUp, signIn } = await startSSOFlow({
                strategy: 'oauth_google',
            });

            console.log("=== DEBUG GOOGLE SSO ===");
            console.log("createdSessionId:", createdSessionId);
            console.log("signIn status:", signIn?.status);
            console.log("signUp status:", signUp?.status);
            console.log("========================");

            if (createdSessionId && setActive) {
                await setActive({ session: createdSessionId });
                router.replace('/(tabs)');
                return;
            }

            if (signUp?.status === 'complete' && setActive) {
                await setActive({ session: signUp.createdSessionId });
                router.replace('/(tabs)');
                return;
            }

            if (signIn?.status === 'needs_signup' && signUp) {
                const signUpResponse = await signUp.create({ transfer: true });
                if (signUpResponse.status === 'complete' && setActive) {
                    await setActive({ session: signUpResponse.createdSessionId });
                    router.replace('/(tabs)');
                    return;
                }
            }

            if (signUp || signIn) {
                Alert.alert(
                    "Detail Status Clerk",
                    `signUp.status: ${signUp?.status ?? 'null'} | signIn.status: ${signIn?.status ?? 'null'}`
                );
            }
        } catch (err: any) {
            console.error("Google SSO Error:", err);
            Alert.alert("Gagal Login", err?.message || "Terjadi kesalahan saat login dengan Google.");
        } finally {
            setIsGoogleLoading(false);
        }
    };

    if (!isLoaded) {
        return null;
    }

    if (isSignedIn) {
        return (
            <View className="bg-[#131315]">
                <Text>You&apos;re signed in</Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-[#131315]" showsVerticalScrollIndicator={false}>
            <View className="relative min-h-screen flex flex-col max-w-[430px] mx-auto pb-10">

                <TouchableOpacity
                    onPress={() => router.back()}
                    className="absolute top-12 left-5 z-20 p-2 bg-black/40 rounded-full"
                >
                    <ArrowLeft color="white" size={24} />
                </TouchableOpacity>

                {/* Bagian Atas */}
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

                {/* Bagian Bawah */}
                <View className="flex-1 px-6 -mt-10 z-10">
                    <View className="mb-8">
                        <Text className="text-3xl font-bold text-[#e5e1e4] mb-1">
                            Join the Adventure!
                        </Text>
                        <Text className="text-base text-[#c8c5ca] opacity-70">
                            Create an account to start reading.
                        </Text>
                    </View>

                    {/* RENDER BERSYARAT: Form Registrasi vs Form OTP */}
                    {!isVerify ? (
                        <View className="space-y-4">
                            {/* ... (Input Email & Password Tetap Sama) ... */}
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

                            <TouchableOpacity onPress={handleSignUp} className="w-full h-14 bg-[#ff5451] rounded-full flex-row items-center justify-center gap-2 shadow-lg shadow-red-500/20 active:scale-95 transition-all">
                                <Text className="text-lg font-bold text-[#5c0008]">Sign Up</Text>
                                <Bolt color="#5c0008" size={20} />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View className="space-y-4">
                            <Text className="text-[#c8c5ca] text-center mb-2">
                                Check your email for the verification code
                            </Text>

                            <TextInput
                                className="w-full bg-[#2a2a2c] rounded-xl py-4 text-center text-[#e5e1e4] text-2xl font-bold tracking-[1em] mb-4 h-14"
                                placeholder="••••••"
                                placeholderTextColor="#46464a"
                                value={code}
                                onChangeText={setCode}
                                keyboardType="numeric"
                                maxLength={6}
                            />

                            <TouchableOpacity onPress={handleVerify} className="w-full h-14 bg-[#ff5451] rounded-full flex-row items-center justify-center gap-2 shadow-lg shadow-red-500/20 active:scale-95 transition-all">
                                <Text className="text-lg font-bold text-[#5c0008]">Verify Code</Text>
                                <Bolt color="#5c0008" size={20} />
                            </TouchableOpacity>
                        </View>
                    )}

                    <View className="flex-row items-center my-8 gap-4">
                        <View className="h-[1px] flex-1 bg-[#353437]" />
                        <Text className="text-xs font-medium text-[#c8c5ca] uppercase tracking-widest opacity-50">
                            or sign up with
                        </Text>
                        <View className="h-[1px] flex-1 bg-[#353437]" />
                    </View>

                    {/* Tombol Login Sosial (Google) */}
                    <TouchableOpacity
                        onPress={handleGoogleSignUp}
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

                    <View className="mt-8 mb-12 flex-row justify-center items-center">
                        <Text className="text-base text-[#e4beba]">Already have an account? </Text>
                        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                            <Text className="text-base font-bold text-[#ff5451] underline">Sign In</Text>
                        </TouchableOpacity>
                    </View>

                </View>

            </View>
        </ScrollView>
    );
}