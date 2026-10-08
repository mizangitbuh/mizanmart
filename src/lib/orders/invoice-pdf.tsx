import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from '@react-pdf/renderer'

// ── Bengali + Latin font (jsDelivr CDN, runtime-fetch) ──
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

const PRIMARY = '#991b1b'
const PRIMARY_LIGHT = '#fee2e2'
const TEXT = '#1a1a1a'
const TEXT_MUTED = '#6b7280'
const BORDER = '#e5e7eb'
const BG_LIGHT = '#f9fafb'
const GREEN = '#16a34a'
const GREEN_BG = '#dcfce7'
const AMBER = '#d97706'
const AMBER_BG = '#fef3c7'
const RED = '#dc2626'
const RED_BG = '#fee2e2'

const styles = StyleSheet.create({
  page: {
    padding: 28,
    paddingBottom: 90,
    fontSize: 9,
    fontFamily: 'NotoBangla',
    color: TEXT,
    lineHeight: 1.4,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 14,
    marginBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: PRIMARY,
  },
  brandBlock: { flex: 1 },
  brandRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  brandBox: {
    width: 28,
    height: 28,
    borderRadius: 4,
    backgroundColor: PRIMARY,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandBoxText: { color: 'white', fontSize: 15, fontWeight: 'bold' },
  brandName: { fontSize: 22, fontWeight: 'bold', color: PRIMARY, letterSpacing: 0.5 },
  brandSub: { fontSize: 8.5, color: TEXT_MUTED, marginTop: 2, marginLeft: 36 },
  contactBlock: { alignItems: 'flex-end' },
  contactLine: { fontSize: 8.5, color: TEXT_MUTED, marginBottom: 2 },
  contactBold: { color: PRIMARY, fontWeight: 'bold' },

  // ── Title + Meta ──
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  invoiceLabel: { fontSize: 32, fontWeight: 'bold', color: TEXT, letterSpacing: 1, marginBottom: 8, lineHeight: 1.1 },
  invoiceSubtext: { fontSize: 9, color: TEXT_MUTED, marginBottom: 1 },
  metaBox: {
    width: 240,
    padding: 10,
    backgroundColor: BG_LIGHT,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 6,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  metaLabel: { fontSize: 8.5, color: TEXT_MUTED },
  metaValue: { fontSize: 9, color: TEXT, fontWeight: 'bold' },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  statusBadgeText: { fontSize: 8, fontWeight: 'bold' },

  // ── Address blocks ──
  addrRow: { flexDirection: 'row', marginBottom: 16 },
  addrBlock: { flex: 1, paddingRight: 8 },
  addrBlockRight: { flex: 1, paddingLeft: 8 },
  addrHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  addrIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: PRIMARY_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  addrIconText: { fontSize: 8, color: PRIMARY, fontWeight: 'bold' },
  addrHeaderText: { fontSize: 10, fontWeight: 'bold', color: TEXT },
  addrName: { fontSize: 9.5, fontWeight: 'bold', color: TEXT, marginBottom: 2 },
  addrText: { fontSize: 8.5, color: TEXT_MUTED, marginBottom: 1 },

  // ── Product table ──
  table: { marginBottom: 12 },
  thead: {
    flexDirection: 'row',
    backgroundColor: PRIMARY,
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  theadText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  trow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    alignItems: 'center',
  },
  colNum: { width: 24, fontSize: 9, color: TEXT_MUTED },
  colProduct: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  productImage: {
    width: 36,
    height: 36,
    borderRadius: 4,
    marginRight: 8,
    backgroundColor: BG_LIGHT,
  },
  productInfo: { flex: 1, paddingRight: 6 },
  productName: { fontSize: 9.5, fontWeight: 'bold', color: TEXT },
  colQty: { width: 36, textAlign: 'center', fontSize: 9, color: TEXT },
  colPrice: { width: 68, textAlign: 'right', fontSize: 9, color: TEXT },
  colTotal: { width: 76, textAlign: 'right', fontSize: 9.5, fontWeight: 'bold', color: TEXT },

  // ── Totals ──
  totalsWrap: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 16 },
  totalsBox: { width: 250 },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    fontSize: 9.5,
  },
  totalsLabel: { color: TEXT_MUTED },
  totalsValue: { color: TEXT, fontWeight: 'bold' },
  grandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginTop: 4,
    borderRadius: 3,
    backgroundColor: PRIMARY_LIGHT,
  },
  grandLabel: { fontSize: 12, fontWeight: 'bold', color: PRIMARY },
  grandValue: { fontSize: 12, fontWeight: 'bold', color: PRIMARY },

  // ── Payment + QR ──
  bottomRow: { flexDirection: 'row', marginBottom: 16 },
  payBox: {
    flex: 1,
    padding: 11,
    backgroundColor: BG_LIGHT,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 6,
    marginRight: 8,
  },
  qrBox: {
    width: 240,
    padding: 11,
    backgroundColor: BG_LIGHT,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  boxHeader: { fontSize: 10, fontWeight: 'bold', color: TEXT, marginBottom: 7 },
  payRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8.5,
    marginBottom: 4,
  },
  payLabel: { color: TEXT_MUTED },
  payValue: { color: TEXT, fontWeight: 'bold' },
  paidBadge: {
    marginTop: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 3,
    backgroundColor: GREEN_BG,
    alignSelf: 'flex-start',
  },
  paidBadgeText: { fontSize: 8, color: GREEN, fontWeight: 'bold' },
  qrImage: { width: 80, height: 80 },
  qrRight: { flex: 1, paddingLeft: 10, justifyContent: 'center' },
  qrTitle: { fontSize: 9.5, fontWeight: 'bold', color: TEXT, marginBottom: 3 },
  qrText: { fontSize: 8, color: TEXT_MUTED },

  // ── Footer ──
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 28,
    right: 28,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  trustRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  trustItem: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  trustIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: PRIMARY_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  trustIconText: { fontSize: 9, color: PRIMARY, fontWeight: 'bold' },
  trustText: { fontSize: 8, color: TEXT, fontWeight: 'bold' },
  trustSub: { fontSize: 7, color: TEXT_MUTED },
  thankYou: { alignItems: 'flex-end' },
  thankyouLabel: { fontSize: 13, color: PRIMARY, fontWeight: 'bold' },
  thankyouName: { fontSize: 8.5, color: TEXT_MUTED, marginTop: 1 },
})

interface Props {
  order: any
  productImages?: Record<string, string | null>
  qrDataUrl?: string
}

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
  if (!iso) return '-'
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDateShort(iso: string): string {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function InvoiceDocument({ order, productImages = {}, qrDataUrl }: Props) {
  const items = order.order_items || []
  const subtotal = Number(order.subtotal || 0)
  const shipping = Number(order.shipping_cost || 0)
  const discount = Number(order.discount || 0)
  const total = Number(order.total || 0)
  const refunded = Number(order.refund_amount || 0)

  const status = order.payment_status || 'pending'
  const statusLabel =
    status === 'paid' ? 'PAID' :
    status === 'refunded' ? 'REFUNDED' :
    status === 'failed' ? 'FAILED' : 'PENDING'
  const statusColor =
    status === 'paid' ? GREEN :
    status === 'refunded' || status === 'failed' ? RED : AMBER
  const statusBg =
    status === 'paid' ? GREEN_BG :
    status === 'refunded' || status === 'failed' ? RED_BG : AMBER_BG

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.brandBlock}>
            <View style={styles.brandRow}>
              <View style={styles.brandBox}>
                <Text style={styles.brandBoxText}>M</Text>
              </View>
              <Text style={styles.brandName}>MIZANMART</Text>
            </View>
            <Text style={styles.brandSub}>Quality products. Better prices. Easy delivery.</Text>
          </View>
          <View style={styles.contactBlock}>
            <Text style={styles.contactLine}>
              <Text style={styles.contactBold}>www.mizanmart.com</Text>
            </Text>
            <Text style={styles.contactLine}>support@mizanmart.com</Text>
            <Text style={styles.contactLine}>+880 1700 000000</Text>
            <Text style={styles.contactLine}>Dhaka, Bangladesh</Text>
          </View>
        </View>

        {/* TITLE + META */}
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.invoiceLabel}>INVOICE</Text>
            <Text style={styles.invoiceSubtext}>Thank you for shopping with MizanMart!</Text>
            <Text style={styles.invoiceSubtext}>Here is your order summary and payment details.</Text>
          </View>
          <View style={styles.metaBox}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Order No</Text>
              <Text style={styles.metaValue}>#{order.order_number}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Order Date</Text>
              <Text style={styles.metaValue}>{formatDateShort(order.created_at)}</Text>
            </View>
            <View style={[styles.metaRow, { marginBottom: 0 }]}>
              <Text style={styles.metaLabel}>Payment Status</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                  {statusLabel}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* BILLING / SHIPPING */}
        <View style={styles.addrRow}>
          <View style={styles.addrBlock}>
            <View style={styles.addrHeader}>
              <View style={styles.addrIcon}>
                <Text style={styles.addrIconText}>B</Text>
              </View>
              <Text style={styles.addrHeaderText}>Billing Address</Text>
            </View>
            <Text style={styles.addrName}>{order.customer_name || '-'}</Text>
            <Text style={styles.addrText}>{order.customer_phone || '-'}</Text>
            {order.customer_email ? (
              <Text style={styles.addrText}>{order.customer_email}</Text>
            ) : null}
            <Text style={styles.addrText}>{order.shipping_address?.address || '-'}</Text>
            <Text style={styles.addrText}>{order.shipping_address?.city || ''}</Text>
          </View>
          <View style={styles.addrBlockRight}>
            <View style={styles.addrHeader}>
              <View style={styles.addrIcon}>
                <Text style={styles.addrIconText}>S</Text>
              </View>
              <Text style={styles.addrHeaderText}>Shipping Address</Text>
            </View>
            <Text style={styles.addrName}>{order.customer_name || '-'}</Text>
            <Text style={styles.addrText}>{order.customer_phone || '-'}</Text>
            <Text style={styles.addrText}>{order.shipping_address?.address || '-'}</Text>
            <Text style={styles.addrText}>{order.shipping_address?.city || ''}</Text>
          </View>
        </View>

        {/* PRODUCT TABLE */}
        <View style={styles.table}>
          <View style={styles.thead}>
            <Text style={[styles.theadText, { width: 24 }]}>#</Text>
            <Text style={[styles.theadText, { flex: 1 }]}>Product</Text>
            <Text style={[styles.theadText, { width: 36, textAlign: 'center' }]}>Qty</Text>
            <Text style={[styles.theadText, { width: 68, textAlign: 'right' }]}>Unit Price</Text>
            <Text style={[styles.theadText, { width: 76, textAlign: 'right' }]}>Total</Text>
          </View>
          {items.map((item: any, i: number) => {
            const imgUrl = productImages[item.product_id]
            return (
              <View key={i} style={styles.trow} wrap={false}>
                <Text style={styles.colNum}>{i + 1}</Text>
                <View style={styles.colProduct}>
                  {imgUrl ? (
                    <Image src={imgUrl} style={styles.productImage} />
                  ) : (
                    <View style={styles.productImage} />
                  )}
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{item.product_name}</Text>
                  </View>
                </View>
                <Text style={styles.colQty}>{item.quantity}</Text>
                <Text style={styles.colPrice}>{formatPrice(item.price)}</Text>
                <Text style={styles.colTotal}>{formatPrice(item.subtotal)}</Text>
              </View>
            )
          })}
        </View>

        {/* TOTALS */}
        <View style={styles.totalsWrap}>
          <View style={styles.totalsBox}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Subtotal</Text>
              <Text style={styles.totalsValue}>{formatPrice(subtotal)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Shipping Charge</Text>
              <Text style={styles.totalsValue}>
                {shipping === 0 ? 'FREE' : formatPrice(shipping)}
              </Text>
            </View>
            {discount > 0 ? (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>
                  Discount{order.coupon_code ? ` (${order.coupon_code})` : ''}
                </Text>
                <Text style={[styles.totalsValue, { color: GREEN }]}>
                  - {formatPrice(discount)}
                </Text>
              </View>
            ) : null}
            <View style={styles.grandRow}>
              <Text style={styles.grandLabel}>Total Paid</Text>
              <Text style={styles.grandValue}>{formatPrice(total)}</Text>
            </View>
          </View>
        </View>

        {/* PAYMENT + QR */}
        <View style={styles.bottomRow}>
          <View style={styles.payBox}>
            <Text style={styles.boxHeader}>Payment Details</Text>
            <View style={styles.payRow}>
              <Text style={styles.payLabel}>Method</Text>
              <Text style={styles.payValue}>
                {(order.payment_method || 'cod').toUpperCase()}
              </Text>
            </View>
            <View style={styles.payRow}>
              <Text style={styles.payLabel}>Order Amount</Text>
              <Text style={styles.payValue}>{formatPrice(total)}</Text>
            </View>
            <View style={styles.payRow}>
              <Text style={styles.payLabel}>Order Date</Text>
              <Text style={styles.payValue}>{formatDate(order.created_at)}</Text>
            </View>
            {refunded > 0 ? (
              <View style={styles.payRow}>
                <Text style={styles.payLabel}>Refunded</Text>
                <Text style={[styles.payValue, { color: RED }]}>
                  - {formatPrice(refunded)}
                  {order.refund_reason
                    ? ` (${REASON_LABELS[order.refund_reason] || order.refund_reason})`
                    : ''}
                </Text>
              </View>
            ) : null}
            {status === 'paid' ? (
              <View style={styles.paidBadge}>
                <Text style={styles.paidBadgeText}>Payment Confirmed</Text>
              </View>
            ) : null}
          </View>

          {qrDataUrl ? (
            <View style={styles.qrBox}>
              <Image src={qrDataUrl} style={styles.qrImage} />
              <View style={styles.qrRight}>
                <Text style={styles.qrTitle}>Scan to Track</Text>
                <Text style={styles.qrText}>
                  Scan this QR code to view your order status online.
                </Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* FOOTER */}
        <View style={styles.footer} fixed>
          <View style={styles.trustRow}>
            <View style={styles.trustItem}>
              <View style={styles.trustIcon}>
                <Text style={styles.trustIconText}>D</Text>
              </View>
              <View>
                <Text style={styles.trustText}>Fast Delivery</Text>
                <Text style={styles.trustSub}>Across Bangladesh</Text>
              </View>
            </View>
            <View style={styles.trustItem}>
              <View style={styles.trustIcon}>
                <Text style={styles.trustIconText}>S</Text>
              </View>
              <View>
                <Text style={styles.trustText}>Secure Payment</Text>
                <Text style={styles.trustSub}>100% Safe</Text>
              </View>
            </View>
            <View style={styles.trustItem}>
              <View style={styles.trustIcon}>
                <Text style={styles.trustIconText}>24</Text>
              </View>
              <View>
                <Text style={styles.trustText}>24/7 Support</Text>
                <Text style={styles.trustSub}>We are here to help</Text>
              </View>
            </View>
          </View>
          <View style={styles.thankYou}>
            <Text style={styles.thankyouLabel}>Thank You!</Text>
            <Text style={styles.thankyouName}>MizanMart Team</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
