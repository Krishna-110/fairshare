import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  Dimensions,
  RefreshControl,
  TouchableOpacity,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PieChart } from 'react-native-chart-kit';
import * as SecureStore from 'expo-secure-store';
import { Theme } from '../theme/Theme';
import apiService from '../services/apiService';
import TransactionCard from '../components/TransactionCard';
import AddDebtModal from '../components/AddDebtModal';
import EditDebtModal from '../components/EditDebtModal';

const screenWidth = Dimensions.get('window').width;

const DashboardScreen = ({ navigation, route }) => {
  const { token, user } = route.params;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [debts, setDebts] = useState([]);
  const [persons, setPersons] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const fetchData = async () => {
    try {
      const debtsData = await apiService.getAllDebts(token);
      setDebts(debtsData);
      
      const personsData = await apiService.getAllPersons(token);
      setPersons(personsData);
    } catch (error) {
      console.error('Fetch error:', error);
      if (error.response?.status === 401) {
        Alert.alert('Session Expired', 'Please login again.');
        handleLogout(true); // Forced logout
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleEditClick = (transaction) => {
    setSelectedTransaction(transaction);
    setEditModalVisible(true);
  };

  const handleDeleteDebt = (id) => {
    Alert.alert(
      'Delete Record',
      'Are you sure you want to delete this debt? This will update everyone\'s balance.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteDebt(id, token);
              fetchData(); // Refresh data
            } catch (error) {
              Alert.alert('Error', 'Failed to delete record.');
            }
          }
        }
      ]
    );
  };

  const handleLogout = (forced = false) => {
    const performLogout = async () => {
      // Clear persistence!
      await SecureStore.deleteItemAsync('userToken');
      
      // Reset navigation to Landing and clear history
      navigation.reset({
        index: 0,
        routes: [{ name: 'Landing' }],
      });
    };

    if (forced) {
       performLogout();
       return;
    }

    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: performLogout
        }
      ]
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  const totalSystemDebt = debts.reduce((sum, d) => sum + d.amount, 0);
  
  // Calculate Personal Balances for the Chart (Case-Insensitive)
  const personalEmail = user?.email?.toLowerCase();
  
  const totalOwe = debts
    .filter(d => d.debtor?.email?.toLowerCase() === personalEmail)
    .reduce((sum, d) => sum + d.amount, 0);
    
  const totalReceive = debts
    .filter(d => d.creditor?.email?.toLowerCase() === personalEmail)
    .reduce((sum, d) => sum + d.amount, 0);

  const netBalance = totalReceive - totalOwe;
  const hasData = totalOwe > 0 || totalReceive > 0;
  
  const chartData = [
    {
      name: 'Receive',
      amount: totalReceive || (hasData ? 0 : 1),
      color: Theme.colors.secondary,
    },
    {
      name: 'Owe',
      amount: totalOwe || (hasData ? 0 : 1),
      color: Theme.colors.accent,
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.colors.primary} />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{(user && user.name) ? user.name.split(' ')[0] : 'User'}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <MaterialCommunityIcons name="logout" size={24} color={Theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.balanceCard}>
           <View style={styles.balanceHeader}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="bank" size={24} color={Theme.colors.white} />
              </View>
              <Text style={styles.balanceLabel}>Total System Debt</Text>
           </View>
           <Text style={styles.balanceAmount}>
             ₹{totalSystemDebt.toFixed(2)}
           </Text>
        </View>

        {/* Analytics Section - THE DONUT HERO */}
        <View style={styles.chartContainer}>
          <Text style={styles.sectionTitle}>Real-time Standing</Text>
          
          <View style={styles.donutWrapper}>
            <PieChart
              data={chartData}
              width={screenWidth - 48}
              height={200}
              chartConfig={{
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                propsForLabels: { fontSize: 0 }
              }}
              accessor={"amount"}
              backgroundColor={"transparent"}
              paddingLeft={screenWidth / 4 - 20} // Numeric calculation for better centering
              hasLegend={false} // Custom legend used instead
            />
            {/* The Donut Hole */}
            <View style={styles.donutHole}>
              <Text style={styles.netAmount}>
                {netBalance >= 0 ? '+' : ''}₹{Math.abs(netBalance).toFixed(0)}
              </Text>
              <Text style={styles.netLabel}>Net Balance</Text>
            </View>
          </View>

          {/* Custom Legend */}
          <View style={styles.customLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: Theme.colors.secondary }]} />
              <Text style={styles.legendText}>Receiving: ₹{totalReceive.toFixed(0)}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: Theme.colors.accent }]} />
              <Text style={styles.legendText}>Paying: ₹{totalOwe.toFixed(0)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.miniCard}>
            <MaterialCommunityIcons name="account-group" size={20} color={Theme.colors.primary} />
            <Text style={styles.miniLabel}>Persons</Text>
            <Text style={styles.miniAmount}>{persons.length}</Text>
          </View>
          <View style={styles.miniCard}>
            <MaterialCommunityIcons name="swap-horizontal" size={20} color={Theme.colors.secondary} />
            <Text style={styles.miniLabel}>Transactions</Text>
            <Text style={styles.miniAmount}>{debts.length}</Text>
          </View>
        </View>

        <View style={styles.transactionsHeader}>
          <Text style={styles.sectionTitle}>Your Activities</Text>
          <TouchableOpacity 
            style={styles.settleButton}
            onPress={() => navigation.navigate('Settle Up', { user })}
          >
            <MaterialCommunityIcons name="auto-fix" size={16} color={Theme.colors.primary} />
            <Text style={styles.settleButtonText}>Settle Up</Text>
          </TouchableOpacity>
        </View>
        
        {(() => {
          const userDebts = debts.filter(d => 
            d.debtor?.email?.toLowerCase() === personalEmail || 
            d.creditor?.email?.toLowerCase() === personalEmail
          );

          return userDebts.length > 0 ? (
            userDebts.map((item, index) => (
              <TransactionCard 
                key={item.id || index} 
                transaction={item} 
                onDelete={handleDeleteDebt}
                onEdit={handleEditClick}
              />
            ))
          ) : (
            <View style={styles.emptyContent}>
               <MaterialCommunityIcons name="receipt" size={48} color={Theme.colors.border} />
               <Text style={styles.emptyText}>No personal records found.</Text>
            </View>
          );
        })()}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <MaterialCommunityIcons name="plus" size={32} color={Theme.colors.white} />
      </TouchableOpacity>

      {/* Modals */}
      <AddDebtModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={fetchData}
        user={user}
        token={token}
      />

      <EditDebtModal 
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        onSuccess={fetchData}
        user={user}
        token={token}
        transaction={selectedTransaction}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  centered: { flex: 1, backgroundColor: Theme.colors.background, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: Theme.colors.background },
  scrollContent: { paddingHorizontal: Theme.spacing.lg, paddingBottom: 100 }, // Space for FAB
  header: { marginTop: Theme.spacing.xl, marginBottom: Theme.spacing.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  welcomeText: { fontSize: 16, color: Theme.colors.textSecondary },
  userName: { fontSize: 32, color: Theme.colors.text, fontWeight: '800' },
  profileCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: Theme.colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Theme.colors.primary },
  headerActions: { flexDirection: 'row', alignItems: 'center', height: 56 },
  logoutButton: { marginRight: 12, width: 44, height: 44, borderRadius: 12, backgroundColor: Theme.colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Theme.colors.border },
  profileInitial: { color: Theme.colors.primary, fontSize: 20, fontWeight: '900' },
  balanceCard: { backgroundColor: Theme.colors.primary, borderRadius: Theme.borderRadius.xl, padding: Theme.spacing.lg, marginBottom: Theme.spacing.xl },
  balanceHeader: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { backgroundColor: 'rgba(255,255,255,0.2)', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: Theme.spacing.sm },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600' },
  balanceAmount: { fontSize: 40, fontWeight: '900', marginTop: Theme.spacing.sm, color: Theme.colors.white },
  chartContainer: { backgroundColor: Theme.colors.surface, padding: Theme.spacing.lg, borderRadius: Theme.borderRadius.xl, marginBottom: Theme.spacing.xl, borderWidth: 1, borderColor: Theme.colors.border },
  donutWrapper: { position: 'relative', alignItems: 'center', justifyContent: 'center', height: 200 },
  donutHole: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: Theme.colors.surface, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  netAmount: { fontSize: 24, fontWeight: '900', color: Theme.colors.text },
  netLabel: { fontSize: 10, color: Theme.colors.textSecondary, fontWeight: '700', marginTop: 2 },
  customLegend: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20, paddingBottom: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  legendText: { fontSize: 13, fontWeight: '700', color: Theme.colors.textSecondary },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: Theme.colors.text, marginBottom: Theme.spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Theme.spacing.xl },
  miniCard: { backgroundColor: Theme.colors.surface, width: '48%', padding: Theme.spacing.md, borderRadius: Theme.borderRadius.lg, borderWidth: 1, borderColor: Theme.colors.border },
  miniLabel: { fontSize: 12, color: Theme.colors.textSecondary, marginTop: Theme.spacing.sm, fontWeight: '600' },
  miniAmount: { fontSize: 18, fontWeight: '800', color: Theme.colors.text, marginTop: 2 },
  emptyContent: { alignItems: 'center', marginTop: 40, opacity: 0.5 },
  emptyText: { color: Theme.colors.textSecondary, textAlign: 'center', marginTop: Theme.spacing.sm },
  transactionsHeader: { marginTop: Theme.spacing.sm, marginBottom: Theme.spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settleButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(79, 70, 229, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  settleButtonText: { color: Theme.colors.primary, fontSize: 13, fontWeight: '700', marginLeft: 4 },
  fab: { position: 'absolute', right: 24, bottom: 24, width: 64, height: 64, borderRadius: 32, backgroundColor: Theme.colors.secondary, alignItems: 'center', justifyContent: 'center', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4 }
});

export default DashboardScreen;
