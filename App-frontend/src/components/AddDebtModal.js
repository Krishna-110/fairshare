import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Theme } from '../theme/Theme';
import apiService from '../services/apiService';

const AddDebtModal = ({ visible, onClose, onSuccess, user, token }) => {
  const [amount, setAmount] = useState('');
  const [debtorEmail, setDebtorEmail] = useState('');
  const [creditorEmail, setCreditorEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!amount || !debtorEmail || !creditorEmail) {
      Alert.alert('Missing Info', 'Please provide both emails and an amount.');
      return;
    }

    if (debtorEmail.toLowerCase() === creditorEmail.toLowerCase()) {
      Alert.alert('Invalid Selection', 'Debtor and creditor cannot be the same person.');
      return;
    }

    setLoading(true);
    try {
      const debtData = {
        debtorEmail: debtorEmail.toLowerCase().trim(),
        creditorEmail: creditorEmail.toLowerCase().trim(),
        amount: parseFloat(amount)
      };

      await apiService.addDebt(debtData, token);
      onSuccess();
      resetForm();
      onClose();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to add debt. Ensure both emails are registered.';
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const useMyEmailForDebtor = () => setDebtorEmail(user.email);
  const useMyEmailForCreditor = () => setCreditorEmail(user.email);

  const resetForm = () => {
    setAmount('');
    setDebtorEmail('');
    setCreditorEmail('');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>New Debt Record</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color={Theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Debtor Email */}
            <View style={styles.fieldHeader}>
              <Text style={styles.label}>Who owes? (Email)</Text>
              <TouchableOpacity onPress={useMyEmailForDebtor}>
                <Text style={styles.shortcutText}>Use Mine</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="debtor@example.com"
              placeholderTextColor={Theme.colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              value={debtorEmail}
              onChangeText={setDebtorEmail}
            />

            {/* Creditor Email */}
            <View style={styles.fieldHeader}>
              <Text style={styles.label}>To whom? (Email)</Text>
              <TouchableOpacity onPress={useMyEmailForCreditor}>
                <Text style={styles.shortcutText}>Use Mine</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="creditor@example.com"
              placeholderTextColor={Theme.colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              value={creditorEmail}
              onChangeText={setCreditorEmail}
            />

            {/* Amount */}
            <Text style={styles.label}>Amount (₹)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor={Theme.colors.textSecondary}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />

            <TouchableOpacity 
              style={[styles.submitButton, loading && { opacity: 0.7 }]}
              onPress={handleAdd}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Adding...' : 'Confirm Transaction'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.helperText}>
              Note: Both users must exist in the system to create a record.
            </Text>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Theme.colors.background, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '85%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '800', color: Theme.colors.text },
  fieldHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 16, marginBottom: 8 },
  label: { fontSize: 13, color: Theme.colors.textSecondary, fontWeight: '600', textTransform: 'uppercase' },
  shortcutText: { color: Theme.colors.primary, fontSize: 13, fontWeight: '700' },
  input: { backgroundColor: Theme.colors.surface, borderRadius: 16, padding: 16, color: Theme.colors.text, fontSize: 16, borderWidth: 1, borderColor: Theme.colors.border },
  submitButton: { backgroundColor: Theme.colors.primary, borderRadius: Theme.borderRadius.lg, padding: 18, alignItems: 'center', marginTop: 32, marginBottom: 16 },
  submitButtonText: { color: Theme.colors.white, fontSize: 18, fontWeight: '800' },
  helperText: { textAlign: 'center', color: Theme.colors.textSecondary, fontSize: 12, marginTop: 8, fontStyle: 'italic' }
});

export default AddDebtModal;
