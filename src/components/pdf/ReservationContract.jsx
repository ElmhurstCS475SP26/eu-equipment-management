import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { EQUIPMENT_POLICIES } from '../../lib/constants';

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottom: 1,
    borderBottomColor: '#EEE',
    paddingBottom: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    textTransform: 'uppercase',
    color: '#2563eb',
  },
  row: {
    flexDirection: 'row',
    borderBottom: 0.5,
    borderBottomColor: '#EEE',
    paddingVertical: 8,
  },
  label: {
    width: 120,
    fontWeight: 'bold',
    color: '#666',
  },
  value: {
    flex: 1,
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    padding: 8,
    borderBottom: 1,
    borderBottomColor: '#e2e8f0',
    fontWeight: 'bold',
  },
  tableCell: {
    padding: 8,
    flex: 1,
  },
  policySection: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
  },
  policyTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  policyText: {
    fontSize: 9,
    lineHeight: 1.4,
    color: '#475569',
    marginBottom: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 8,
    borderTop: 0.5,
    borderTopColor: '#EEE',
    paddingTop: 10,
  }
});

export const ReservationContract = ({ reservation, items, user }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Equipment Contract</Text>
          <Text style={{ color: '#666' }}>ID: {reservation.bookingId || `RES-${reservation.id}`}</Text>
        </View>
        <View style={{ textAlign: 'right' }}>
          <Text style={{ fontWeight: 'bold' }}>Elmhurst University</Text>
          <Text>Digital Media Checkout</Text>
        </View>
      </View>

      {/* Reservation Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reservation Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Student Name:</Text>
          <Text style={styles.value}>{user.name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Student ID:</Text>
          <Text style={styles.value}>{reservation.studentId || 'N/A'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Pickup Date:</Text>
          <Text style={styles.value}>{new Date(reservation.startDate).toLocaleString()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Return Date:</Text>
          <Text style={styles.value}>{new Date(reservation.endDate).toLocaleString()}</Text>
        </View>
      </View>

      {/* Items Table */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reserved Equipment</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, { flex: 2 }]}>Item</Text>
            <Text style={styles.tableCell}>Brand/Model</Text>
            <Text style={styles.tableCell}>Code</Text>
          </View>
          {items.map((item, idx) => (
            <View key={idx} style={styles.row}>
              <Text style={[styles.tableCell, { flex: 2 }]}>{item.name}</Text>
              <Text style={styles.tableCell}>{item.brand} {item.model}</Text>
              <Text style={styles.tableCell}>{item.externalId || item.barcode || 'N/A'}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Policies */}
      <View style={styles.policySection}>
        <Text style={[styles.sectionTitle, { color: '#1a1a1a', fontSize: 12 }]}>Terms & Conditions</Text>
        {EQUIPMENT_POLICIES.map((policy, idx) => (
          <View key={idx} style={{ marginBottom: 10 }}>
            <Text style={styles.policyTitle}>{policy.title}</Text>
            {policy.rules ? (
              policy.rules.map((rule, ridx) => (
                <Text key={ridx} style={styles.policyText}>• {rule}</Text>
              ))
            ) : (
              <Text style={styles.policyText}>{policy.content}</Text>
            )}
          </View>
        ))}
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        Elmhurst University Digital Media Department.
      </Text>
    </Page>
  </Document>
);
