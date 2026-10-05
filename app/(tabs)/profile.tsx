import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { useAuth, useUser } from '@clerk/expo';
import { useRouter } from 'expo-router';
import {
    Edit3,
    CheckCircle,
    History,
    Heart,
    Settings,
    HelpCircle,
    LogOut,
    UserCircle
} from 'lucide-react-native';

export default function ProfileScreen() {
    const { isSignedIn, signOut } = useAuth();
    const { user } = useUser();
    const router = useRouter();

    return (
        <ScrollView className="flex-1 bg-[#0e0e10]" showsVerticalScrollIndicator={false}>

            {isSignedIn ? (
                /* ================= 1. KONDISI SUDAH LOGIN ================= */
                <View className="pt-16 pb-32 px-4 max-w-lg mx-auto w-full">

                    <View className="items-center mb-8">
                        <Text className="text-3xl font-bold text-[#ffb3ad]">Profile</Text>
                    </View>

                    <View className="items-center mb-8">
                        <View className="relative">
                            <View className="w-32 h-32 rounded-full border-2 border-[#ff5451] p-1 bg-[#201f22] overflow-hidden">
                                <Image
                                    source={{ uri: user?.imageUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500" }}
                                    style={{ width: '100%', height: '100%', borderRadius: 9999 }}
                                />
                            </View>
                            <TouchableOpacity className="absolute bottom-0 right-0 bg-[#ff5451] p-2 rounded-full border-2 border-[#0e0e10]">
                                <Edit3 color="#5c0008" size={16} />
                            </TouchableOpacity>
                        </View>

                        <View className="mt-4 items-center">
                            <Text className="text-2xl font-bold text-[#e5e1e4]">
                                {user?.fullName || 'Comic Reader'}
                            </Text>
                            <Text className="text-sm text-[#b6b4b8] mt-1">
                                {user?.primaryEmailAddress?.emailAddress || 'reader@vault.com'}
                            </Text>

                            <View className="flex-row items-center px-3 py-1 mt-2 rounded-full bg-[#ffb3ad]/10 border border-[#ffb3ad]/20 gap-1">
                                <CheckCircle color="#ffb3ad" size={14} />
                                <Text className="text-xs font-semibold text-[#ffb3ad]">Premium Member</Text>
                            </View>
                        </View>
                    </View>

                    <View className="flex-row gap-3 mb-8">
                        <View className="flex-1 bg-[#201f22] rounded-2xl p-4 items-center justify-center border border-[#5b403e]/30">
                            <Text className="text-2xl font-bold text-[#ffb3ad]">124</Text>
                            <Text className="text-xs text-[#b6b4b8] mt-1">Read</Text>
                        </View>
                        <View className="flex-1 bg-[#201f22] rounded-2xl p-4 items-center justify-center border border-[#5b403e]/30">
                            <Text className="text-2xl font-bold text-[#ffb3ad]">12</Text>
                            <Text className="text-xs text-[#b6b4b8] mt-1">Series</Text>
                        </View>
                        <View className="flex-1 bg-[#201f22] rounded-2xl p-4 items-center justify-center border border-[#5b403e]/30">
                            <Text className="text-2xl font-bold text-[#ffb3ad]">850</Text>
                            <Text className="text-xs text-[#b6b4b8] mt-1">Hours</Text>
                        </View>
                    </View>

                    <View className="space-y-3 gap-3">
                        <TouchableOpacity className="flex-row items-center justify-between p-4 bg-[#201f22] rounded-2xl border border-[#5b403e]/30 active:opacity-80">
                            <View className="flex-row items-center gap-4">
                                <View className="w-10 h-10 rounded-xl bg-[#2a2a2c] items-center justify-center">
                                    <History color="#e4beba" size={20} />
                                </View>
                                <Text className="text-base font-semibold text-[#e5e1e4]">Reading History</Text>
                            </View>
                            <Text className="text-[#b6b4b8]">›</Text>
                        </TouchableOpacity>

                        <TouchableOpacity className="flex-row items-center justify-between p-4 bg-[#201f22] rounded-2xl border border-[#5b403e]/30 active:opacity-80">
                            <View className="flex-row items-center gap-4">
                                <View className="w-10 h-10 rounded-xl bg-[#2a2a2c] items-center justify-center">
                                    <Heart color="#ff5451" size={20} fill="#ff5451" />
                                </View>
                                <Text className="text-base font-semibold text-[#e5e1e4]">Favorite Comics</Text>
                            </View>
                            <Text className="text-[#b6b4b8]">›</Text>
                        </TouchableOpacity>

                        <TouchableOpacity className="flex-row items-center justify-between p-4 bg-[#201f22] rounded-2xl border border-[#5b403e]/30 active:opacity-80">
                            <View className="flex-row items-center gap-4">
                                <View className="w-10 h-10 rounded-xl bg-[#2a2a2c] items-center justify-center">
                                    <Settings color="#e4beba" size={20} />
                                </View>
                                <Text className="text-base font-semibold text-[#e5e1e4]">Settings</Text>
                            </View>
                            <Text className="text-[#b6b4b8]">›</Text>
                        </TouchableOpacity>

                        <TouchableOpacity className="flex-row items-center justify-between p-4 bg-[#201f22] rounded-2xl border border-[#5b403e]/30 active:opacity-80">
                            <View className="flex-row items-center gap-4">
                                <View className="w-10 h-10 rounded-xl bg-[#2a2a2c] items-center justify-center">
                                    <HelpCircle color="#e4beba" size={20} />
                                </View>
                                <Text className="text-base font-semibold text-[#e4beba]">Help & Support</Text>
                            </View>
                            <Text className="text-[#b6b4b8]">›</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="mt-8">
                        <TouchableOpacity
                            onPress={() => signOut()}
                            className="w-full py-4 rounded-2xl border-2 border-[#ff5451]/20 flex-row items-center justify-center gap-2 active:scale-95 transition-all"
                        >
                            <LogOut color="#ff5451" size={20} />
                            <Text className="text-[#ffb3ad] font-bold text-base">Log Out</Text>
                        </TouchableOpacity>
                        <Text className="text-center mt-6 text-xs text-[#b6b4b8]/50">Version 2.4.1-build.92</Text>
                    </View>

                </View>
            ) : (
                /* ================= 2. KONDISI BELUM LOGIN ================= */
                <View className="flex-1 items-center justify-center px-6 pt-32 pb-20 min-h-[80vh]">
                    <UserCircle color="#ff5451" size={80} style={{ marginBottom: 20 }} />
                    <Text className="text-2xl font-bold text-[#e5e1e4] mb-2">Welcome, Reader!</Text>
                    <Text className="text-base text-[#b6b4b8] text-center mb-8">
                        Please sign in to access your reading statistics, favorites, and profile details.
                    </Text>

                    <TouchableOpacity
                        onPress={() => router.push('/(auth)/login')}
                        className="w-full max-w-xs h-14 bg-[#ff5451] rounded-full items-center justify-center shadow-lg active:scale-95"
                    >
                        <Text className="text-[#5c0008] font-bold text-lg">Sign In / Register</Text>
                    </TouchableOpacity>
                </View>
            )}

        </ScrollView>
    );
}