import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface Props {
  params: Promise<{ orderNumber: string }>
}

export default async function OrderSuccessPage({ params }: Props) {
  const { orderNumber } = await params

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={48} className="text-green-600" />
      </div>

      <h1 className="text-3xl font-bold mb-3">Order Confirmed!</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-2">Thank you for your order.</p>
      <p className="text-sm text-gray-500 mb-8">
        Order Number: <span className="font-mono font-bold text-blue-600">{orderNumber}</span>
      </p>

      <div className="p-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 mb-8 text-left">
        <h2 className="font-bold mb-2">What happens next?</h2>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
          <li>✓ We&apos;ll call you to confirm the order</li>
          <li>✓ Delivery within 2-3 business days</li>
          <li>✓ Pay cash when you receive</li>
        </ul>
      </div>

      <div className="flex gap-3 justify-center">
        <Link href="/products"><Button>Continue Shopping</Button></Link>
        <Link href="/orders"><Button variant="outline">View My Orders</Button></Link>
      </div>
    </div>
  )
}
