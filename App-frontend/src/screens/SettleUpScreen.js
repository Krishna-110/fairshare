import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Theme } from '../theme/Theme';
import apiService from '../services/apiService';

const SettleUpScreen = ({ navigation, route }) => {
  const { token, user } = route.params;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [settlements, setSettlements] = useState([]);

  const fetchSettlements = async () => {
    try {
      const data = await apiService.settleDebts(token);
      setSettlements(data);
    } catch (error) {
      console.error('Error fetching settlements:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSettlements();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSettlements();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  const personalEmail = user?.email?.toLowerCase();
  const userSettlements = settlements.filter(s => 
    s.fromEmail?.toLowerCase() === personalEmail || 
    s.toEmail?.toLowerCase() === personalEmail
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Your Settle Up</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.colors.primary} />}
      >
        <View style={styles.infoBox}>
          <MaterialCommunityIcons name="auto-fix" size={32} color={Theme.colors.secondary} />
          <Text style={styles.infoTitle}>Action Needed</Text>
          <Text style={styles.infoDesc}>
            Based on the global debt web, here are the specific payments you need to make or receive to get square.
          </Text>
        </View>

        {userSettlements.length > 0 ? (
          userSettlements.map((item, index) => (
            <View key={index} style={styles.settleCard}>
              <View style={styles.personInfo}>
                <View style={[styles.avatar, { backgroundColor: Theme.colors.accent }]}>
                  <Text style={styles.avatarText}>{(item.from || 'P').substring(0, 1)}</Text>
                </View>
                <Text style={[styles.name, item.fromEmail?.toLowerCase() === personalEmail && { color: Theme.colors.primary, fontWeight: '900' }]}>
                  {item.fromEmail?.toLowerCase() === personalEmail ? 'YOU' : item.from}
                </Text>
              </View>
              
              <View style={styles.arrowContainer}>
                <Text style={styles.amount}>₹{item.amount.toFixed(0)}</Text>
                <MaterialCommunityIcons name="arrow-right" size={24} color={Theme.colors.primary} />
              </View>

              <View style={styles.personInfo}>
                <View style={[styles.avatar, { backgroundColor: Theme.colors.secondary }]}>
                  <Text style={styles.avatarText}>{(item.to || 'P').substring(0, 1)}</Text>
                </View>
                <Text style={[styles.name, item.toEmail?.toLowerCase() === personalEmail && { color: Theme.colors.primary, fontWeight: '900' }]}>
                   {item.toEmail?.toLowerCase() === personalEmail ? 'YOU' : item.to}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="check-circle" size={64} color={Theme.colors.secondary} />
            <Text style={styles.emptyTitle}>You're All Square!</Text>
            <Text style={styles.emptyDesc}>No actions needed from your side. The global optimization finds you already balanced.</Text>
          </View>
        )}

        <Text style={styles.subtext}>Payments should be made manually between persons.</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  centered: { flex: 1, backgroundColor: Theme.colors.background, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backButton: { padding: 8, borderRadius: 12, backgroundColor: Theme.colors.surface },
  title: { fontSize: 20, fontWeight: '800', color: Theme.colors.text },
  scrollContent: { padding: 20 },
  infoBox: { backgroundColor: Theme.colors.surface, padding: 24, borderRadius: 24, alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: Theme.colors.border },
  infoTitle: { fontSize: 22, fontWeight: '800', color: Theme.colors.text, marginTop: 12 },
  infoDesc: { fontSize: 14, color: Theme.colors.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  settleCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.surface, padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: Theme.colors.border, justifyContent: 'space-between' },
  personInfo: { alignItems: 'center', width: '30%' },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  avatarText: { color: Theme.colors.white, fontWeight: '800', fontSize: 18 },
  name: { fontSize: 12, fontWeight: '700', color: Theme.colors.text, textAlign: 'center' },
  arrowContainer: { alignItems: 'center' },
  amount: { fontSize: 16, fontWeight: '900', color: Theme.colors.primary, marginBottom: 4 },
  emptyContainer: { alignItems: 'center', paddingVertical: 48 },
  emptyTitle: { fontSize: 24, fontWeight: '800', color: Theme.colors.text, marginTop: 16 },
  emptyDesc: { fontSize: 16, color: Theme.colors.textSecondary, textAlign: 'center', marginTop: 8 },
  clearButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 40, padding: 18, borderRadius: 16, borderWidth: 1, borderColor: Theme.colors.accent, backgroundColor: 'rgba(239, 68, 68, 0.05)' },
  clearButtonText: { color: Theme.colors.accent, fontSize: 16, fontWeight: '800', marginLeft: 8 },
  subtext: { color: Theme.colors.textSecondary, fontSize: 12, textAlign: 'center', marginTop: 8, fontStyle: 'italic' }
});

export default SettleUpScreen;
