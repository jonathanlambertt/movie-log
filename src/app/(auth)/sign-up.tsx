import { Link } from "expo-router";
import { Lock, Mail, User } from "lucide-react-native";
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

export default function SignUpScreen() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      Alert.alert("Sign up failed", error.message);
      return;
    }
    // Supabase hides "email already registered" to prevent enumeration: it
    // returns success with no error, but an existing address comes back with an
    // empty identities array. Detect that and point the user to sign in.
    if (data.user && data.user.identities?.length === 0) {
      Alert.alert(
        "Email already registered",
        "An account with this email already exists. Try signing in instead.",
      );
      return;
    }
    if (!data.session) {
      // Email confirmation is still enabled in Supabase — the account
      // exists but can't sign in until the email link is clicked.
      Alert.alert(
        "Confirm your email",
        "Check your inbox for a confirmation link, then sign in.",
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-background"
    >
      <RatingGradient />
      <View className="flex-1 justify-center gap-3 px-6">
        <View className="mb-6 items-center gap-2">
          <Wordmark />
          <Text className="px-4 text-center text-xl leading-5 text-text-muted">
            Get started by creating your profile!
          </Text>
        </View>
        {/* Tighter than the column's gap so the fields read as one stack,
            separate from the button below. */}
        <View className="gap-1.5">
          <FieldInput
            icon={User}
            placeholder="Display name"
            value={displayName}
            onChangeText={setDisplayName}
            autoComplete="name"
            textContentType="name"
            returnKeyType="next"
          />
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
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="go"
            onSubmitEditing={signUp}
          />
        </View>
        <Button
          title="Create account"
          onPress={signUp}
          loading={loading}
          disabled={!email.trim() || password.length < 6}
        />
        <Link href="/sign-in" asChild>
          <Pressable className="items-center py-2 active:opacity-70">
            <Text className="text-sm text-primary">
              Already have an account? Sign in
            </Text>
          </Pressable>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}
