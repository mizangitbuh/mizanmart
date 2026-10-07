import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'

// ── Bengali + Latin font (jsDelivr CDN, runtime-fetch, cached) ──
Font.register({
  family: 'NotoBangla',
  fonts: [
    {
      src: 'https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@main/hinted/ttf/NotoSansBengali/NotoSansBengali-Regular.ttf',
    },
    {
      src: 'https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@main/hinted/ttf/NotoSansBengali/NotoSansBengali-Bold.ttf',
      fontWeight: 'bold',
    },
  ],
})

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 10,
    fontFamily: 'NotoBangla',
    color: '#1a1a1a',
    lineHeight: 1.4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 14,
    borderBottomWidth: 2,
    borderBottomColor: '#991b1b',
  },
  brand: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#991b1b',
    letterSpacing: 0.5,
  },
  brandSub: { fontSize: 9, color: '#666', marginTop: 2 },
  address: { fontSize: 8.5, color: '#666', marginTop: 2 },
  invoiceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
    letterSpacing: 2,
  },
  invoiceNumber: {
    fontSize: 9,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  infoRow: { flexDirection: 'row', marginBottom: 18, gap: 8 },
  infoBox: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 4,
  },
  infoLabel: {
    fontSize: 8,
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
    fontWeight: 'bold',
  },
  infoText: { fontSize: 9.5, marginBottom: 2 },
  table: { marginTop: 6, marginBottom: 14 },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    fontSize: 8.5,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#666',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    fontSize: 9.5,
  },
  colProduct: { flex: 4 },
  colQty: { flex: 1, textAlign: 'center' },
  colPrice: { flex: 1.5, textAlign: 'right' },
  colSubtotal: { flex: 1.5, textAlign: 'right', fontWeight: 'bold' },
  totalsBlock: { alignSelf: 'flex-end', width: '55%', marginTop: 6 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    fontSize: 10,
  },
  totalRowLabel: { color: '#666' },
  totalRowValue: { color: '#1a1a1a' },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginTop: 4,
    borderTopWidth: 1.5,
    borderTopColor: '#991b1b',
    fontSize: 13,
    fontWeight: 'bold',
    color: '#991b1b',
  },
  refundBlock: {
    marginTop: 14,
    padding: 10,
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#f59e0b',
    borderRadius: 4,
  },
  refundTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#c2410c',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  refundText: { fontSize: 9.5, color: '#78350f', marginBottom: 2 },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 32,
    right: 32,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    fontSize: 8.5,
    color: '#999',
    textAlign: 'center',
  },
})

const REASON_LABELS: Record<string, string> = {
  customer_return: 'Customer return',
  damaged: 'Damaged product',
  wrong_item: 'Wrong item sent',
  not_delivered: 'Not delivered',
  other: 'Other',
}

function formatPrice(n: number): string {
  return 'BDT ' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface Props {
  order: any
}

export function InvoiceDocument({ order }: Props) {
  const items = order.order_items || []
  const subtotal = Number(order.subtotal || 0)
  const shipping = Number(order.shipping_cost || 0)
  const discount = Number(order.discount || 0)
  const total = Number(order.total || 0)
  const refunded = Number(order.refund_amount || 0)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>MIZANMART</Text>
            <Text style={styles.brandSub}>Mizan Mart</Text>
            <Text style={styles.address}>Bangladesh</Text>
            <Text style={styles.address}>support@mizanmart.com</Text>
          </View>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>#{order.order_number}</Text>
            <Text style={styles.invoiceNumber}>{formatDate(order.created_at)}</Text>
          </View>
        </View>

        {/* Bill To / Ship To / Payment */}
        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Bill To</Text>
            <Text style={styles.infoText}>{order.customer_name || '-'}</Text>
            <Text style={styles.infoText}>{order.customer_phone || '-'}</Text>
            {order.customer_email ? (
              <Text style={styles.infoText}>{order.customer_email}</Text>
            ) : null}
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Ship To</Text>
            <Text style={styles.infoText}>{order.customer_name || '-'}</Text>
            <Text style={styles.infoText}>
              {order.shipping_address?.address || '-'}
            </Text>
            <Text style={styles.infoText}>
              {order.shipping_address?.city || ''}
            </Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Payment</Text>
            <Text style={styles.infoText}>
              {(order.payment_method || 'cod').toUpperCase()}
            </Text>
            <Text style={styles.infoText}>
              Status: {(order.payment_status || 'pending').toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colProduct}>Product</Text>
            <Text style={styles.colQty}>Qty</Text>
            <Text style={styles.colPrice}>Price</Text>
            <Text style={styles.colSubtotal}>Subtotal</Text>
          </View>
          {items.map((item: any, i: number) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.colProduct}>{item.product_name}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>{formatPrice(item.price)}</Text>
              <Text style={styles.colSubtotal}>{formatPrice(item.subtotal)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsBlock}>
          <View style={styles.totalRow}>
            <Text style={styles.totalRowLabel}>Subtotal</Text>
            <Text style={styles.totalRowValue}>{formatPrice(subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalRowLabel}>Shipping</Text>
            <Text style={styles.totalRowValue}>{formatPrice(shipping)}</Text>
          </View>
          {discount > 0 ? (
            <View style={styles.totalRow}>
              <Text style={styles.totalRowLabel}>
                Discount{order.coupon_code ? ` (${order.coupon_code})` : ''}
              </Text>
              <Text style={styles.totalRowValue}>- {formatPrice(discount)}</Text>
            </View>
          ) : null}
          <View style={styles.grandTotalRow}>
            <Text>Total</Text>
            <Text>{formatPrice(total)}</Text>
          </View>
        </View>

        {/* Refund Info */}
        {refunded > 0 ? (
          <View style={styles.refundBlock}>
            <Text style={styles.refundTitle}>Refund Info</Text>
            <Text style={styles.refundText}>
              Refunded: {formatPrice(refunded)} of {formatPrice(total)}
              {order.refund_reason
                ? ` - ${REASON_LABELS[order.refund_reason] || order.refund_reason}`
                : ''}
            </Text>
            {order.refunded_at ? (
              <Text style={styles.refundText}>
                On {formatDate(order.refunded_at)}
              </Text>
            ) : null}
          </View>
        ) : null}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>Thank you for shopping with MizanMart!</Text>
          <Text>This is a computer-generated invoice. No signature required.</Text>
        </View>
      </Page>
    </Document>
  )
}
