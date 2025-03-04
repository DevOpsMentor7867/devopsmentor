"use client";

import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { getNames } from "country-list";
import { useAuthContext } from "../../../API/UseAuthContext";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const countries = getNames();

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { plan } = location.state || { plan: null };
  const [loading, setLoading] = useState(false);
  const [billingIsSameAsShipping, setBillingIsSameAsShipping] = useState(true);
  const { user } = useAuthContext();

  if (!plan) {
    navigate("/dashboard/pricing");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create a Stripe Checkout Session
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planName: plan.name,
          price: plan.price,
          description: plan.description,
        }),
      });

      const { sessionId } = await response.json();

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        console.error("Error:", error);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-0">
        <img
          src="/homebgc.jpg"
          alt="Background"
          className="w-full h-full object-cover mt-12"
        />
        <div className="absolute backdrop-blur-lg inset-0 bg-black/70" />
      </div>

      <div className="relative  p-8">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate("/dashboard/pricing")}
            className="mb-8 text-[#09D1C7] hover:text-white hover:bg-[#09D1C7]/20 px-4 py-2 rounded-lg flex items-center "
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Plans
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 -mt-16">
            {/* Selected Plan Summary */}
            <div className="bg-[#1A202C]/50 border border-[#09D1C7]/20 rounded-xl p-6 h-fit backdrop-blur-sm mt-10">
              <h2 className="text-2xl font-bold text-white mb-4">
                Order Summary
              </h2>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-[#09D1C7]">
                    {plan.name} Plan
                  </h3>
                  <p className="text-gray-400">{plan.description}</p>
                </div>
                <span className="text-2xl font-bold text-[#09D1C7]">
                  {plan.price}
                </span>
              </div>
              <div className="border-t border-[#09D1C7]/20 pt-4">
                <h4 className="text-white font-medium mb-2">
                  Included Features:
                </h4>
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start text-sm">
                      <Check className="h-4 w-4 text-[#09D1C7] mr-2 shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Checkout Form */}
            <div className="bg-[#1A202C]/50 border border-[#09D1C7]/20 rounded-xl p-6 backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-white mb-6">
                Payment Details
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-white mb-1">
                    Email
                  </label>
                  <div className="w-full px-3 py-2 rounded-lg bg-[#1A202C]/50 border border-[#09D1C7]/20 text-white focus:outline-none focus:border-[#09D1C7]">
                    {user.email}
                  </div>
                </div>

                <div>
                  <label htmlFor="card" className="block text-white mb-1">
                    Card information
                  </label>
                  <input
                    id="card"
                    placeholder="1234 1234 1234 1234"
                    required
                    className="w-full px-3 py-2 rounded-lg bg-[#1A202C]/50 border border-[#09D1C7]/20 text-white focus:outline-none focus:border-[#09D1C7]"
                  />
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <input
                      placeholder="MM / YY"
                      required
                      className="px-3 py-2 rounded-lg bg-[#1A202C]/50 border border-[#09D1C7]/20 text-white focus:outline-none focus:border-[#09D1C7]"
                    />
                    <input
                      placeholder="CVC"
                      required
                      className="px-3 py-2 rounded-lg bg-[#1A202C]/50 border border-[#09D1C7]/20 text-white focus:outline-none focus:border-[#09D1C7]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="name" className="block text-white mb-1">
                    Name on card
                  </label>
                  <input
                    id="name"
                    required
                    className="w-full px-3 py-2 rounded-lg bg-[#1A202C]/50 border border-[#09D1C7]/20 text-white focus:outline-none focus:border-[#09D1C7]"
                  />
                </div>

                <div>
                  <label htmlFor="country" className="block text-white mb-1">
                    Country
                  </label>
                  <select
                    id="country"
                    required
                    className="w-full px-3 py-2 rounded-lg bg-[#1A202C]/50 border border-[#09D1C7]/20 text-white focus:outline-none focus:border-[#09D1C7] appearance-none custom-select"
                  >
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="billing-same"
                    checked={billingIsSameAsShipping}
                    onChange={(e) =>
                      setBillingIsSameAsShipping(e.target.checked)
                    }
                    className="h-4 w-4 rounded border-[#09D1C7]/20 bg-[#1A202C]/50"
                  />
                  <label
                    htmlFor="billing-same"
                    className="ml-2 text-sm text-gray-300"
                  >
                    Billing address is same as shipping
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-6 rounded-lg font-medium transition-all bg-[#09D1C7] text-[#1A202C] hover:bg-[#09D1C7]/90 disabled:opacity-50"
                >
                  {loading ? "Processing..." : `Pay ${plan.price}`}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
