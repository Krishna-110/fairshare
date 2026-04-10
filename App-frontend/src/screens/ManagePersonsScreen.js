import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  TextInput,
  RefreshControl,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Theme } from '../theme/Theme';
import apiService from '../services/apiService';

const ManagePersonsScreen = ({ navigation, route }) => {
  const { token } = route.params;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [persons, setPersons] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonEmail, setNewPersonEmail] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchPersons = async () => {
    try {
      const data = await apiService.getAllPersons(token);
      setPersons(data);
    } catch (error) {
      console.error('Error fetching persons:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPersons();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPersons();
  };

  const handleAddPerson = async () => {
    if (!newPersonName.trim() || !newPersonEmail.trim()) {
      Alert.alert('Error', 'Please enter both name and email.');
      return;
    }

    setSaving(true);
    try {
      await apiService.addPerson({ 
        name: newPersonName.trim(),
        email: newPersonEmail.trim().toLowerCase()
      }, token);
      
      setNewPersonName('');
      setNewPersonEmail('');
      setModalVisible(false);
      fetchPersons();
      Alert.alert('Success', 'Person added successfully!');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add person.';
      Alert.alert('Error', message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePerson = (id, name) => {
    Alert.alert(
      'Delete Person',
      `Are you sure you want to delete ${name}? This will delete all their debt records.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deletePerson(id, token);
              fetchPersons();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete person.');
            }
          }
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Network</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <MaterialCommunityIcons name="account-plus" size={24} color={Theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.colors.primary} />}
      >
        <View style={styles.infoBox}>
           <Text style={styles.infoText}>Add people to your network using their emails. This allows you to log debts with them accurately.</Text>
        </View>

        {persons.map((person) => (
          <TouchableOpacity 
            key={person.id} 
            style={styles.personCard}
            onLongPress={() => handleDeletePerson(person.id, person.name)}
          >
            <View style={[styles.avatar, { backgroundColor: Theme.colors.surface }]}>
              <Text style={styles.avatarText}>{person.name.substring(0, 1).toUpperCase()}</Text>
            </View>
            <View style={styles.personDetails}>
              <Text style={styles.personName}>{person.name}</Text>
              <Text style={styles.personEmail}>{person.email}</Text>
            </View>
            <MaterialCommunityIcons name="dots-vertical" size={20} color={Theme.colors.textSecondary} />
          </TouchableOpacity>
        ))}

        {persons.length === 0 && (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="account-group-outline" size={64} color={Theme.colors.border} />
            <Text style={styles.emptyText}>No persons in your network yet.</Text>
          </View>
        )}
      </ScrollView>

      {/* Add Person Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Person</Text>
            <Text style={styles.modalSubTitle}>Enter the details of the person you want to add.</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor={Theme.colors.textSecondary}
              value={newPersonName}
              onChangeText={setNewPersonName}
            />

            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor={Theme.colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              value={newPersonEmail}
              onChangeText={setNewPersonEmail}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton, saving && { opacity: 0.7 }]} 
                onPress={handleAddPerson}
                disabled={saving}
              >
                <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Add Person'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  centered: { flex: 1, backgroundColor: Theme.colors.background, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 16 },
  title: { fontSize: 28, fontWeight: '800', color: Theme.colors.text },
  addButton: { padding: 12, borderRadius: 16, backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border },
  scrollContent: { padding: 24 },
  infoBox: { backgroundColor: 'rgba(79, 70, 229, 0.05)', padding: 16, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(79, 70, 229, 0.2)' },
  infoText: { fontSize: 13, color: Theme.colors.textSecondary, lineHeight: 18 },
  personCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.surface, padding: 16, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: Theme.colors.border },
  avatar: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginRight: 16, borderWidth: 1, borderColor: Theme.colors.border },
  avatarText: { fontSize: 20, fontWeight: '800', color: Theme.colors.primary },
  personDetails: { flex: 1 },
  personName: { fontSize: 18, fontWeight: '700', color: Theme.colors.text },
  personEmail: { fontSize: 13, color: Theme.colors.textSecondary, marginTop: 2 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: Theme.colors.textSecondary, marginTop: 16, fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 },
  modalContent: { backgroundColor: Theme.colors.surface, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: Theme.colors.border },
  modalTitle: { fontSize: 22, fontWeight: '800', color: Theme.colors.text, marginBottom: 8 },
  modalSubTitle: { fontSize: 14, color: Theme.colors.textSecondary, marginBottom: 20 },
  input: { backgroundColor: Theme.colors.background, borderRadius: 16, padding: 16, color: Theme.colors.text, fontSize: 16, borderWidth: 1, borderColor: Theme.colors.border, marginBottom: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  modalButton: { flex: 1, paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  cancelButton: { marginRight: 12 },
  cancelButtonText: { color: Theme.colors.textSecondary, fontWeight: '700' },
  saveButton: { backgroundColor: Theme.colors.primary },
  saveButtonText: { color: Theme.colors.white, fontWeight: '800' }
});

export default ManagePersonsScreen;
