import { UnsubscribeClient } from '@/components/home/UnsubscribeClient'

interface Props {
  params: Promise<{ token: string }>
}

export default async function UnsubscribePage({ params }: Props) {
  const { token } = await params
  return <UnsubscribeClient token={token} />
}
