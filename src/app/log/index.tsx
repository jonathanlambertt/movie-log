import { useRouter } from "expo-router";
import { X } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MovieRow } from "@/components/movie/MovieRow";
import { SearchInput } from "@/components/ui/SearchInput";
import { useMovieSearch, useTrending } from "@/lib/queries/movies";
import type { TmdbMovie } from "@/lib/tmdb";
import { useTheme } from "@/theme/ThemeProvider";

// Step 1 of the log flow: search TMDB and pick a film. Trending shows before
// the user types so the sheet is never a blank bar.
export default function LogPickFilm() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { colors } = useTheme();

  const searching = query.trim().length > 0;
  const trending = useTrending();
  const search = useMovieSearch(query);
  const active = searching ? search : trending;

  const pick = (movie: TmdbMovie) => {
    router.push({
      pathname: "/log/[filmId]",
      params: {
        filmId: String(movie.id),
        title: movie.title,
        poster: movie.posterPath ?? "",
        releaseDate: movie.releaseDate ?? "",
      },
    });
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-5 pb-3 pt-3">
        <Text className="text-2xl font-bold text-text-primary">Log a film</Text>
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel="Close"
          className="p-1 active:opacity-60"
        >
          <X size={26} color={colors["--color-text-primary"]} />
        </Pressable>
      </View>

      <View className="px-4 py-2">
        <SearchInput
          value={query}
          onChangeText={setQuery}
          autoFocus
          placeholder="Search for a movie..."
        />
      </View>

      {active.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors["--color-text-muted"]} />
        </View>
      ) : (
        <FlatList
          data={active.data?.results}
          keyExtractor={(movie) => String(movie.id)}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            searching ? null : (
              <Text className="px-4 pb-1 pt-2 text-sm font-semibold text-text-muted">
                Popular this week
              </Text>
            )
          }
          ListEmptyComponent={
            <Text className="pt-12 text-center text-sm text-text-faint">
              No films found
            </Text>
          }
          renderItem={({ item }) => (
            <MovieRow movie={item} onPress={() => pick(item)} />
          )}
        />
      )}
    </SafeAreaView>
  );
}
