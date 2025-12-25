"use client"

import { useState } from "react"

interface FAQItem {
  question: string
  answer: string
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "What is your return policy?",
    answer: "Sorry, no return, only exchange.",
  },
  {
    question: "How long does local delivery take?",
    answer:
      "Local deliveries typically take 2-5 business days. You will receive an email confirmation with your expected delivery date.",
  },
  {
    question: "Can I exchange an item?",
    answer: "Yes! We offer exchange within 3 days from receiving the order.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept Instapay, Telda, and cash, after paying please send screenshot on WhatsApp to confirm your order, All transactions are secure.",
  },
]

export function FAQSection() {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)

  return (
    <section className="mb-24">
      <h2 className="text-4xl md:text-5xl font-light mb-12 text-pretty">Frequently Asked Questions</h2>
      <div className="space-y-4 max-w-3xl">
        {FAQ_ITEMS.map((item, idx) => (
          <div key={idx} className="border border-border rounded-lg">
            <button
              onClick={() => setExpandedFAQ(expandedFAQ === idx ? null : idx)}
              className="w-full px-6 py-4 text-left font-medium hover:bg-muted transition flex items-center justify-between"
            >
              <span>{item.question}</span>
              <span className={`transition ${expandedFAQ === idx ? "rotate-180" : ""}`}>▼</span>
            </button>
            {expandedFAQ === idx && (
              <div className="px-6 py-4 bg-muted/30 border-t border-border">
                <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
