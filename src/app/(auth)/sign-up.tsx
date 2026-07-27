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

export default function SignUpScreen() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const signUp = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        // Lands in raw_user_meta_data, which the handle_new_user trigger
        // copies into profiles.display_name.
        data: { display_name: displayName.trim() || null },
      },
    });
    setLoading(false);
    if (error) {
      Alert.alert('Sign up failed', error.message);
      return;
    }
    if (!data.session) {
      // Email confirmation is still enabled in Supabase — the account
      // exists but can't sign in until the email link is clicked.
      Alert.alert(
        'Confirm your email',
        'Check your inbox for a confirmation link, then sign in.',
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-background"
    >
      <View className="flex-1 justify-center gap-4 px-6">
        <Text className="mb-4 text-center text-3xl font-bold text-text-primary">
          Create account
        </Text>
        <TextField
          label="Display name"
          value={displayName}
          onChangeText={setDisplayName}
          autoComplete="name"
        />
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
          autoComplete="new-password"
        />
        <Button
          title="Sign up"
          onPress={signUp}
          loading={loading}
          disabled={!email.trim() || password.length < 6}
        />
        <Link href="/sign-in" asChild>
          <Pressable className="items-center py-2 active:opacity-70">
            <Text className="text-sm text-primary">Already have an account? Sign in</Text>
          </Pressable>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}
