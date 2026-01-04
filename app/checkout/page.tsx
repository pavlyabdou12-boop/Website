"use client"

import { Suspense, useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { useCart } from "@/hooks/use-cart"
import { CheckCircle2, ChevronRight } from "lucide-react"

const EGYPTIAN_CITIES = [
  "Cairo",
  "Giza",
  "Alexandria",
  "Aswan",
  "Asyut",
  "Beheira",
  "Beni Suef",
  "Dakahlia",
  "Damietta",
  "Faiyum",
  "Gharbia",
  "Ismailia",
  "Kafr El Sheikh",
  "Luxor",
  "Matruh",
  "Minya",
  "Monufia",
  "New Valley",
  "North Sinai",
  "Port Said",
  "Qalyubia",
  "Qena",
  "Red Sea",
  "Sharqia",
  "Sohag",
  "South Sinai",
  "Suez",
].sort()

type CheckoutStep = "contact" | "address" | "payment" | "confirmation"
type ShippingRegion = "cairo-giza" | "other"
type PaymentMethod = "instapay" | "cod"

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  street: string
  building: string
  apartment: string
  city: string
  postalCode: string
  deliveryNotes: string
}

interface OrderSummary {
  subtotal: number
  shipping: number
  total: number
  shippingRegion: ShippingRegion
  paymentMethod: PaymentMethod
  promoCode?: string
  discount?: number
  orderNumber: string
}

const ACTIVE_PROMO_CODE = "SISIES10"
const ACTIVE_PROMO_DISCOUNT = 0.1

const generateOrderNumber = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

const sendConfirmationEmail = async (email: string, firstName: string, orderNumber: string, orderData: any) => {
  try {
    const response = await fetch("/api/send-confirmation-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, firstName, orderNumber, orderData }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("[v0] Email send failed (non-blocking):", errorData)
      // Email failure shouldn't prevent order completion
    } else {
      console.log("[v0] ✅ Confirmation email sent successfully")
    }
  } catch (error) {
    console.error("[v0] Error sending confirmation email (non-blocking):", error)
    // Email errors shouldn't prevent order from completing
  }
}

function HeaderSkeleton() {
  return <div className="h-20 bg-muted animate-pulse" />
}

function FooterSkeleton() {
  return <div className="h-48 bg-muted animate-pulse" />
}

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, getTotalPrice, clearCart, isLoaded } = useCart()

  const [step, setStep] = useState<CheckoutStep>("contact")
  const checkoutFormRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    street: "",
    building: "",
    apartment: "",
    city: "",
    postalCode: "",
    deliveryNotes: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [shippingRegion, setShippingRegion] = useState<ShippingRegion>("cairo-giza")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)

  const [subscribeOffers, setSubscribeOffers] = useState(false)
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null)

  const [promoInput, setPromoInput] = useState("")
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null)
  const [promoError, setPromoError] = useState("")

  // ✅ أهم Fix: ما تعملش redirect قبل hydration
  useEffect(() => {
    if (!isLoaded) return
    if (cart.length === 0 && step !== "confirmation") router.replace("/cart")
  }, [cart.length, isLoaded, router, step])

  const shippingCost = shippingRegion === "cairo-giza" ? 70 : 90
  const baseSubtotal = orderSummary?.subtotal ?? getTotalPrice()
  const effectiveDiscount = orderSummary?.discount ?? promoDiscount
  const subtotalAfterDiscount = Math.max(0, baseSubtotal - effectiveDiscount)
  const effectiveShipping = orderSummary?.shipping ?? (baseSubtotal >= 2500 ? 0 : shippingCost)
  const effectiveTotal = orderSummary?.total ?? subtotalAfterDiscount + effectiveShipping

  const validateStep = (currentStep: CheckoutStep): boolean => {
    const newErrors: Record<string, string> = {}

    if (currentStep === "contact") {
      if (!formData.firstName) newErrors.firstName = "First name is required"
      if (!formData.lastName) newErrors.lastName = "Last name is required"
      if (!formData.email) newErrors.email = "Email is required"
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email"
      if (!formData.phone) newErrors.phone = "Phone number is required"
      if (!/^01\d{8,9}$/.test(formData.phone.replace(/\s/g, ""))) newErrors.phone = "Invalid Egyptian mobile number"
    } else if (currentStep === "address") {
      if (!formData.street) newErrors.street = "Street address is required"
      if (!formData.building) newErrors.building = "Building/House number is required"
      if (!formData.city) newErrors.city = "City is required"
    } else if (currentStep === "payment") {
      if (!paymentMethod) newErrors.paymentMethod = "Please select a payment method"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase()
    setPromoError("")

    if (!code) {
      setPromoDiscount(0)
      setAppliedPromo(null)
      return
    }

    if (code === ACTIVE_PROMO_CODE) {
      const subtotal = getTotalPrice()
      const discountAmount = Math.min(subtotal * ACTIVE_PROMO_DISCOUNT, subtotal)
      setPromoDiscount(discountAmount)
      setAppliedPromo(code)
    } else {
      setPromoDiscount(0)
      setAppliedPromo(null)
      setPromoError("Invalid promo code")
    }
  }

  const handleNext = async () => {
    if (!validateStep(step)) return

    if (step === "contact") {
      setStep("address")
      // Scroll to top of form after state updates
      setTimeout(() => checkoutFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0)
    } else if (step === "address") {
      setStep("payment")
      // Scroll to top of form after state updates
      setTimeout(() => checkoutFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0)
    } else if (step === "payment") {
      const subtotal = getTotalPrice()
      const discount = promoDiscount
      const subtotalAfter = Math.max(0, subtotal - discount)
      const shipping = subtotal >= 2500 ? 0 : shippingRegion === "cairo-giza" ? 70 : 90
      const total = subtotalAfter + shipping
      const newOrderNumber = generateOrderNumber()

      setIsSubmitting(true)

      try {
        const checkoutResponse = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer: {
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              phone: formData.phone,
              subscribeToOffers: subscribeOffers,
            },
            address: {
              street: formData.street,
              building: formData.building,
              apartment: formData.apartment || undefined,
              city: formData.city,
              postalCode: formData.postalCode || undefined,
              notes: formData.deliveryNotes || undefined,
            },
            items: cart.map((item) => ({
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              image: item.image,
              variant: {
                size: item.selectedSize,
                color: item.color,
              },
            })),
            pricing: {
              subtotal,
              discount,
              shippingFee: shipping,
              total,
            },
            paymentMethod,
            shippingRegion,
          }),
        })

        const checkoutData = await checkoutResponse.json()

        if (!checkoutResponse.ok) {
          console.error("[v0] Checkout API error:", checkoutData.error)
          setIsSubmitting(false)
          return
        }

        console.log("[v0] ✅ Order saved to Supabase:", checkoutData.orderNumber)

        // Send confirmation email
        await sendConfirmationEmail(formData.email, formData.firstName, checkoutData.orderNumber, {
          orderNumber: checkoutData.orderNumber,
          items: cart,
          subtotal,
          discount,
          shipping,
          total,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          address: `${formData.street}, ${formData.building}${formData.apartment ? `, ${formData.apartment}` : ""}, ${formData.city}`,
          paymentMethod,
        })

        setIsSubmitting(false)

        setOrderSummary({
          subtotal,
          shipping,
          total,
          shippingRegion,
          paymentMethod,
          promoCode: appliedPromo || undefined,
          discount,
          orderNumber: checkoutData.orderNumber,
        })

        clearCart()

        setStep("confirmation")
      } catch (error) {
        console.error("[v0] Checkout error:", error)
        setIsSubmitting(false)
      }
    }
  }

  const handleBack = () => {
    if (step === "address") setStep("contact")
    else if (step === "payment") setStep("address")
  }

  if (step === "confirmation") {
    const subtotal = orderSummary?.subtotal ?? 0
    const discount = orderSummary?.discount ?? 0
    const subtotalAfter = Math.max(0, subtotal - discount)
    const shipping = orderSummary?.shipping ?? 0
    const total = orderSummary?.total ?? subtotalAfter + shipping
    const orderNumber = orderSummary?.orderNumber ?? ""

    return (
      <div className="min-h-screen bg-background">
        <Suspense fallback={<HeaderSkeleton />}>
          <Header />
        </Suspense>
        <div className="max-w-2xl mx-auto px-4 py-24">
          <div className="text-center mb-12">
            <CheckCircle2 size={64} className="text-accent mx-auto mb-6" />
            <h1 className="text-4xl font-light mb-4 text-pretty">Order Confirmed!</h1>

            <div className="bg-muted/50 rounded-lg p-6 mb-6 inline-block">
              <p className="text-sm text-muted-foreground mb-1">Order Number</p>
              <p className="text-3xl font-semibold text-accent">{orderNumber}</p>
            </div>

            <p className="text-lg text-muted-foreground mb-2">Thank you for your purchase, {formData.firstName}</p>
          </div>

          <div className="bg-muted/50 rounded-lg p-8 mb-8">
            <h2 className="text-xl font-medium mb-6">Order Summary</h2>

            <div className="space-y-3 pb-6 border-b border-border mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>EGP {subtotal.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between">
                  <span>Promo discount</span>
                  <span>- EGP {discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>
                  Shipping
                  {subtotal >= 2500 && <span className="text-green-600 text-sm ml-2">(FREE)</span>}
                </span>
                <span>EGP {shipping.toFixed(2)}</span>
              </div>

              <div className="border-t border-border pt-3 flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>EGP {total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="font-medium mb-1">Payment Method</h3>
              <p className="text-muted-foreground text-sm">
                {orderSummary?.paymentMethod === "instapay" ? "Instapay Wallet" : "Cash on Delivery"}
              </p>
            </div>

            {orderSummary?.promoCode && (
              <div className="mt-2">
                <p className="text-xs text-muted-foreground">Promo code used: {orderSummary.promoCode}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              A confirmation email has been sent to {formData.email}
            </p>
            <Link
              href="/"
              className="block w-full bg-accent text-accent-foreground py-3 rounded-lg font-medium text-center hover:opacity-90 transition"
            >
              Return to Home
            </Link>
          </div>
        </div>
        <Suspense fallback={<FooterSkeleton />}>
          <Footer />
        </Suspense>
      </div>
    )
  }

  // Main steps UI
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<HeaderSkeleton />}>
        <Header />
      </Suspense>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-light mb-12 text-pretty">Checkout</h1>

        <div className="mb-12 flex gap-4">
          {(["contact", "address", "payment"] as const).map((s, idx) => (
            <div key={s} className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-medium transition ${
                  s === step
                    ? "bg-accent text-accent-foreground"
                    : ["contact", "address", "payment"].indexOf(s) < ["contact", "address", "payment"].indexOf(step)
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {idx + 1}
              </div>
              {idx < 2 && <ChevronRight size={20} className="text-muted-foreground" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Form */}
          <div className="lg:col-span-2">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleNext()
              }}
              className="space-y-8"
            >
              {/* Contact */}
              {step === "contact" && (
                <div>
                  <h2 className="text-2xl font-light mb-6">Contact Information</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">First Name*</label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className={`w-full px-4 py-3 rounded border-2 transition ${
                            errors.firstName ? "border-destructive" : "border-border focus:border-accent"
                          } focus:outline-none`}
                        />
                        {errors.firstName && <p className="text-destructive text-sm mt-1">{errors.firstName}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Last Name*</label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className={`w-full px-4 py-3 rounded border-2 transition ${
                            errors.lastName ? "border-destructive" : "border-border focus:border-accent"
                          } focus:outline-none`}
                        />
                        {errors.lastName && <p className="text-destructive text-sm mt-1">{errors.lastName}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Email*</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`w-full px-4 py-3 rounded border-2 transition ${
                          errors.email ? "border-destructive" : "border-border focus:border-accent"
                        } focus:outline-none`}
                      />
                      {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}

                      <label className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={subscribeOffers}
                          onChange={(e) => setSubscribeOffers(e.target.checked)}
                          className="h-4 w-4 rounded border-border"
                        />
                        <span>Email me with news and offers</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Phone Number (Mandatory)*</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="01xxxxxxxx"
                        className={`w-full px-4 py-3 rounded border-2 transition ${
                          errors.phone ? "border-destructive" : "border-border focus:border-accent"
                        } focus:outline-none`}
                      />
                      {errors.phone && <p className="text-destructive text-sm mt-1">{errors.phone}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Address */}
              {step === "address" && (
                <div>
                  <h2 className="text-2xl font-light mb-6">Delivery Address</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Street Address*</label>
                      <input
                        type="text"
                        value={formData.street}
                        onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                        className={`w-full px-4 py-3 rounded border-2 transition ${
                          errors.street ? "border-destructive" : "border-border focus:border-accent"
                        } focus:outline-none`}
                      />
                      {errors.street && <p className="text-destructive text-sm mt-1">{errors.street}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Building/House Number*</label>
                        <input
                          type="text"
                          value={formData.building}
                          onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                          className={`w-full px-4 py-3 rounded border-2 transition ${
                            errors.building ? "border-destructive" : "border-border focus:border-accent"
                          } focus:outline-none`}
                        />
                        {errors.building && <p className="text-destructive text-sm mt-1">{errors.building}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Apartment/Suite/Unit (Optional)</label>
                        <input
                          type="text"
                          value={formData.apartment}
                          onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                          className="w-full px-4 py-3 rounded border-2 border-border focus:border-accent focus:outline-none transition"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">City/Municipality*</label>
                        <select
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className={`w-full px-4 py-3 rounded border-2 transition ${
                            errors.city ? "border-destructive" : "border-border focus:border-accent"
                          } focus:outline-none bg-background`}
                        >
                          <option value="">Select a city</option>
                          {EGYPTIAN_CITIES.map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                        </select>
                        {errors.city && <p className="text-destructive text-sm mt-1">{errors.city}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Postal Code/Zip (Optional)</label>
                        <input
                          type="text"
                          value={formData.postalCode}
                          onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                          className="w-full px-4 py-3 rounded border-2 border-border focus:border-accent focus:outline-none transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Additional Delivery Notes (Optional)</label>
                      <textarea
                        value={formData.deliveryNotes}
                        onChange={(e) => setFormData({ ...formData, deliveryNotes: e.target.value })}
                        placeholder='e.g., "Leave with security," "Use the side door"'
                        rows={4}
                        className="w-full px-4 py-3 rounded border-2 border-border focus:border-accent focus:outline-none transition resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Payment */}
              {step === "payment" && (
                <div>
                  <h2 className="text-2xl font-light mb-6">Payment Method</h2>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("instapay")}
                      className={`flex-1 py-3 px-4 rounded-lg border transition ${
                        paymentMethod === "instapay"
                          ? "bg-accent text-accent-foreground border-accent"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-medium">Instapay Wallet</span>
                        {paymentMethod === "instapay" && (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cod")}
                      className={`flex-1 py-3 px-4 rounded-lg border transition ${
                        paymentMethod === "cod"
                          ? "bg-accent text-accent-foreground border-accent"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-medium">Cash on Delivery</span>
                        {paymentMethod === "cod" && (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </button>
                  </div>

                  {paymentMethod === "instapay" && (
                    <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
                      <p className="font-medium mb-1">Instapay Number: 01065161086</p>
                      <p className="text-muted-foreground">
                        Please send a screenshot on WhatsApp to confirm your order
                      </p>
                    </div>
                  )}

                  {paymentMethod === "cod" && (
                    <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
                      <p className="text-muted-foreground">Pay in cash when your order arrives</p>
                    </div>
                  )}

                  {errors.paymentMethod && <p className="text-destructive text-sm mt-3">{errors.paymentMethod}</p>}
                </div>
              )}

              {/* Nav buttons */}
              <div className="flex gap-4 pt-8">
                {step !== "contact" && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 py-3 px-6 rounded-lg border-2 border-border font-medium hover:bg-muted transition"
                  >
                    Back
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 py-3 px-6 rounded-lg font-medium transition ${
                    isSubmitting
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "bg-accent text-accent-foreground hover:opacity-90"
                  }`}
                >
                  {isSubmitting ? "Processing..." : step === "payment" ? "Place Order" : "Next"}
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-muted/50 rounded-lg p-8 sticky top-24">
              <h2 className="text-xl font-light mb-6 text-pretty">Order Summary</h2>

              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3">Shipping</h3>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShippingRegion("cairo-giza")}
                    className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition ${
                      shippingRegion === "cairo-giza"
                        ? "bg-accent text-accent-foreground border-accent"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    Cairo / Giza
                  </button>
                  <button
                    type="button"
                    onClick={() => setShippingRegion("other")}
                    className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition ${
                      shippingRegion === "other"
                        ? "bg-accent text-accent-foreground border-accent"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    Other Governorates
                  </button>
                </div>
              </div>

              {/* Promo */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Promo code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 px-3 py-2 rounded border border-border text-sm focus:outline-none focus:border-accent"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="px-4 py-2 rounded bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 transition"
                  >
                    Apply
                  </button>
                </div>
                {appliedPromo && (
                  <p className="text-xs text-green-600 mt-1">
                    Code &quot;{appliedPromo}&quot; applied ({Math.round(ACTIVE_PROMO_DISCOUNT * 100)}% off)
                  </p>
                )}
                {promoError && <p className="text-xs text-destructive mt-1">{promoError}</p>}
              </div>

              <div className="space-y-4 pb-6 border-b border-border max-h-60 overflow-y-auto">
                {cart.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="flex gap-4">
                    <div className="relative w-20 h-20 bg-muted rounded overflow-hidden flex-shrink-0">
                      <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">Size: {item.size}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">EGP {(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6 text-sm mt-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>EGP {baseSubtotal.toFixed(2)}</span>
                </div>

                {effectiveDiscount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Promo discount</span>
                    <span>- EGP {effectiveDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Shipping
                    {baseSubtotal >= 2500 && <span className="text-green-600 ml-1 text-xs">(FREE)</span>}
                  </span>
                  <span>EGP {effectiveShipping.toFixed(2)}</span>
                </div>

                <div className="border-t border-border pt-3 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>EGP {effectiveTotal.toFixed(2)}</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center">Free shipping on orders over EGP 2500</p>
            </div>
          </div>
        </div>
      </div>
      <Suspense fallback={<FooterSkeleton />}>
        <Footer />
      </Suspense>
    </div>
  )
}
