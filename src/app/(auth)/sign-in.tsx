import { Link } from "expo-router";
import { Lock, Mail } from "lucide-react-native";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";

import { Button } from "@/components/ui/Button";
import { FieldInput } from "@/components/ui/FieldInput";
import { RatingGradient } from "@/components/ui/RatingGradient";
import { Wordmark } from "@/components/ui/Wordmark";
import { supabase } from "@/lib/supabase";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const signIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (error) {
      Alert.alert("Sign in failed", error.message);
    }
    // On success onAuthStateChange updates the session and the root
    // Stack.Protected guard swaps this screen out for the tabs.
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-background"
    >
      <RatingGradient />
      <View className="flex-1 justify-center gap-3 px-6">
        <View className="mb-6 items-center gap-2">
          <Wordmark size={45} />
          <Text className="px-4 text-center text-xl leading-5 text-text-muted">
            Your personal film diary.
          </Text>
        </View>
        {/* Tighter than the column's gap so the fields read as one stack,
            separate from the button below. */}
        <View className="gap-1.5">
          <FieldInput
            icon={Mail}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
          />
          <FieldInput
            icon={Lock}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secure
            autoComplete="current-password"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={signIn}
          />
        </View>
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
