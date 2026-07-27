import { Link } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';

import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { supabase } from '@/lib/supabase';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const signIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (error) {
      Alert.alert('Sign in failed', error.message);
    }
    // On success onAuthStateChange updates the session and the root
    // Stack.Protected guard swaps this screen out for the tabs.
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-background"
    >
      <View className="flex-1 justify-center gap-4 px-6">
        <View className="mb-4 items-center gap-1">
          <Text className="text-3xl font-bold text-text-primary">movielog</Text>
          <Text className="text-sm text-text-muted">your film diary</Text>
        </View>
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="current-password"
        />
        <Button
          title="Sign in"
          onPress={signIn}
          loading={loading}
          disabled={!email.trim() || !password}
        />
        <Link href="/sign-up" asChild>
          <Pressable className="items-center py-2 active:opacity-70">
            <Text className="text-sm text-primary">No account? Sign up</Text>
          </Pressable>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}
