import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Theme } from '../theme/Theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const TransactionCard = ({ transaction, onDelete, onEdit }) => {
  const debtorName = transaction.debtor.name;
  const creditorName = transaction.creditor.name;
  const amount = transaction.amount;

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => onEdit && onEdit(transaction)}
      onLongPress={() => onDelete && onDelete(transaction.id)}
    >
      <View style={[styles.iconContainer, { backgroundColor: Theme.colors.surface }]}>
        <MaterialCommunityIcons name="swap-horizontal" size={24} color={Theme.colors.primary} />
      </View>
      
      <View style={styles.details}>
        <Text style={styles.name}>{debtorName}</Text>
        <Text style={styles.owesText}>owes {creditorName}</Text>
      </View>

      <View style={styles.amountContainer}>
        <Text style={styles.amount}>
           ₹{parseFloat(amount).toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: Theme.colors.surface, padding: Theme.spacing.md, borderRadius: Theme.borderRadius.lg, flexDirection: 'row', alignItems: 'center', marginBottom: Theme.spacing.md, borderWidth: 1, borderColor: Theme.colors.border },
  iconContainer: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: Theme.colors.background, borderWidth: 1, borderColor: Theme.colors.border },
  details: { flex: 1, marginLeft: Theme.spacing.md },
  name: { fontSize: 16, fontWeight: '800', color: Theme.colors.text },
  owesText: { fontSize: 12, color: Theme.colors.textSecondary, marginTop: 2 },
  amountContainer: { alignItems: 'flex-end' },
  amount: { fontSize: 18, fontWeight: '900', color: Theme.colors.text },
});

export default TransactionCard;
