import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import StripeCheckout from "@/components/payments/checkout";
import StripeSubscription from "@/components/payments/subscription-checkout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function StripeCheckoutPage() {
  const [tab, setTab] = useState("one-time");
  const [amount, setAmount] = useState<number>(1999);
  const [customerId, setCustomerId] = useState<string>("");
  const [priceId, setPriceId] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();

  const handlePaymentSuccess = () => {
    setSuccessMessage("Payment was processed successfully!");
    toast({
      title: "Payment Successful",
      description: "The payment was processed successfully.",
      variant: "default",
    });
  };

  const handlePaymentError = (error: any) => {
    setErrorMessage(`Payment failed: ${error.message || "Unknown error"}`);
    toast({
      title: "Payment Failed",
      description: error.message || "An unknown error occurred",
      variant: "destructive",
    });
  };

  const handleSubscriptionSuccess = (result: { subscriptionId: string; customerId: string }) => {
    setSuccessMessage(`Subscription created successfully! Subscription ID: ${result.subscriptionId}`);
    toast({
      title: "Subscription Created",
      description: `Your subscription has been created with ID: ${result.subscriptionId}`,
      variant: "default",
    });
  };

  const handleSubscriptionError = (error: any) => {
    setErrorMessage(`Subscription failed: ${error.message || "Unknown error"}`);
    toast({
      title: "Subscription Failed",
      description: error.message || "An unknown error occurred",
      variant: "destructive",
    });
  };

  const resetMessages = () => {
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  return (
    <div className="container mx-auto py-8">

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Stripe Checkout</h1>
        <p className="text-gray-500">Process payments and subscriptions with Stripe.</p>
      </div>

      {successMessage && (
        <Alert className="mb-6 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert className="mb-6 bg-red-50" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="one-time" className="mb-8" value={tab} onValueChange={(value) => {
        setTab(value);
        resetMessages();
      }}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="one-time">One-time Payment</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
        </TabsList>
        
        <TabsContent value="one-time" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>One-time Payment Configuration</CardTitle>
              <CardDescription>Configure the details of your one-time payment.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (in cents)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="50"
                    value={amount}
                    onChange={(e) => setAmount(parseInt(e.target.value))}
                  />
                  <p className="text-sm text-gray-500">
                    ${(amount / 100).toFixed(2)}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerId">Customer ID (optional)</Label>
                  <Input
                    id="customerId"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    placeholder="cus_..."
                  />
                </div>
              </div>
              <Button 
                onClick={resetMessages}
                variant="outline"
                className="w-full"
              >
                Reset
              </Button>
            </CardContent>
          </Card>

          <StripeCheckout
            amount={amount}
            customerId={customerId || undefined}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
            title="Complete Your Payment"
            description="Make a secure one-time payment with Stripe"
          />
        </TabsContent>
        
        <TabsContent value="subscription" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Configuration</CardTitle>
              <CardDescription>Configure the details of your subscription.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priceId">Price ID</Label>
                  <Input
                    id="priceId"
                    value={priceId}
                    onChange={(e) => setPriceId(e.target.value)}
                    placeholder="price_..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subscription-customerId">Customer ID (optional)</Label>
                  <Input
                    id="subscription-customerId"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    placeholder="cus_..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email (if no customer ID)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="customer@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Name (optional)</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Customer Name"
                  />
                </div>
              </div>
              <Button 
                onClick={resetMessages}
                variant="outline"
                className="w-full"
              >
                Reset
              </Button>
            </CardContent>
          </Card>

          {priceId && (customerId || email) ? (
            <StripeSubscription
              priceId={priceId}
              customerId={customerId || undefined}
              email={email || undefined}
              name={name || undefined}
              onSubscriptionSuccess={handleSubscriptionSuccess}
              onSubscriptionError={handleSubscriptionError}
              title="Subscribe to Our Service"
              description="Set up your recurring subscription securely with Stripe"
              planName="Custom Plan"
            />
          ) : (
            <Card className="w-full max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Subscription</CardTitle>
                <CardDescription>Set up your recurring subscription</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 text-center text-amber-600 bg-amber-50 rounded">
                  Please enter a Price ID and either a Customer ID or Email to set up a subscription.
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}