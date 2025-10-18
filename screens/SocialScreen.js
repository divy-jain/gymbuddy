// SocialScreen.js
export function SocialScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Social Feed</Text>
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.placeholder}>👥 Social features coming soon!</Text>
        <Text style={styles.subtext}>
          You'll see:{'\n\n'}
          • Friends' workout activity{'\n'}
          • Comments and reactions{'\n'}
          • Leaderboards{'\n'}
          • Share your PRs{'\n'}
          • Like and encourage friends
        </Text>
      </ScrollView>
    </View>
  );
}
