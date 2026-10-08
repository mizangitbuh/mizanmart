'use client'

import { useState } from 'react'
import { HelpCircle, MessageSquare, ThumbsUp, Send, CheckCircle } from 'lucide-react'

interface QAItem {
  id: string
  question: string
  asker: string
  date: string
  answer: string
  answeredBy: string
  votes: number
}

const DEFAULT_QA: QAItem[] = [
  {
    id: '1',
    question: 'পণ্যটি কি ১০০% অরিজিনাল এবং ইনট্যাক্ট প্যাকেট?',
    asker: 'তানভীর আহমেদ',
    date: '২ দিন আগে',
    answer: 'জি, Martivo-এর প্রতিটি পণ্য ১০০% অরিজিনাল এবং ব্র্যান্ডের ইনট্যাক্ট সিল করা প্যাকেট সহ সরবরাহ করা হয়।',
    answeredBy: 'Martivo Official Support',
    votes: 18,
  },
  {
    id: '2',
    question: 'পণ্য হাতে পেয়ে কি চেক করে টাকা দেওয়া যাবে (COD)?',
    asker: 'রাকিবুল হাসান',
    date: '১ সপ্তাহ আগে',
    answer: 'অবশ্যই! আমাদের ডেলিভারি ম্যানের সামনে প্যাকেট চেক করে ক্যাশ অন ডেলিভারি (COD) পেমেন্ট করতে পারবেন।',
    answeredBy: 'Martivo Official Support',
    votes: 24,
  },
  {
    id: '3',
    question: 'পণ্যটিতে কোনো ডিফেক্ট বা সমস্যা থাকলে কি রিপ্লেসমেন্ট পাব?',
    asker: 'মাহমুদুল হক',
    date: '৩ দিন আগে',
    answer: 'জি, ডেলিভারি পাওয়ার পর পণ্যটিতে কোনো সমস্যা থাকলে ৭ দিনের মধ্যে আমাদের সেন্ট্রাল ওয়্যারহাউস থেকে সম্পূর্ণ ফ্রি রিপ্লেসমেন্ট পাবেন।',
    answeredBy: 'Martivo Official Support',
    votes: 19,
  },
]

export function ProductQA({ productName }: { productName: string }) {
  const [qaList, setQaList] = useState<QAItem[]>(DEFAULT_QA)
  const [newQuestion, setNewQuestion] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [votedIds, setVotedIds] = useState<string[]>([])

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newQuestion.trim()) return

    const newItem: QAItem = {
      id: Date.now().toString(),
      question: newQuestion,
      asker: 'আপনি (ইউজার)',
      date: 'এইমাত্র',
      answer: 'আপনার প্রশ্নটি গৃহীত হয়েছে। আমাদের সাপোর্ট টিম খুব শীঘ্রই উত্তর প্রদান করবে।',
      answeredBy: 'Martivo Support (অপেক্ষমাণ)',
      votes: 1,
    }

    setQaList([newItem, ...qaList])
    setNewQuestion('')
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  const handleUpvote = (id: string) => {
    if (votedIds.includes(id)) return
    setVotedIds([...votedIds, id])
    setQaList(
      qaList.map((item) => (item.id === id ? { ...item, votes: item.votes + 1 } : item))
    )
  }

  return (
    <div
      className="p-5 sm:p-6 rounded-[var(--radius-lg)] border mt-8"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <HelpCircle size={20} style={{ color: 'var(--color-primary)' }} />
        <div>
          <h2 className="text-base sm:text-lg font-black" style={{ color: 'var(--color-text)' }}>
            Customer Questions & Answers (প্রশ্নোত্তর)
          </h2>
          <p className="text-xs text-gray-500">
            {productName} সম্পর্কে যেকোনো প্রশ্ন করুন অথবা অন্যদের প্রশ্নের উত্তর দেখুন
          </p>
        </div>
      </div>

      {/* Ask Question Box */}
      <form onSubmit={handleAsk} className="mb-6">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="পণ্য সম্পর্কে আপনার প্রশ্নটি এখানে লিখুন..."
            className="flex-1 px-4 py-2.5 rounded-[var(--radius-md)] border text-xs focus:outline-none focus:border-[var(--color-primary)]"
            style={{ background: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-[var(--radius-md)] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all hover:opacity-90"
            style={{ background: 'var(--color-primary)' }}
          >
            <Send size={13} /> প্রশ্ন পাঠান
          </button>
        </div>
        {submitted && (
          <div className="mt-2 text-xs font-bold text-emerald-600 flex items-center gap-1">
            <CheckCircle size={14} /> ধন্যবাদ! আপনার প্রশ্নটি সফলভাবে জমা দেওয়া হয়েছে।
          </div>
        )}
      </form>

      {/* Q&A List */}
      <div className="space-y-4 divide-y divide-gray-100">
        {qaList.map((qa) => (
          <div key={qa.id} className="pt-4 first:pt-0">
            {/* Question */}
            <div className="flex items-start gap-2.5 mb-2">
              <span className="font-black text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700 flex-shrink-0">
                Q
              </span>
              <div className="flex-1">
                <span className="font-bold text-xs sm:text-sm text-[var(--color-text)]">
                  {qa.question}
                </span>
                <span className="text-[10px] text-gray-400 ml-2">({qa.asker} — {qa.date})</span>
              </div>
            </div>

            {/* Answer */}
            <div className="flex items-start gap-2.5 pl-6">
              <span className="font-black text-xs px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 flex-shrink-0">
                A
              </span>
              <div className="flex-1 text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                <p>{qa.answer}</p>
                <div className="flex items-center justify-between mt-2 pt-1">
                  <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                    ✓ {qa.answeredBy}
                  </span>
                  <button
                    onClick={() => handleUpvote(qa.id)}
                    className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border transition-colors ${
                      votedIds.includes(qa.id)
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'text-gray-500 hover:border-gray-400'
                    }`}
                  >
                    <ThumbsUp size={11} /> সহায়ক ({qa.votes})
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
