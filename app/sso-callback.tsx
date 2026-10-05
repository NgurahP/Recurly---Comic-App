import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

export default function SSOCallback() {
    return (
        <View className="flex-1 bg-[#131315] justify-center items-center">
            <ActivityIndicator size="large" color="#ff5451" />
            <Text className="color-[#c8c5ca] mt-4 text-sm font-medium">
                Menyelesaikan autentikasi...
            </Text>
        </View>
    );
}
