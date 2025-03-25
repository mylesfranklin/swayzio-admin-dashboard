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

interface SubscriptionFormProps {
  clientSecret: string;
  returnUrl?: string;
  onSuccess?: (result: { subscriptionId: string; customerId: string }) => void;
  onError?: (error: any) => void;
  planName?: string;
  price?: number;
  interval?: string;
}

const SubscriptionForm = ({
  clientSecret,
  returnUrl = window.location.origin,
  onSuccess,
  onError,
  planName,
  price,
  interval
}: SubscriptionFormProps) => {
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
    
    // Get subscription data from window if available
    const subscriptionData = (window as any).subscriptionData;
    
    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      if (paymentIntent) {
        switch (paymentIntent.status) {
          case "succeeded":
            setErrorMessage(null);
            if (subscriptionData) {
              onSuccess?.(subscriptionData);
            }
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
        // Payment and subscription setup succeeded
        const subscriptionData = (window as any).subscriptionData;
        if (subscriptionData) {
          onSuccess?.(subscriptionData);
        }
      }
    } catch (e) {
      console.error("Subscription confirmation error:", e);
      setErrorMessage("An unexpected error occurred");
      onError?.(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        {planName && (
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <h3 className="font-medium">Plan: {planName}</h3>
            {price !== undefined && interval && (
              <p className="text-sm text-gray-600">
                ${(price / 100).toFixed(2)}/{interval}
              </p>
            )}
          </div>
        )}
        
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
            "Subscribe Now"
          )}
        </Button>
      </div>
    </form>
  );
};

interface StripeSubscriptionProps {
  priceId: string;
  customerId?: string;
  email?: string;
  name?: string;
  returnUrl?: string;
  onSubscriptionSuccess?: (result: { subscriptionId: string; customerId: string }) => void;
  onSubscriptionError?: (error: any) => void;
  title?: string;
  description?: string;
  planName?: string;
  price?: number;
  interval?: 'month' | 'year' | 'week' | 'day';
}

export default function StripeSubscription({
  priceId,
  customerId,
  email,
  name,
  returnUrl,
  onSubscriptionSuccess,
  onSubscriptionError,
  title = "Subscription",
  description = "Subscribe to our service",
  planName,
  price,
  interval
}: StripeSubscriptionProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [stripeCustomerId, setStripeCustomerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Create subscription as soon as the component loads
    const createSubscription = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const body: Record<string, any> = { priceId };
        if (customerId) {
          body.customerId = customerId;
        }
        if (email) {
          body.email = email;
        }
        if (name) {
          body.name = name;
        }
        
        const response = await apiRequest('POST', '/api/create-subscription', body);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to create subscription');
        }
        
        setClientSecret(data.clientSecret);
        setSubscriptionId(data.subscriptionId);
        setStripeCustomerId(data.customerId);
        
        // Store subscription data for access after redirect
        (window as any).subscriptionData = {
          subscriptionId: data.subscriptionId,
          customerId: data.customerId
        };
      } catch (error: any) {
        console.error('Error creating subscription:', error);
        setError(error.message || 'Failed to initialize subscription');
        onSubscriptionError?.(error);
      } finally {
        setIsLoading(false);
      }
    };

    createSubscription();
  }, [priceId, customerId, email, name, onSubscriptionError]);

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
          <CardTitle>Subscription Error</CardTitle>
          <CardDescription>We couldn't set up your subscription</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-red-500 p-4 bg-red-50 rounded-md">
            {error || "Failed to create subscription. Please try again."}
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

  const handleSuccess = (result: { subscriptionId: string; customerId: string }) => {
    // Clear stored subscription data
    delete (window as any).subscriptionData;
    onSubscriptionSuccess?.(result);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Elements stripe={stripePromise} options={options}>
          <SubscriptionForm 
            clientSecret={clientSecret}
            returnUrl={returnUrl}
            onSuccess={handleSuccess}
            onError={onSubscriptionError}
            planName={planName}
            price={price}
            interval={interval}
          />
        </Elements>
      </CardContent>
    </Card>
  );
}