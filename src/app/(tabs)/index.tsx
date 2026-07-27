import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PosterCard } from "@/components/movie/PosterCard";
import { SearchInput } from "@/components/ui/SearchInput";
import { useMovieSearch, useTrending } from "@/lib/queries/movies";
import { useTheme } from "@/theme/ThemeProvider";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const { colors } = useTheme();
  const router = useRouter();

  const searching = query.trim().length > 0;
  const trending = useTrending();
  const search = useMovieSearch(query);
  const active = searching ? search : trending;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <View className="px-3 pb-3 pt-2">
        <SearchInput value={query} onChangeText={setQuery} />
      </View>

      {active.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors["--color-text-muted"]} />
        </View>
      ) : active.isError ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center text-sm text-text-muted">
            Couldn't load films. Check your connection and try again.
          </Text>
        </View>
      ) : (
        <FlatList
          data={active.data?.results}
          keyExtractor={(movie) => String(movie.id)}
          numColumns={3}
          contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 24 }}
          ListHeaderComponent={
            searching ? null : (
              <Text className="px-1 pb-2 text-sm font-semibold text-text-muted">
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
            <PosterCard
              movie={item}
              onPress={() =>
                router.push({
                  pathname: "/movie/[id]",
                  params: { id: String(item.id) },
                })
              }
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}
