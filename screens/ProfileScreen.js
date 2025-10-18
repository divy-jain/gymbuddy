// ProfileScreen.js
export function ProfileScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.profileInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <Text style={styles.userName}>Your Name</Text>
          <Text style={styles.userEmail}>your.email@example.com</Text>
        </View>
        
        <Text style={styles.subtext}>
          Coming soon:{'\n\n'}
          • Edit profile{'\n'}
          • Settings & preferences{'\n'}
          • Privacy controls{'\n'}
          • Export workout data{'\n'}
          • Logout
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  placeholder: {
    fontSize: 24,
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  subtext: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  profileInfo: {
    alignItems: 'center',
    marginVertical: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 50,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
});