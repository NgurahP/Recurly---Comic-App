import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { Search, Play, Bookmark, Star, Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { fetchPopularManga, fetchLatestManga } from '@/services/mangadex';
import { MangaItem } from '@/types/mangadex';

export default function Home() {
    const router = useRouter();

    const [heroManga, setHeroManga] = useState<MangaItem | null>(null);
    const [popularList, setPopularList] = useState<MangaItem[]>([]);
    const [latestList, setLatestList] = useState<MangaItem[]>([]);

    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [selectedGenre, setSelectedGenre] = useState<string>('All');

    const loadData = useCallback(async () => {
        try {
            const [popular, latest] = await Promise.all([
                fetchPopularManga(15),
                fetchLatestManga(12)
            ]);

            if (popular.length > 0) {
                setHeroManga(popular[0]);
                setPopularList(popular.slice(1));
            }

            if (latest.length > 0) {
                setLatestList(latest);
            }
        } catch (error) {
            console.error('Error loading manga data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    if (loading) {
        return (
            <View className="flex-1 bg-zinc-950 justify-center items-center">
                <ActivityIndicator size="large" color="#ef4444" />
                <Text className="text-zinc-400 mt-4 text-sm font-medium">Memuat MangaDex...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-zinc-950">

            {/* 1. HEADER (Top Navigation) */}
            <View className="flex-row items-center justify-between px-5 pt-14 pb-4 bg-zinc-950/90 z-50 border-b border-zinc-800">
                <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 rounded-full overflow-hidden border border-red-500/20 bg-zinc-900 justify-center items-center">
                        <Text className="text-red-500 font-extrabold text-lg">K</Text>
                    </View>
                    <Text className="text-xl font-extrabold text-red-500 tracking-tighter">KATALOG KOMIK</Text>
                </View>
                <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
                    <Search color="#ef4444" size={24} />
                </TouchableOpacity>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ef4444" />
                }
            >

                {/* 2. HERO SECTION (Banner Komik Unggulan) */}
                {heroManga && (
                    <View className="relative w-full aspect-[3/4] overflow-hidden">
                        <Image
                            source={{ uri: heroManga.coverUrl }}
                            style={{ width: '100%', height: '100%', position: 'absolute' }}
                            contentFit="cover"
                            transition={300}
                        />
                        {/* Overlay Gelap Gradient */}
                        <View className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />

                        <View className="absolute bottom-0 left-0 w-full p-5 space-y-3">
                            {heroManga.tags.length > 0 && (
                                <View className="self-start px-3 py-1 bg-zinc-800/80 rounded-full border border-zinc-600">
                                    <Text className="text-red-400 font-bold text-xs uppercase tracking-widest">
                                        {heroManga.tags[0]}
                                    </Text>
                                </View>
                            )}
                            <Text className="text-3xl font-extrabold text-white" numberOfLines={2}>
                                {heroManga.title}
                            </Text>
                            <Text className="text-zinc-300 text-sm" numberOfLines={2}>
                                {heroManga.description}
                            </Text>

                            <View className="flex-row gap-3 pt-2">
                                <TouchableOpacity
                                    className="flex-row items-center gap-2 bg-red-500 px-6 py-3 rounded-full"
                                    onPress={() => router.push(`/(tabs)/explore`)}
                                >
                                    <Play color="white" size={18} fill="white" />
                                    <Text className="text-white font-bold text-sm">Read Now</Text>
                                </TouchableOpacity>
                                <TouchableOpacity className="p-3 bg-zinc-800/80 border border-zinc-700 rounded-full">
                                    <Bookmark color="white" size={18} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}

                {/* 3. GENRE NAVIGATION */}
                <View className="py-6 px-5">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-xl font-bold text-white">Categories</Text>
                        <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
                            <Text className="text-red-500 text-sm font-bold">View All</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-3">
                        {['All', 'Action', 'Romance', 'Fantasy', 'Sci-Fi', 'Comedy', 'Drama'].map((genre) => {
                            const isSelected = selectedGenre === genre;
                            return (
                                <TouchableOpacity
                                    key={genre}
                                    onPress={() => setSelectedGenre(genre)}
                                    className={`px-5 py-2 rounded-full mr-2 border ${
                                        isSelected
                                            ? 'bg-red-500 border-red-500'
                                            : 'bg-zinc-900 border-zinc-700'
                                    }`}
                                >
                                    <Text className={isSelected ? 'text-white font-bold' : 'text-zinc-400 font-bold'}>
                                        {genre}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* 4. POPULAR MANGA (Daftar Komik dari MangaDex) */}
                <View className="px-5 pb-10 space-y-4">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-xl font-bold text-white">Popular Manga</Text>
                        <Sparkles color="#a1a1aa" size={20} />
                    </View>

                    <View className="flex-row flex-wrap justify-between">
                        {popularList.map((manga) => (
                            <TouchableOpacity
                                key={manga.id}
                                className="w-[48%] bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 mb-4"
                                onPress={() => router.push('/(tabs)/explore')}
                            >
                                <View className="aspect-[2/3] w-full relative bg-zinc-800">
                                    <Image
                                        source={{ uri: manga.coverUrl }}
                                        style={{ width: '100%', height: '100%' }}
                                        contentFit="cover"
                                        transition={300}
                                    />
                                    <View className="absolute top-2 left-2 px-2 py-1 bg-black/70 rounded border border-red-500/30">
                                        <Text className="text-[10px] font-bold text-red-500 uppercase">
                                            {manga.status}
                                        </Text>
                                    </View>
                                </View>
                                <View className="p-3">
                                    <Text className="font-bold text-white mb-1" numberOfLines={1}>
                                        {manga.title}
                                    </Text>
                                    <View className="flex-row items-center justify-between">
                                        <Text className="text-zinc-400 text-xs flex-1 mr-2" numberOfLines={1}>
                                            {manga.author || 'MangaDex'}
                                        </Text>
                                        <View className="flex-row items-center gap-1">
                                            <Star color="#eab308" size={12} fill="#eab308" />
                                            <Text className="text-white text-xs font-bold">
                                                {manga.ratingScore ? manga.ratingScore.toFixed(1) : '4.5'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

            </ScrollView>
        </View>
    );
}
