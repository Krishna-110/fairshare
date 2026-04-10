import React, { useState, useEffect } from 'react';
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

const EditDebtModal = ({ visible, onClose, onSuccess, transaction, token }) => {
  const [amount, setAmount] = useState('');
  const [debtorEmail, setDebtorEmail] = useState('');
  const [creditorEmail, setCreditorEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && transaction) {
      setAmount(transaction.amount ? transaction.amount.toString() : '');
      setDebtorEmail(transaction.debtor.email);
      setCreditorEmail(transaction.creditor.email);
    }
  }, [visible, transaction]);

  const handleUpdate = async () => {
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

      await apiService.updateDebt(transaction.id, debtData, token);
      onSuccess();
      onClose();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update transaction. Ensure both emails are registered.';
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
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
            <Text style={styles.title}>Edit Transaction</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color={Theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Debtor Email */}
            <Text style={styles.label}>Debtor (Email)</Text>
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
            <Text style={styles.label}>Creditor (Email)</Text>
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
              onPress={handleUpdate}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Updating...' : 'Save Changes'}
              </Text>
            </TouchableOpacity>
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
  label: { fontSize: 13, color: Theme.colors.textSecondary, marginBottom: 8, marginTop: 16, fontWeight: '600', textTransform: 'uppercase' },
  input: { backgroundColor: Theme.colors.surface, borderRadius: 16, padding: 16, color: Theme.colors.text, fontSize: 16, borderWidth: 1, borderColor: Theme.colors.border },
  submitButton: { backgroundColor: Theme.colors.primary, borderRadius: Theme.borderRadius.lg, padding: 18, alignItems: 'center', marginTop: 32, marginBottom: 16 },
  submitButtonText: { color: Theme.colors.white, fontSize: 18, fontWeight: '800' }
});

export default EditDebtModal;
