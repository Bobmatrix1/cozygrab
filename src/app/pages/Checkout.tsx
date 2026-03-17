import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Separator } from '../components/ui/separator';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription,
    DialogTrigger,
    DialogFooter,
    DialogClose
} from '../components/ui/dialog';
import { 
    ArrowLeft, 
    CreditCard, 
    Wallet, 
    Building2, 
    Check, 
    Loader2, 
    Plus, 
    Trash2, 
    Lock, 
    ShieldCheck, 
    Smartphone, 
    AlertCircle,
    ChevronRight,
    Building
} from 'lucide-react';
import { toast } from 'sonner';
import { mockAddresses as initialAddresses, type CartItem } from '../data/mock-data';
import type { Page } from '../App';
import { createOrder } from '../../services/db';
import { useAuth } from '../../contexts/AuthContext';

interface CheckoutProps {
  items: CartItem[];
  onNavigate: (page: Page) => void;
  onClearCart: () => void;
}

const SUPPORTED_BANKS = [
    { name: 'Access Bank', id: 'access' },
    { name: 'GTBank', id: 'gtb' },
    { name: 'Zenith Bank', id: 'zenith' },
    { name: 'First Bank', id: 'firstbank' },
    { name: 'UBA', id: 'uba' },
    { name: 'Kuda Bank', id: 'kuda' },
    { name: 'Moniepoint', id: 'moniepoint' },
    { name: 'Opay', id: 'opay' },
];

const WALLET_PROVIDERS = [
    { name: 'PalmPay', id: 'palmpay' },
    { name: 'Opay Wallet', id: 'opay' },
    { name: 'Flutterwave', id: 'flw' },
    { name: 'Paystack', id: 'pstk' },
];

export function Checkout({ items, onNavigate, onClearCart }: CheckoutProps) {
  const [step, setStep] = useState<'address' | 'delivery' | 'payment' | 'simulating' | 'confirmation'>('address');
  const [addresses, setAddresses] = useState(initialAddresses);
  const [selectedAddress, setSelectedAddress] = useState(initialAddresses[0].id);
  const [deliveryMethod, setDeliveryMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string>('');
  
  // Payment Simulation State
  const [simulatingStep, setSimulatingStep] = useState<'processing' | 'security' | 'success'>('processing');
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [selectedWallet, setSelectedWallet] = useState<string>('');
  const [otp, setOtp] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAddress, setNewAddress] = useState({
      name: '',
      phone: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Nigeria'
  });

  const { user } = useAuth();

  const [cardDetails, setCardDetails] = useState({
      number: '',
      expiry: '',
      cvv: ''
  });

  const handleNumericKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const isControlKey = [
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', 'Home', 'End', 'Escape'
    ].includes(e.key);
    const isMetaKey = e.ctrlKey || e.metaKey;
    const isNumber = /^[0-9]$/.test(e.key);

    if (!isNumber && !isControlKey && !isMetaKey) {
      e.preventDefault();
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let v = e.target.value.replace(/[^0-9]/g, '');
      if (v.length > 4) v = v.slice(0, 4);
      if (v.length >= 3) {
          v = `${v.slice(0, 2)}/${v.slice(2)}`;
      }
      setCardDetails(prev => ({ ...prev, expiry: v }));
  };

  const handleCVVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value.replace(/[^0-9]/g, '').slice(0, 3);
      setCardDetails(prev => ({ ...prev, cvv: v }));
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value.replace(/[^0-9]/g, '').slice(0, 16);
      setCardDetails(prev => ({ ...prev, number: v }));
  };

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee = deliveryMethod === 'express' ? 15.99 : deliveryMethod === 'standard' ? 5.99 : 0;
  const tax = subtotal * 0.1;
  const total = subtotal + deliveryFee + tax;

  const handleAddAddress = (e: React.FormEvent) => {
      e.preventDefault();
      const id = Date.now().toString();
      const addedAddress = { ...newAddress, id, isDefault: false };
      setAddresses([...addresses, addedAddress]);
      setSelectedAddress(id);
      setNewAddress({ name: '', phone: '', street: '', city: '', state: '', zipCode: '', country: 'Nigeria' });
      setIsAddDialogOpen(false);
      toast.success("Address added and selected");
  };

  const handleDeleteAddress = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (addresses.length <= 1) {
          toast.error("You must have at least one address");
          return;
      }
      const filtered = addresses.filter(a => a.id !== id);
      setAddresses(filtered);
      if (selectedAddress === id) {
          setSelectedAddress(filtered[0].id);
      }
      toast.success("Address removed");
  };

  useEffect(() => {
      if (step === 'simulating' && simulatingStep === 'security' && otp.length === 6) {
          const timer = setTimeout(() => {
              handleFinishPayment();
          }, 1000);
          return () => clearTimeout(timer);
      }
  }, [otp, step, simulatingStep]);

  const handleFinishPayment = async () => {
    setSimulatingStep('success');
    setIsProcessing(true);
    
    try {
        const address = addresses.find(a => a.id === selectedAddress);
        const sanitizedItems = items.map(item => ({
            ...item,
            selectedColor: item.selectedColor || null,
            selectedSize: item.selectedSize || null
        }));

        const newOrderId = await createOrder(
            user.uid,
            sanitizedItems,
            total,
            address || { street: 'Unknown', city: 'Unknown', state: 'Unknown', zipCode: '00000', country: 'Unknown' } 
        );
        setOrderId(newOrderId);
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        onClearCart();
        setStep('confirmation');
    } catch (error) {
        console.error("Order placement failed", error);
        toast.error("Payment verified, but order creation failed. Please contact support.");
        setStep('payment');
    } finally {
        setIsProcessing(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!user) {
        toast.error("You must be logged in to place an order.");
        return;
    }

    if (paymentMethod === 'card' && (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv)) {
        toast.error("Please fill in all card details");
        return;
    }

    if (paymentMethod === 'bank' && !selectedBank) {
        toast.error("Please select a bank");
        return;
    }

    if (paymentMethod === 'wallet' && !selectedWallet) {
        toast.error("Please select a wallet provider");
        return;
    }

    setStep('simulating');
    setSimulatingStep('processing');
    setOtp('');
    
    // Step 1: Simulated Processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 2: Simulated Security Check (3DS/OTP)
    setSimulatingStep('security');
    
    toast.info("Security code sent. Please enter any 6 digits to authorize.", { duration: 5000 });
  };

  const renderSimulating = () => {
      const currentMethod = paymentMethod === 'card' ? 'Card' : paymentMethod === 'bank' ? 'Bank' : 'Wallet';
      
      return (
          <div className="min-h-screen bg-background flex items-center justify-center p-4">
              <Card className="max-w-md w-full overflow-hidden shadow-2xl border-primary/20">
                  <div className="bg-primary p-4 text-primary-foreground flex items-center justify-between">
                      <div className="flex items-center gap-2">
                          <ShieldCheck className="h-5 w-5" />
                          <span className="font-medium">Secure Payment Gateway</span>
                      </div>
                      <Lock className="h-4 w-4 opacity-70" />
                  </div>
                  
                  <CardContent className="p-8 text-center space-y-6">
                      {simulatingStep === 'processing' && (
                          <div className="space-y-4 animate-in fade-in zoom-in duration-500">
                              <div className="relative w-20 h-20 mx-auto">
                                  <Loader2 className="h-20 w-20 text-primary animate-spin" />
                                  <div className="absolute inset-0 flex items-center justify-center">
                                      <CreditCard className="h-8 w-8 text-primary" />
                                  </div>
                              </div>
                              <div>
                                  <h2 className="text-xl font-semibold">Authorizing Transaction</h2>
                                  <p className="text-sm text-muted-foreground mt-1">Connecting to {currentMethod} network...</p>
                              </div>
                          </div>
                      )}

                      {simulatingStep === 'security' && (
                          <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500 text-left">
                              <div className="flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
                                  <Smartphone className="h-5 w-5" />
                                  <p className="text-xs font-medium">Verification required. We've sent a code to your mobile device.</p>
                              </div>
                              
                              <div className="space-y-3 relative">
                                  <h2 className="text-lg font-bold text-center">3D Secure v2.0</h2>
                                  <p className="text-xs text-muted-foreground text-center mb-4">Please enter the One-Time Password (OTP) to authorize the payment of <span className="font-bold text-foreground">₦{total.toFixed(2)}</span> to <span className="font-bold text-primary">CozyGrab</span>.</p>
                                  
                                  {/* Hidden input to capture OTP typing */}
                                  <input 
                                    type="text" 
                                    inputMode="numeric" 
                                    autoFocus 
                                    maxLength={6} 
                                    value={otp} 
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                                        setOtp(val);
                                    }}
                                    className="absolute inset-0 opacity-0 cursor-default"
                                  />

                                  <div className="flex justify-center gap-2 mt-4">
                                      {[1,2,3,4,5,6].map((i) => (
                                          <div key={i} className={`w-10 h-12 border-2 rounded-md flex items-center justify-center font-bold text-xl transition-all ${otp.length >= i ? 'border-primary bg-primary/5' : 'bg-muted/30'}`}>
                                              {otp[i-1] || ''}
                                              {otp.length === i-1 && <span className="w-0.5 h-6 bg-primary animate-pulse" />}
                                          </div>
                                      ))}
                                  </div>
                                  
                                  <div className="text-center pt-2">
                                      <p className="text-[10px] text-muted-foreground mb-1">Didn't get the code?</p>
                                      <Button variant="link" size="sm" className="text-xs h-auto p-0 text-primary font-bold">Resend OTP</Button>
                                  </div>
                              </div>
                              
                              <div className="pt-6 border-t flex items-center justify-between opacity-50">
                                  <div className="flex gap-2">
                                      <div className="w-8 h-5 bg-slate-200 rounded" />
                                      <div className="w-8 h-5 bg-slate-200 rounded" />
                                  </div>
                                  <div className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-tighter">
                                      <Lock className="h-2 w-2" />
                                      PCI DSS Compliant
                                  </div>
                              </div>
                          </div>
                      )}

                      {simulatingStep === 'success' && (
                          <div className="space-y-4 animate-in fade-in zoom-in duration-500">
                              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto ring-8 ring-green-50">
                                  <Check className="h-10 w-10 text-green-600" />
                              </div>
                              <div>
                                  <h2 className="text-xl font-semibold text-green-700">Payment Verified</h2>
                                  <p className="text-sm text-muted-foreground mt-1">Transaction hash: {Math.random().toString(36).substring(7).toUpperCase()}</p>
                              </div>
                              <div className="pt-4">
                                  <div className="flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground">
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                      REDIRECTING TO MERCHANT...
                                  </div>
                              </div>
                          </div>
                      )}
                  </CardContent>
              </Card>
          </div>
      );
  };

  if (step === 'simulating') {
      return renderSimulating();
  }

  if (step === 'confirmation') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-semibold mb-2">Order Confirmed!</h1>
            <p className="text-muted-foreground mb-6">
              Thank you for your purchase. Your order has been placed successfully.
            </p>
            <div className="bg-muted rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground mb-1">Order Number</p>
              <p className="text-xl font-semibold">ORD-{orderId.substr(0, 8).toUpperCase()}</p>
            </div>
            <div className="space-y-2">
              <Button onClick={() => onNavigate('orders')} className="w-full">
                View My Orders
              </Button>
              <Button onClick={() => onNavigate('home')} variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="flex items-center gap-3 p-4">
          <button onClick={() => onNavigate('cart')}>
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-semibold">Checkout</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 lg:grid lg:grid-cols-3 lg:gap-6">
        {/* Checkout Steps */}
        <div className="lg:col-span-2 space-y-6 mb-6 lg:mb-0">
          {/* Progress */}
          <div className="flex items-center justify-between">
            {['address', 'delivery', 'payment'].map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    s === step
                      ? 'bg-primary text-primary-foreground'
                      : i < ['address', 'delivery', 'payment'].indexOf(step)
                      ? 'bg-green-500 text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {i + 1}
                </div>
                {i < 2 && <div className="flex-1 h-0.5 bg-muted mx-2" />}
              </div>
            ))}
          </div>

          {/* Shipping Address */}
          {step === 'address' && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Shipping Address</h2>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Add New
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Address</DialogTitle>
                                <DialogDescription>Enter your delivery details below.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleAddAddress} className="space-y-4 pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input 
                                            id="name" 
                                            value={newAddress.name} 
                                            onChange={(e) => setNewAddress({...newAddress, name: e.target.value})}
                                            placeholder="John Doe" 
                                            required 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input 
                                            id="phone" 
                                            value={newAddress.phone} 
                                            onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                                            placeholder="+234..." 
                                            required 
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="street">Street Address</Label>
                                    <Input 
                                        id="street" 
                                        value={newAddress.street} 
                                        onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
                                        placeholder="123 Main St" 
                                        required 
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="city">City</Label>
                                        <Input 
                                            id="city" 
                                            value={newAddress.city} 
                                            onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                                            placeholder="Lagos" 
                                            required 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="state">State</Label>
                                        <Input 
                                            id="state" 
                                            value={newAddress.state} 
                                            onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                                            placeholder="Lagos State" 
                                            required 
                                        />
                                    </div>
                                </div>
                                <DialogFooter className="pt-4">
                                    <DialogClose asChild>
                                        <Button type="button" variant="outline">Cancel</Button>
                                    </DialogClose>
                                    <Button type="submit">Save & Select</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}>
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedAddress === address.id ? 'border-primary ring-1 ring-primary bg-primary/5' : 'hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedAddress(address.id)}
                    >
                      <RadioGroupItem value={address.id} id={address.id} onClick={(e) => e.stopPropagation()} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <label htmlFor={address.id} className="font-medium cursor-pointer">
                            {address.name}
                            {address.isDefault && (
                                <Badge className="ml-2" variant="secondary">
                                Default
                                </Badge>
                            )}
                            </label>
                            <button 
                                onClick={(e) => handleDeleteAddress(address.id, e)}
                                className="text-muted-foreground hover:text-destructive p-1"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {address.street}, {address.city}, {address.state} {address.zipCode}
                        </p>
                        <p className="text-sm text-muted-foreground">{address.phone}</p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
                
                <Button onClick={() => setStep('delivery')} className="w-full h-12 text-lg">
                  Continue to Delivery
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Delivery Method */}
          {step === 'delivery' && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-lg font-semibold">Delivery Method</h2>
                <RadioGroup value={deliveryMethod} onValueChange={setDeliveryMethod}>
                  <div className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:border-primary">
                    <RadioGroupItem value="standard" id="standard" />
                    <div className="flex-1">
                      <label htmlFor="standard" className="font-medium cursor-pointer">
                        Standard Delivery (5-7 days)
                      </label>
                      <p className="text-sm text-muted-foreground">₦5.99</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:border-primary">
                    <RadioGroupItem value="express" id="express" />
                    <div className="flex-1">
                      <label htmlFor="express" className="font-medium cursor-pointer">
                        Express Delivery (2-3 days)
                      </label>
                      <p className="text-sm text-muted-foreground">₦15.99</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:border-primary">
                    <RadioGroupItem value="pickup" id="pickup" />
                    <div className="flex-1">
                      <label htmlFor="pickup" className="font-medium cursor-pointer">
                        Store Pickup
                      </label>
                      <p className="text-sm text-muted-foreground">Free</p>
                    </div>
                  </div>
                </RadioGroup>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep('address')} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={() => setStep('payment')} className="flex-1">
                    Continue to Payment
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Method */}
          {step === 'payment' && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-lg font-semibold">Payment Method</h2>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:border-primary">
                    <RadioGroupItem value="card" id="card" />
                    <div className="flex-1">
                      <label htmlFor="card" className="font-medium cursor-pointer flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Credit / Debit Card
                      </label>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:border-primary">
                    <RadioGroupItem value="wallet" id="wallet" />
                    <div className="flex-1">
                      <label htmlFor="wallet" className="font-medium cursor-pointer flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        Digital Wallet
                      </label>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:border-primary">
                    <RadioGroupItem value="bank" id="bank" />
                    <div className="flex-1">
                      <label htmlFor="bank" className="font-medium cursor-pointer flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Bank Transfer
                      </label>
                    </div>
                  </div>
                </RadioGroup>

                {paymentMethod === 'card' && (
                  <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <div className="relative">
                          <Input 
                              id="cardNumber" 
                              type="text"
                              inputMode="numeric"
                              value={cardDetails.number}
                              onChange={handleCardNumberChange}
                              onKeyDown={handleNumericKeyDown}
                              placeholder="0000 0000 0000 0000" 
                              maxLength={16}
                              required 
                              className="pr-12"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                              <div className="w-8 h-5 bg-slate-100 border rounded flex items-center justify-center text-[8px] font-bold">VISA</div>
                          </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input 
                            id="expiry" 
                            type="text"
                            inputMode="numeric"
                            value={cardDetails.expiry}
                            onChange={handleExpiryChange}
                            onKeyDown={handleNumericKeyDown}
                            placeholder="MM/YY" 
                            maxLength={5}
                            required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input 
                            id="cvv" 
                            type="text"
                            inputMode="numeric"
                            value={cardDetails.cvv}
                            onChange={handleCVVChange}
                            onKeyDown={handleNumericKeyDown}
                            placeholder="123" 
                            maxLength={3}
                            required 
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                      <Lock className="h-3 w-3" />
                      Your card details are encrypted and securely processed.
                    </div>
                  </div>
                )}

                {paymentMethod === 'bank' && (
                    <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <Label>Select your Bank</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {SUPPORTED_BANKS.map(bank => (
                                <div 
                                    key={bank.id}
                                    onClick={() => setSelectedBank(bank.id)}
                                    className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${
                                        selectedBank === bank.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-primary/50'
                                    }`}
                                >
                                    <Building className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-xs font-medium">{bank.name}</span>
                                </div>
                            ))}
                        </div>
                        <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700 flex gap-2">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <p>You will be redirected to your bank's secure portal to authorize the transfer.</p>
                        </div>
                    </div>
                )}

                {paymentMethod === 'wallet' && (
                    <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <Label>Select Wallet Provider</Label>
                        <div className="space-y-2">
                            {WALLET_PROVIDERS.map(wallet => (
                                <div 
                                    key={wallet.id}
                                    onClick={() => setSelectedWallet(wallet.id)}
                                    className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
                                        selectedWallet === wallet.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-primary/50'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                                            <Wallet className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <span className="font-medium">{wallet.name}</span>
                                    </div>
                                    <ChevronRight className={`h-5 w-5 transition-transform ${selectedWallet === wallet.id ? 'text-primary' : 'text-muted-foreground'}`} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep('delivery')} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={handlePlaceOrder} className="flex-1" disabled={isProcessing}>
                    {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isProcessing ? 'Processing...' : `Pay ₦${total.toFixed(2)}`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:sticky lg:top-20 lg:h-fit">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-semibold">Order Summary</h2>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-clamp-2">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="text-sm font-medium">
                        ₦{(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₦{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="font-medium">
                    {deliveryFee === 0 ? 'Free' : `₦${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium">₦{tax.toFixed(2)}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-lg">
                <span className="font-semibold">Total</span>
                <span className="font-bold">₦{total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
