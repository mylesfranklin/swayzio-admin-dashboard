import { useState, useEffect } from "react";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Load Stripe outside of component to avoid recreating on each render
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface CheckoutFormProps {
  clientSecret: string;
  amount?: number;
  returnUrl?: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

const CheckoutForm = ({
  clientSecret,
  returnUrl = window.location.origin,
  onSuccess,
  onError
}: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    // Check to see if this is a redirect back from completed payment
    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );
    
    if (!clientSecret) {
      return;
    }
    
    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      if (paymentIntent) {
        switch (paymentIntent.status) {
          case "succeeded":
            setErrorMessage(null);
            onSuccess?.();
            break;
          case "processing":
            setErrorMessage("Your payment is processing.");
            break;
          case "requires_payment_method":
            setErrorMessage("Your payment was not successful, please try again.");
            break;
          default:
            setErrorMessage("Something went wrong.");
            break;
        }
      }
    });
  }, [stripe, onSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded
      return;
    }
    
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
        },
        redirect: 'if_required'
      });
  
      if (error) {
        setErrorMessage(error.message || "An unknown error occurred");
        onError?.(error);
      } else {
        // Payment succeeded
        onSuccess?.();
      }
    } catch (e) {
      console.error("Payment confirmation error:", e);
      setErrorMessage("An unexpected error occurred");
      onError?.(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <PaymentElement />
        
        {errorMessage && (
          <div className="text-sm text-red-500 mt-2">{errorMessage}</div>
        )}
        
        <Button 
          type="submit" 
          disabled={!stripe || isLoading} 
          className="w-full"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Pay Now"
          )}
        </Button>
      </div>
    </form>
  );
};

interface StripeCheckoutProps {
  amount: number;
  customerId?: string;
  returnUrl?: string;
  onPaymentSuccess?: () => void;
  onPaymentError?: (error: any) => void;
  title?: string;
  description?: string;
}

export default function StripeCheckout({ 
  amount, 
  customerId,
  returnUrl,
  onPaymentSuccess,
  onPaymentError,
  title = "Payment",
  description = "Complete your payment securely with Stripe"
}: StripeCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Create PaymentIntent as soon as the component loads
    const createPaymentIntent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const body: Record<string, any> = { amount };
        if (customerId) {
          body.customerId = customerId;
        }
        
        const response = await apiRequest('POST', '/api/create-payment-intent', body);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to create payment intent');
        }
        
        setClientSecret(data.clientSecret);
      } catch (error: any) {
        console.error('Error creating payment intent:', error);
        setError(error.message || 'Failed to initialize payment');
        onPaymentError?.(error);
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, [amount, customerId, onPaymentError]);

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (error || !clientSecret) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Payment Error</CardTitle>
          <CardDescription>We couldn't initialize the payment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-red-500 p-4 bg-red-50 rounded-md">
            {error || "Failed to create payment. Please try again."}
          </div>
        </CardContent>
      </Card>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
    },
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description}
          <div className="mt-2 font-medium">
            Amount: ${(amount / 100).toFixed(2)}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm 
            clientSecret={clientSecret}
            amount={amount}
            returnUrl={returnUrl}
            onSuccess={onPaymentSuccess}
            onError={onPaymentError}
          />
        </Elements>
      </CardContent>
    </Card>
  );
}