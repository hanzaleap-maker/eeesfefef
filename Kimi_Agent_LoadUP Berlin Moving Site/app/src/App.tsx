import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Home, 
  Truck, 
  Trash2, 
  Building2, 
  Calendar, 
  Package, 
  ArrowRight, 
  ArrowLeft,
  Check,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  Search,
  Clock,
  CheckCircle2,
  X,
  Upload,
  Instagram,
  Facebook,
  MessageCircle,
  EyeIcon,
  Settings
} from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useInquiries } from '@/hooks/useInquiries';
import { useAdminSettings } from '@/hooks/useAdminSettings';
import type { FormData, ServiceType, UmzugType, TransportType, EntsorgungType, CustomerInquiry } from '@/types';
import './App.css';

type ViewType = 'home' | 'questionnaire' | 'success' | 'admin-login' | 'admin-dashboard' | 'datenschutz';

const INITIAL_FORM_DATA: FormData = {};

// Admin credentials (in production, this should be on a server)
const ADMIN_EMAIL = 'admin@loadup.de';
const ADMIN_PASSWORD = 'LoadUp2026!';

// Email validation
const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [isAdmin, setIsAdmin] = useLocalStorage('loadup_admin', false);
  const { inquiries, addInquiry, updateInquiryStatus, deleteInquiry } = useInquiries();
  const { settings, updateSettings } = useAdminSettings();
  
  // Admin login state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  // Filter inquiries
  const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'contacted' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selected inquiry for detail view
  const [selectedInquiry, setSelectedInquiry] = useState<CustomerInquiry | null>(null);
  const [showInquiryDetail, setShowInquiryDetail] = useState(false);
  
  // Admin settings modal
  const [showSettings, setShowSettings] = useState(false);
  
  // Email validation error
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    if (isAdmin && currentView === 'admin-login') {
      setCurrentView('admin-dashboard');
    }
  }, [isAdmin, currentView]);

  const handleServiceSelect = (service: ServiceType) => {
    setFormData({ ...INITIAL_FORM_DATA, serviceType: service });
    setCurrentStep(1);
    setCurrentView('questionnaire');
  };

  const handleUmzugTypeSelect = (type: UmzugType) => {
    setFormData({ ...formData, umzugType: type });
    setCurrentStep(2);
  };

  const handleTransportTypeSelect = (type: TransportType) => {
    setFormData({ ...formData, transportType: type });
    setCurrentStep(2);
  };

  const handleEntsorgungTypeSelect = (type: EntsorgungType) => {
    setFormData({ ...formData, entsorgungType: type });
    setCurrentStep(2);
  };

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData({ ...formData, ...updates });
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminEmail === ADMIN_EMAIL && adminPassword === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setLoginError('');
      setCurrentView('admin-dashboard');
    } else {
      setLoginError('Ungültige E-Mail oder Passwort');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setCurrentView('home');
    setAdminEmail('');
    setAdminPassword('');
  };

  const submitInquiry = () => {
    if (!formData.email || !isValidEmail(formData.email)) {
      setEmailError('Bitte geben Sie eine gültige E-Mail-Adresse ein');
      return;
    }
    addInquiry(formData);
    setCurrentView('success');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const currentImages = formData.images || [];
    const remainingSlots = 10 - currentImages.length;
    
    if (remainingSlots <= 0) {
      alert('Maximal 10 Bilder erlaubt');
      return;
    }

    const filesToProcess = Math.min(files.length, remainingSlots);
    const newImages: string[] = [];

    Array.from(files).slice(0, filesToProcess).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newImages.push(reader.result as string);
        if (newImages.length === filesToProcess) {
          updateFormData({ images: [...currentImages, ...newImages] });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const currentImages = formData.images || [];
    updateFormData({ 
      images: currentImages.filter((_, i) => i !== index) 
    });
  };

  const getTotalSteps = () => {
    switch (formData.serviceType) {
      case 'umzug':
        return 8; // +1 for images
      case 'transport':
        return 6; // +1 for images
      case 'entsorgung':
        return 6; // +1 for images
      default:
        return 5;
    }
  };

  const getProgress = () => {
    return ((currentStep) / getTotalSteps()) * 100;
  };

  const filteredInquiries = inquiries.filter((inquiry) => {
    const matchesStatus = filterStatus === 'all' || inquiry.status === filterStatus;
    const matchesSearch = 
      inquiry.formData.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.formData.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.formData.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.formData.pickupAddress?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      setCurrentView('home');
      setCurrentStep(0);
    }
  };

  // Render Home View
  const renderHome = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="LoadUP" 
              className="w-auto transition-all"
              style={{ height: `${settings.logoSize}px` }}
            />
          </div>
          <div className="flex items-center gap-6 text-sm text-blue-700">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-500" />
              <span>{inquiries.length > 0 ? inquiries.length + 150 : 150}+ Anfragen bearbeitet</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-500" />
              <span>Nur Berlin & Umgebung</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
            Ihr Umzugspartner in Berlin
          </h1>
          <p className="text-xl text-blue-600 max-w-2xl mx-auto mb-4">
            In wenigen Klicks zu Ihrem kostenlosen & unverbindlichen Angebot
          </p>
          <div className="flex items-center justify-center gap-2 text-blue-500">
            <Phone className="w-4 h-4" />
            <span className="font-medium">Fragen? Rufen Sie uns an: 0152 18879232</span>
          </div>
          <p className="text-sm text-blue-400 mt-1">Wir sind für Sie da - jederzeit erreichbar!</p>
        </div>

        {/* Service Selection */}
        <Card className="p-8 shadow-xl border-0 bg-white/95 backdrop-blur">
          <h2 className="text-2xl font-semibold text-center mb-8 text-blue-900">
            Welche Dienstleistung benötigen Sie?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => handleServiceSelect('umzug')}
              className="selection-card group p-6 rounded-xl border-2 border-blue-100 bg-white hover:border-blue-400 text-left transition-all"
            >
              <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mb-4 group-hover:bg-blue-500 transition-colors">
                <Home className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Umzug</h3>
              <p className="text-sm text-blue-500">Privat oder Gewerbe - nur in Berlin</p>
            </button>

            <button
              onClick={() => handleServiceSelect('transport')}
              className="selection-card group p-6 rounded-xl border-2 border-blue-100 bg-white hover:border-blue-400 text-left transition-all"
            >
              <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mb-4 group-hover:bg-blue-500 transition-colors">
                <Truck className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Transport</h3>
              <p className="text-sm text-blue-500">Möbel, Waren oder Sondertransporte</p>
            </button>

            <button
              onClick={() => handleServiceSelect('entsorgung')}
              className="selection-card group p-6 rounded-xl border-2 border-blue-100 bg-white hover:border-blue-400 text-left transition-all"
            >
              <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mb-4 group-hover:bg-blue-500 transition-colors">
                <Trash2 className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Entsorgung</h3>
              <p className="text-sm text-blue-500">Sperrmüll, Haushaltsauflösung & mehr</p>
            </button>
          </div>
        </Card>

        {/* Trust Indicators */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="flex items-center justify-center gap-3 text-blue-700">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Check className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium">Kostenlos & unverbindlich</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-blue-700">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium">Antwort in max. 1 Stunde</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-blue-700">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Lock className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium">SSL-verschlüsselt</span>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mt-10 text-center">
          <Card className="p-6 bg-blue-600 text-white border-0">
            <h3 className="text-xl font-semibold mb-2">Haben Sie Fragen?</h3>
            <p className="text-blue-100 mb-4">Rufen Sie uns an oder schreiben Sie uns - wir helfen Ihnen gerne!</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="tel:015218879232" className="flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                <Phone className="w-5 h-5" />
                0152 18879232
              </a>
              <a href="mailto:loadup313@gmail.com" className="flex items-center gap-2 bg-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-800 transition-colors">
                <Mail className="w-5 h-5" />
                loadup313@gmail.com
              </a>
            </div>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-blue-100 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Contact Info */}
            <div>
              <h4 className="font-semibold text-blue-900 mb-4">Kontakt</h4>
              <div className="space-y-2 text-sm text-blue-600">
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:loadup313@gmail.com" className="hover:text-blue-800">loadup313@gmail.com</a>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <a href="tel:015218879232" className="hover:text-blue-800">0152 18879232</a>
                </p>
              </div>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-blue-900 mb-4">Links</h4>
              <div className="space-y-2 text-sm">
                <button 
                  onClick={() => setCurrentView('datenschutz')}
                  className="block text-blue-600 hover:text-blue-800"
                >
                  Datenschutz
                </button>
                <button 
                  onClick={() => setCurrentView('admin-login')}
                  className="text-blue-400 hover:text-blue-600 text-xs"
                >
                  Admin
                </button>
              </div>
            </div>
            
            {/* Social Media */}
            <div>
              <h4 className="font-semibold text-blue-900 mb-4">Folgen Sie uns</h4>
              <div className="flex gap-3">
                {settings.instagramUrl && (
                  <a 
                    href={settings.instagramUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {settings.tiktokUrl && (
                  <a 
                    href={settings.tiktokUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </a>
                )}
                {settings.facebookUrl && (
                  <a 
                    href={settings.facebookUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
          
          <div className="border-t border-blue-100 pt-6 text-center text-sm text-blue-500">
            © 2026 LoadUP - Alle Rechte vorbehalten
          </div>
        </div>
      </footer>
    </div>
  );

  // Render Questionnaire Steps
  const renderQuestionnaire = () => {
    const totalSteps = getTotalSteps();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header with Logo */}
          <div className="flex items-center justify-between mb-8">
            <button onClick={() => setCurrentView('home')} className="flex items-center gap-2">
              <img 
                src="/logo.png" 
                alt="LoadUP" 
                className="w-auto"
                style={{ height: `${settings.logoSize * 0.8}px` }}
              />
            </button>
            <button 
              onClick={handleBack}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Zurück
            </button>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm text-blue-600 mb-2">
              <span>Schritt {currentStep} von {totalSteps}</span>
              <span>{Math.round(getProgress())}%</span>
            </div>
            <Progress value={getProgress()} className="h-2 bg-blue-100" />
          </div>

          {/* Step Content */}
          <Card className="p-8 shadow-xl border-0 bg-white/95 backdrop-blur fade-in">
            {formData.serviceType === 'umzug' && renderUmzugSteps()}
            {formData.serviceType === 'transport' && renderTransportSteps()}
            {formData.serviceType === 'entsorgung' && renderEntsorgungSteps()}
          </Card>
        </div>
      </div>
    );
  };

  // Image Upload Component
  const renderImageUpload = (nextStep: number) => {
    const images = formData.images || [];
    
    return (
      <div>
        <h2 className="text-2xl font-semibold mb-2 text-blue-900">Bilder hochladen</h2>
        <p className="text-blue-600 mb-6">
          Laden Sie Bilder Ihrer Gegenstände hoch (mindestens 1, maximal 10 Bilder)
        </p>
        
        <div className="space-y-6">
          {/* Upload Area */}
          <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <p className="text-blue-700 font-medium">Klicken Sie hier um Bilder hochzuladen</p>
              <p className="text-blue-400 text-sm mt-1">oder drag & drop</p>
            </label>
          </div>
          
          {/* Image Preview */}
          {images.length > 0 && (
            <div>
              <p className="text-sm text-blue-600 mb-3">{images.length} von 10 Bildern</p>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {images.map((img, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-blue-200">
                    <img src={img} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <Button
          onClick={() => setCurrentStep(nextStep)}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
          disabled={images.length < 1}
        >
          Weiter
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        
        {images.length < 1 && (
          <p className="text-sm text-amber-600 text-center mt-2">
            Bitte laden Sie mindestens 1 Bild hoch
          </p>
        )}
      </div>
    );
  };

  // Umzug Questionnaire Steps
  const renderUmzugSteps = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h2 className="text-2xl font-semibold mb-6 text-blue-900">Umzugsart</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => handleUmzugTypeSelect('privat')}
                className={`selection-card p-6 rounded-xl border-2 text-left transition-all ${
                  formData.umzugType === 'privat' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-blue-100 hover:border-blue-300'
                }`}
              >
                <Home className="w-8 h-8 text-blue-500 mb-3" />
                <h3 className="font-semibold text-blue-900">Privatumzug</h3>
                <p className="text-sm text-blue-500 mt-1">Umzug in eine neue Wohnung oder Haus</p>
              </button>
              <button
                onClick={() => handleUmzugTypeSelect('geschaeftlich')}
                className={`selection-card p-6 rounded-xl border-2 text-left transition-all ${
                  formData.umzugType === 'geschaeftlich' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-blue-100 hover:border-blue-300'
                }`}
              >
                <Building2 className="w-8 h-8 text-blue-500 mb-3" />
                <h3 className="font-semibold text-blue-900">Gewerbeumzug</h3>
                <p className="text-sm text-blue-500 mt-1">Büro- oder Geschäftsumzug</p>
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h2 className="text-2xl font-semibold mb-2 text-blue-900">Abholort</h2>
            <p className="text-blue-600 mb-6">Wo sollen wir die Gegenstände abholen?</p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="pickupAddress">Straße und Hausnummer</Label>
                <Input
                  id="pickupAddress"
                  value={formData.pickupAddress || ''}
                  onChange={(e) => updateFormData({ pickupAddress: e.target.value })}
                  placeholder="z.B. Musterstraße 12"
                  className="mt-1 border-blue-200 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pickupZip">PLZ (Berlin)</Label>
                  <Input
                    id="pickupZip"
                    value={formData.pickupZip || ''}
                    onChange={(e) => updateFormData({ pickupZip: e.target.value })}
                    placeholder="10115"
                    className="mt-1 border-blue-200 focus:border-blue-500"
                  />
                </div>
                <div>
                  <Label htmlFor="pickupCity">Ort</Label>
                  <Input
                    id="pickupCity"
                    value={formData.pickupCity || 'Berlin'}
                    onChange={(e) => updateFormData({ pickupCity: e.target.value })}
                    placeholder="Berlin"
                    className="mt-1 border-blue-200 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <Label>Stockwerk</Label>
                <div className="grid grid-cols-4 gap-2 mt-1">
                  {['EG', '1.', '2.', '3.', '4.', '5+'].map((floor) => (
                    <button
                      key={floor}
                      onClick={() => updateFormData({ pickupFloor: floor })}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        formData.pickupFloor === floor
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-blue-100 hover:border-blue-300'
                      }`}
                    >
                      {floor}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.pickupElevator || false}
                    onCheckedChange={(checked) => updateFormData({ pickupElevator: checked as boolean })}
                  />
                  <span>Aufzug vorhanden</span>
                </Label>
              </div>
            </div>
            <Button
              onClick={() => setCurrentStep(3)}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
              disabled={!formData.pickupAddress || !formData.pickupZip}
            >
              Weiter
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        );

      case 3:
        return (
          <div>
            <h2 className="text-2xl font-semibold mb-2 text-blue-900">Zieladresse</h2>
            <p className="text-blue-600 mb-6">Wohin soll transportiert werden?</p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="destinationAddress">Straße und Hausnummer</Label>
                <Input
                  id="destinationAddress"
                  value={formData.destinationAddress || ''}
                  onChange={(e) => updateFormData({ destinationAddress: e.target.value })}
                  placeholder="z.B. Beispielweg 5"
                  className="mt-1 border-blue-200 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="destinationZip">PLZ (Berlin)</Label>
                  <Input
                    id="destinationZip"
                    value={formData.destinationZip || ''}
                    onChange={(e) => updateFormData({ destinationZip: e.target.value })}
                    placeholder="10785"
                    className="mt-1 border-blue-200 focus:border-blue-500"
                  />
                </div>
                <div>
                  <Label htmlFor="destinationCity">Ort</Label>
                  <Input
                    id="destinationCity"
                    value={formData.destinationCity || 'Berlin'}
                    onChange={(e) => updateFormData({ destinationCity: e.target.value })}
                    placeholder="Berlin"
                    className="mt-1 border-blue-200 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <Label>Stockwerk</Label>
                <div className="grid grid-cols-4 gap-2 mt-1">
                  {['EG', '1.', '2.', '3.', '4.', '5+'].map((floor) => (
                    <button
                      key={floor}
                      onClick={() => updateFormData({ destinationFloor: floor })}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        formData.destinationFloor === floor
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-blue-100 hover:border-blue-300'
                      }`}
                    >
                      {floor}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.destinationElevator || false}
                    onCheckedChange={(checked) => updateFormData({ destinationElevator: checked as boolean })}
                  />
                  <span>Aufzug vorhanden</span>
                </Label>
              </div>
            </div>
            <Button
              onClick={() => setCurrentStep(4)}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
              disabled={!formData.destinationAddress || !formData.destinationZip}
            >
              Weiter
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        );

      case 4:
        return (
          <div>
            <h2 className="text-2xl font-semibold mb-2 text-blue-900">Wohnungsdetails</h2>
            <p className="text-blue-600 mb-6">Wie groß ist Ihre aktuelle Wohnung?</p>
            <div className="space-y-6">
              <div>
                <Label className="mb-3 block">Wohnfläche (ca.)</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {['Unter 50 m²', '50-80 m²', '80-120 m²', '120-150 m²', 'Über 150 m²'].map((size) => (
                    <button
                      key={size}
                      onClick={() => updateFormData({ livingSpace: size })}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${
                        formData.livingSpace === size
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-blue-100 hover:border-blue-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="mb-3 block">Anzahl der Zimmer</Label>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {['1', '2', '3', '4', '5+'].map((room) => (
                    <button
                      key={room}
                      onClick={() => updateFormData({ rooms: room })}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${
                        formData.rooms === room
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-blue-100 hover:border-blue-300'
                      }`}
                    >
                      {room} {room === '1' ? 'Zimmer' : 'Zimmer'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <Button
              onClick={() => setCurrentStep(5)}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
              disabled={!formData.livingSpace || !formData.rooms}
            >
              Weiter
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        );

      case 5:
        return (
          <div>
            <h2 className="text-2xl font-semibold mb-2 text-blue-900">Zusatzleistungen</h2>
            <p className="text-blue-600 mb-6">Benötigen Sie zusätzliche Services?</p>
            <div className="space-y-4">
              <Label className="flex items-start gap-3 p-4 rounded-xl border-2 border-blue-100 hover:border-blue-300 cursor-pointer transition-all">
                <Checkbox
                  checked={formData.needsPacking || false}
                  onCheckedChange={(checked) => updateFormData({ needsPacking: checked as boolean })}
                  className="mt-1"
                />
                <div>
                  <span className="font-semibold text-blue-900 block">Pack-Service</span>
                  <span className="text-sm text-blue-500">Wir packen Ihre Gegenstände professionell ein</span>
                </div>
              </Label>
              <Label className="flex items-start gap-3 p-4 rounded-xl border-2 border-blue-100 hover:border-blue-300 cursor-pointer transition-all">
                <Checkbox
                  checked={formData.needsStorage || false}
                  onCheckedChange={(checked) => updateFormData({ needsStorage: checked as boolean })}
                  className="mt-1"
                />
                <div>
                  <span className="font-semibold text-blue-900 block">Einlagerung</span>
                  <span className="text-sm text-blue-500">Zwischenlagerung Ihrer Möbel</span>
                </div>
              </Label>
              <Label className="flex items-start gap-3 p-4 rounded-xl border-2 border-blue-100 hover:border-blue-300 cursor-pointer transition-all">
                <Checkbox
                  checked={formData.needsCleaning || false}
                  onCheckedChange={(checked) => updateFormData({ needsCleaning: checked as boolean })}
                  className="mt-1"
                />
                <div>
                  <span className="font-semibold text-blue-900 block">Endreinigung</span>
                  <span className="text-sm text-blue-500">Professionelle Wohnungsreinigung</span>
                </div>
              </Label>
            </div>
            <Button
              onClick={() => setCurrentStep(6)}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
            >
              Weiter
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        );

      case 6:
        return (
          <div>
            <h2 className="text-2xl font-semibold mb-2 text-blue-900">Wunschtermin</h2>
            <p className="text-blue-600 mb-6">Wann soll der Umzug stattfinden?</p>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => updateFormData({ dateType: 'fixed' })}
                  className={`p-6 rounded-xl border-2 text-left transition-all ${
                    formData.dateType === 'fixed'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-blue-100 hover:border-blue-300'
                  }`}
                >
                  <Calendar className="w-8 h-8 text-blue-500 mb-3" />
                  <h3 className="font-semibold text-blue-900">Festes Datum</h3>
                  <p className="text-sm text-blue-500 mt-1">Ich habe ein bestimmtes Datum</p>
                </button>
                <button
                  onClick={() => updateFormData({ dateType: 'flexible', flexibleDate: true })}
                  className={`p-6 rounded-xl border-2 text-left transition-all ${
                    formData.dateType === 'flexible'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-blue-100 hover:border-blue-300'
                  }`}
                >
                  <Clock className="w-8 h-8 text-blue-500 mb-3" />
                  <h3 className="font-semibold text-blue-900">Flexibel</h3>
                  <p className="text-sm text-blue-500 mt-1">Ich bin zeitlich flexibel</p>
                </button>
              </div>
              {formData.dateType === 'fixed' && (
                <div className="mt-4">
                  <Label htmlFor="moveDate">Wunschdatum</Label>
                  <Input
                    id="moveDate"
                    type="date"
                    value={formData.moveDate || ''}
                    onChange={(e) => updateFormData({ moveDate: e.target.value })}
                    className="mt-1 border-blue-200 focus:border-blue-500"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              )}
            </div>
            <Button
              onClick={() => setCurrentStep(7)}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
              disabled={!formData.dateType || (formData.dateType === 'fixed' && !formData.moveDate)}
            >
              Weiter
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        );

      case 7:
        return renderImageUpload(8);

      case 8:
        return renderContactForm();

      default:
        return null;
    }
  };

  // Transport Questionnaire Steps
  const renderTransportSteps = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h2 className="text-2xl font-semibold mb-6 text-blue-900">Transportart</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => handleTransportTypeSelect('mobel')}
                className={`selection-card p-6 rounded-xl border-2 text-left transition-all ${
                  formData.transportType === 'mobel' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-blue-100 hover:border-blue-300'
                }`}
              >
                <Home className="w-8 h-8 text-blue-500 mb-3" />
                <h3 className="font-semibold text-blue-900">Möbeltransport</h3>
                <p className="text-sm text-blue-500 mt-1">Einzelne Möbelstücke</p>
              </button>
              <button
                onClick={() => handleTransportTypeSelect('waren')}
                className={`selection-card p-6 rounded-xl border-2 text-left transition-all ${
                  formData.transportType === 'waren' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-blue-100 hover:border-blue-300'
                }`}
              >
                <Package className="w-8 h-8 text-blue-500 mb-3" />
                <h3 className="font-semibold text-blue-900">Warentransport</h3>
                <p className="text-sm text-blue-500 mt-1">Pakete, Paletten, Geschäftswaren</p>
              </button>
              <button
                onClick={() => handleTransportTypeSelect('sonstiges')}
                className={`selection-card p-6 rounded-xl border-2 text-left transition-all ${
                  formData.transportType === 'sonstiges' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-blue-100 hover:border-blue-300'
                }`}
              >
                <Package className="w-8 h-8 text-blue-500 mb-3" />
                <h3 className="font-semibold text-blue-900">Sondertransport</h3>
                <p className="text-sm text-blue-500 mt-1">Andere Transportgüter</p>
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h2 className="text-2xl font-semibold mb-2 text-blue-900">Abholort</h2>
            <p className="text-blue-600 mb-6">Wo soll abgeholt werden?</p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="pickupAddress">Straße und Hausnummer</Label>
                <Input
                  id="pickupAddress"
                  value={formData.pickupAddress || ''}
                  onChange={(e) => updateFormData({ pickupAddress: e.target.value })}
                  placeholder="z.B. Musterstraße 12"
                  className="mt-1 border-blue-200 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pickupZip">PLZ (Berlin)</Label>
                  <Input
                    id="pickupZip"
                    value={formData.pickupZip || ''}
                    onChange={(e) => updateFormData({ pickupZip: e.target.value })}
                    placeholder="10115"
                    className="mt-1 border-blue-200 focus:border-blue-500"
                  />
                </div>
                <div>
                  <Label htmlFor="pickupCity">Ort</Label>
                  <Input
                    id="pickupCity"
                    value={formData.pickupCity || 'Berlin'}
                    onChange={(e) => updateFormData({ pickupCity: e.target.value })}
                    placeholder="Berlin"
                    className="mt-1 border-blue-200 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
            <Button
              onClick={() => setCurrentStep(3)}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
              disabled={!formData.pickupAddress || !formData.pickupZip}
            >
              Weiter
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        );

      case 3:
        return (
          <div>
            <h2 className="text-2xl font-semibold mb-2 text-blue-900">Zieladresse</h2>
            <p className="text-blue-600 mb-6">Wohin soll transportiert werden?</p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="destinationAddress">Straße und Hausnummer</Label>
                <Input
                  id="destinationAddress"
                  value={formData.destinationAddress || ''}
                  onChange={(e) => updateFormData({ destinationAddress: e.target.value })}
                  placeholder="z.B. Beispielweg 5"
                  className="mt-1 border-blue-200 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="destinationZip">PLZ (Berlin)</Label>
                  <Input
                    id="destinationZip"
                    value={formData.destinationZip || ''}
                    onChange={(e) => updateFormData({ destinationZip: e.target.value })}
                    placeholder="10785"
                    className="mt-1 border-blue-200 focus:border-blue-500"
                  />
                </div>
                <div>
                  <Label htmlFor="destinationCity">Ort</Label>
                  <Input
                    id="destinationCity"
                    value={formData.destinationCity || 'Berlin'}
                    onChange={(e) => updateFormData({ destinationCity: e.target.value })}
                    placeholder="Berlin"
                    className="mt-1 border-blue-200 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
            <Button
              onClick={() => setCurrentStep(4)}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
              disabled={!formData.destinationAddress || !formData.destinationZip}
            >
              Weiter
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        );

      case 4:
        return (
          <div>
            <h2 className="text-2xl font-semibold mb-2 text-blue-900">Transportdetails</h2>
            <p className="text-blue-600 mb-6">Beschreiben Sie die zu transportierenden Gegenstände</p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="transportItems">Was soll transportiert werden?</Label>
                <Textarea
                  id="transportItems"
                  value={formData.transportItems || ''}
                  onChange={(e) => updateFormData({ transportItems: e.target.value })}
                  placeholder="z.B. 1 Sofa, 2 Sessel, 1 Kleiderschrank..."
                  className="mt-1 min-h-[100px] border-blue-200 focus:border-blue-500"
                />
              </div>
              <div>
                <Label htmlFor="transportWeight">Geschätztes Gewicht (optional)</Label>
                <Input
                  id="transportWeight"
                  value={formData.transportWeight || ''}
                  onChange={(e) => updateFormData({ transportWeight: e.target.value })}
                  placeholder="z.B. ca. 200 kg"
                  className="mt-1 border-blue-200 focus:border-blue-500"
                />
              </div>
              <div>
                <Label>Wunschtermin</Label>
                <Input
                  type="date"
                  value={formData.moveDate || ''}
                  onChange={(e) => updateFormData({ moveDate: e.target.value })}
                  className="mt-1 border-blue-200 focus:border-blue-500"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            <Button
              onClick={() => setCurrentStep(5)}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
              disabled={!formData.transportItems}
            >
              Weiter
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        );

      case 5:
        return renderImageUpload(6);

      case 6:
        return renderContactForm();

      default:
        return null;
    }
  };

  // Entsorgung Questionnaire Steps
  const renderEntsorgungSteps = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h2 className="text-2xl font-semibold mb-6 text-blue-900">Entsorgungsart</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => handleEntsorgungTypeSelect('sperrmull')}
                className={`selection-card p-6 rounded-xl border-2 text-left transition-all ${
                  formData.entsorgungType === 'sperrmull' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-blue-100 hover:border-blue-300'
                }`}
              >
                <Home className="w-8 h-8 text-blue-500 mb-3" />
                <h3 className="font-semibold text-blue-900">Sperrmüll</h3>
                <p className="text-sm text-blue-500 mt-1">Möbel, Matratzen, Elektrogeräte</p>
              </button>
              <button
                onClick={() => handleEntsorgungTypeSelect('haushaltsauflosung')}
                className={`selection-card p-6 rounded-xl border-2 text-left transition-all ${
                  formData.entsorgungType === 'haushaltsauflosung' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-blue-100 hover:border-blue-300'
                }`}
              >
                <Trash2 className="w-8 h-8 text-blue-500 mb-3" />
                <h3 className="font-semibold text-blue-900">Haushaltsauflösung</h3>
                <p className="text-sm text-blue-500 mt-1">Komplette Wohnungsräumung</p>
              </button>
              <button
                onClick={() => handleEntsorgungTypeSelect('bauschutt')}
                className={`selection-card p-6 rounded-xl border-2 text-left transition-all ${
                  formData.entsorgungType === 'bauschutt' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-blue-100 hover:border-blue-300'
                }`}
              >
                <Building2 className="w-8 h-8 text-blue-500 mb-3" />
                <h3 className="font-semibold text-blue-900">Bauschutt</h3>
                <p className="text-sm text-blue-500 mt-1">Renovierungsabfälle, Fliesen, Holz</p>
              </button>
              <button
                onClick={() => handleEntsorgungTypeSelect('gartenabfall')}
                className={`selection-card p-6 rounded-xl border-2 text-left transition-all ${
                  formData.entsorgungType === 'gartenabfall' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-blue-100 hover:border-blue-300'
                }`}
              >
                <Package className="w-8 h-8 text-blue-500 mb-3" />
                <h3 className="font-semibold text-blue-900">Gartenabfall</h3>
                <p className="text-sm text-blue-500 mt-1">Äste, Laub, Rasenschnitt</p>
              </button>
              <button
                onClick={() => handleEntsorgungTypeSelect('elektro')}
                className={`selection-card p-6 rounded-xl border-2 text-left transition-all ${
                  formData.entsorgungType === 'elektro' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-blue-100 hover:border-blue-300'
                }`}
              >
                <Package className="w-8 h-8 text-blue-500 mb-3" />
                <h3 className="font-semibold text-blue-900">Elektroschrott</h3>
                <p className="text-sm text-blue-500 mt-1">Computer, TVs, Kühlschränke</p>
              </button>
              <button
                onClick={() => handleEntsorgungTypeSelect('sonstiges')}
                className={`selection-card p-6 rounded-xl border-2 text-left transition-all ${
                  formData.entsorgungType === 'sonstiges' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-blue-100 hover:border-blue-300'
                }`}
              >
                <Package className="w-8 h-8 text-blue-500 mb-3" />
                <h3 className="font-semibold text-blue-900">Sonstiges</h3>
                <p className="text-sm text-blue-500 mt-1">Andere Entsorgungsgüter</p>
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h2 className="text-2xl font-semibold mb-2 text-blue-900">Abholort</h2>
            <p className="text-blue-600 mb-6">Wo befindet sich der Abfall?</p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="pickupAddress">Straße und Hausnummer</Label>
                <Input
                  id="pickupAddress"
                  value={formData.pickupAddress || ''}
                  onChange={(e) => updateFormData({ pickupAddress: e.target.value })}
                  placeholder="z.B. Musterstraße 12"
                  className="mt-1 border-blue-200 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pickupZip">PLZ (Berlin)</Label>
                  <Input
                    id="pickupZip"
                    value={formData.pickupZip || ''}
                    onChange={(e) => updateFormData({ pickupZip: e.target.value })}
                    placeholder="10115"
                    className="mt-1 border-blue-200 focus:border-blue-500"
                  />
                </div>
                <div>
                  <Label htmlFor="pickupCity">Ort</Label>
                  <Input
                    id="pickupCity"
                    value={formData.pickupCity || 'Berlin'}
                    onChange={(e) => updateFormData({ pickupCity: e.target.value })}
                    placeholder="Berlin"
                    className="mt-1 border-blue-200 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <Label>Stockwerk</Label>
                <div className="grid grid-cols-4 gap-2 mt-1">
                  {['EG', '1.', '2.', '3.', '4.', '5+'].map((floor) => (
                    <button
                      key={floor}
                      onClick={() => updateFormData({ pickupFloor: floor })}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        formData.pickupFloor === floor
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-blue-100 hover:border-blue-300'
                      }`}
                    >
                      {floor}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.pickupElevator || false}
                    onCheckedChange={(checked) => updateFormData({ pickupElevator: checked as boolean })}
                  />
                  <span>Aufzug vorhanden</span>
                </Label>
              </div>
            </div>
            <Button
              onClick={() => setCurrentStep(3)}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
              disabled={!formData.pickupAddress || !formData.pickupZip}
            >
              Weiter
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        );

      case 3:
        return (
          <div>
            <h2 className="text-2xl font-semibold mb-2 text-blue-900">Mengenangabe</h2>
            <p className="text-blue-600 mb-6">Wie viel Abfall soll entsorgt werden?</p>
            <div className="space-y-4">
              <div>
                <Label className="mb-3 block">Geschätzte Menge</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {['Wenig (bis 1 m³)', 'Mittel (1-3 m³)', 'Viel (3-5 m³)', 'Sehr viel (5+ m³)'].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => updateFormData({ wasteAmount: amount })}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${
                        formData.wasteAmount === amount
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-blue-100 hover:border-blue-300'
                      }`}
                    >
                      {amount}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="additionalInfo">Beschreibung (optional)</Label>
                <Textarea
                  id="additionalInfo"
                  value={formData.additionalInfo || ''}
                  onChange={(e) => updateFormData({ additionalInfo: e.target.value })}
                  placeholder="Beschreiben Sie die zu entsorgenden Gegenstände..."
                  className="mt-1 min-h-[100px] border-blue-200 focus:border-blue-500"
                />
              </div>
            </div>
            <Button
              onClick={() => setCurrentStep(4)}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
              disabled={!formData.wasteAmount}
            >
              Weiter
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        );

      case 4:
        return (
          <div>
            <h2 className="text-2xl font-semibold mb-2 text-blue-900">Wunschtermin</h2>
            <p className="text-blue-600 mb-6">Wann soll die Entsorgung erfolgen?</p>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => updateFormData({ dateType: 'fixed' })}
                  className={`p-6 rounded-xl border-2 text-left transition-all ${
                    formData.dateType === 'fixed'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-blue-100 hover:border-blue-300'
                  }`}
                >
                  <Calendar className="w-8 h-8 text-blue-500 mb-3" />
                  <h3 className="font-semibold text-blue-900">Festes Datum</h3>
                  <p className="text-sm text-blue-500 mt-1">Ich habe ein bestimmtes Datum</p>
                </button>
                <button
                  onClick={() => updateFormData({ dateType: 'flexible', flexibleDate: true })}
                  className={`p-6 rounded-xl border-2 text-left transition-all ${
                    formData.dateType === 'flexible'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-blue-100 hover:border-blue-300'
                  }`}
                >
                  <Clock className="w-8 h-8 text-blue-500 mb-3" />
                  <h3 className="font-semibold text-blue-900">Flexibel</h3>
                  <p className="text-sm text-blue-500 mt-1">Ich bin zeitlich flexibel</p>
                </button>
              </div>
              {formData.dateType === 'fixed' && (
                <div className="mt-4">
                  <Label htmlFor="moveDate">Wunschdatum</Label>
                  <Input
                    id="moveDate"
                    type="date"
                    value={formData.moveDate || ''}
                    onChange={(e) => updateFormData({ moveDate: e.target.value })}
                    className="mt-1 border-blue-200 focus:border-blue-500"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              )}
            </div>
            <Button
              onClick={() => setCurrentStep(5)}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
              disabled={!formData.dateType || (formData.dateType === 'fixed' && !formData.moveDate)}
            >
              Weiter
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        );

      case 5:
        return renderImageUpload(6);

      case 6:
        return renderContactForm();

      default:
        return null;
    }
  };

  // Contact Form (Final Step)
  const renderContactForm = () => {
    const validateEmail = (email: string) => {
      if (email && !isValidEmail(email)) {
        setEmailError('Bitte geben Sie eine gültige E-Mail-Adresse ein (mit @)');
      } else {
        setEmailError('');
      }
    };

    return (
      <div>
        <h2 className="text-2xl font-semibold mb-2 text-blue-900">Ihre Kontaktdaten</h2>
        <p className="text-blue-600 mb-6">Wie können wir Sie erreichen?</p>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Vorname</Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                <Input
                  id="firstName"
                  value={formData.firstName || ''}
                  onChange={(e) => updateFormData({ firstName: e.target.value })}
                  placeholder="Max"
                  className="pl-10 border-blue-200 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="lastName">Nachname</Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                <Input
                  id="lastName"
                  value={formData.lastName || ''}
                  onChange={(e) => updateFormData({ lastName: e.target.value })}
                  placeholder="Mustermann"
                  className="pl-10 border-blue-200 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="email">E-Mail-Adresse</Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => {
                  updateFormData({ email: e.target.value });
                  validateEmail(e.target.value);
                }}
                placeholder="max.mustermann@email.de"
                className="pl-10 border-blue-200 focus:border-blue-500"
              />
            </div>
            {emailError && (
              <p className="text-sm text-red-500 mt-1">{emailError}</p>
            )}
          </div>
          <div>
            <Label htmlFor="phone">Telefonnummer</Label>
            <div className="relative mt-1">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
              <Input
                id="phone"
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => updateFormData({ phone: e.target.value })}
                placeholder="+49 170 1234567"
                className="pl-10 border-blue-200 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="additionalInfo">Zusätzliche Informationen (optional)</Label>
            <Textarea
              id="additionalInfo"
              value={formData.additionalInfo || ''}
              onChange={(e) => updateFormData({ additionalInfo: e.target.value })}
              placeholder="Haben Sie noch weitere Wünsche oder Anmerkungen?"
              className="mt-1 min-h-[100px] border-blue-200 focus:border-blue-500"
            />
          </div>
        </div>
        <Button
          onClick={submitInquiry}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
          disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !isValidEmail(formData.email || '')}
        >
          Anfrage kostenlos absenden
          <Check className="w-4 h-4 ml-2" />
        </Button>
        <p className="text-xs text-blue-500 text-center mt-4">
          Mit dem Absenden stimmen Sie unserer Datenschutzerklärung zu.
        </p>
      </div>
    );
  };

  // Success View
  const renderSuccess = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center shadow-xl border-0 bg-white/95 backdrop-blur fade-in">
        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-blue-900 mb-4">
          Vielen Dank für Ihre Anfrage!
        </h2>
        <p className="text-blue-600 mb-4">
          Ich werde mich in maximal 1 Stunde bei Ihnen melden.
        </p>
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <p className="text-blue-700 font-medium">
            Bitte überprüfen Sie Ihre E-Mail ({formData.email}) für unser Angebot mit dem Preis.
          </p>
        </div>
        <div className="bg-slate-50 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-slate-500 mb-1">Anfrage-ID:</p>
          <p className="font-mono text-slate-700">#{inquiries[0]?.id.slice(-6) || '------'}</p>
        </div>
        <Button 
          onClick={() => { setCurrentView('home'); setCurrentStep(0); setFormData(INITIAL_FORM_DATA); setEmailError(''); }} 
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          Zurück zur Startseite
        </Button>
      </Card>
    </div>
  );

  // Datenschutz View
  const renderDatenschutz = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <header className="bg-white/90 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => setCurrentView('home')}>
            <img 
              src="/logo.png" 
              alt="LoadUP" 
              className="w-auto"
              style={{ height: `${settings.logoSize * 0.8}px` }}
            />
          </button>
          <button 
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück
          </button>
        </div>
      </header>
      
      <main className="max-w-3xl mx-auto px-4 py-12">
        <Card className="p-8 shadow-xl border-0 bg-white/95">
          <h1 className="text-3xl font-bold text-blue-900 mb-8">Datenschutz</h1>
          <div className="prose prose-blue max-w-none whitespace-pre-wrap text-blue-800">
            {settings.datenschutzText}
          </div>
        </Card>
      </main>
    </div>
  );

  // Admin Login View
  const renderAdminLogin = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 shadow-xl border-0 bg-white/95 backdrop-blur">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-blue-900">Admin-Bereich</h2>
          <p className="text-blue-600 mt-1">Bitte melden Sie sich an</p>
        </div>
        
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <Label htmlFor="adminEmail">E-Mail</Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
              <Input
                id="adminEmail"
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@loadup.de"
                className="pl-10 border-blue-200 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="adminPassword">Passwort</Label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
              <Input
                id="adminPassword"
                type={showPassword ? 'text' : 'password'}
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-10 pr-10 border-blue-200 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {loginError && (
            <p className="text-sm text-red-500">{loginError}</p>
          )}
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
            Anmelden
          </Button>
        </form>
        
        <Button
          variant="ghost"
          onClick={() => setCurrentView('home')}
          className="w-full mt-4 text-blue-600"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zurück zur Startseite
        </Button>
      </Card>
    </div>
  );

  // Admin Dashboard View
  const renderAdminDashboard = () => (
    <div className="min-h-screen bg-blue-50">
      {/* Admin Header */}
      <header className="bg-white border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="LoadUP" 
              className="w-auto"
              style={{ height: `${settings.logoSize}px` }}
            />
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">Admin</Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowSettings(true)}>
              <Settings className="w-4 h-4 mr-2" />
              Einstellungen
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Abmelden
            </Button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 border-blue-100">
            <p className="text-sm text-blue-500">Gesamtanfragen</p>
            <p className="text-3xl font-bold text-blue-900">{inquiries.length}</p>
          </Card>
          <Card className="p-6 border-blue-100">
            <p className="text-sm text-blue-500">Neue Anfragen</p>
            <p className="text-3xl font-bold text-blue-600">
              {inquiries.filter(i => i.status === 'new').length}
            </p>
          </Card>
          <Card className="p-6 border-blue-100">
            <p className="text-sm text-blue-500">Kontaktiert</p>
            <p className="text-3xl font-bold text-amber-600">
              {inquiries.filter(i => i.status === 'contacted').length}
            </p>
          </Card>
          <Card className="p-6 border-blue-100">
            <p className="text-sm text-blue-500">Abgeschlossen</p>
            <p className="text-3xl font-bold text-green-600">
              {inquiries.filter(i => i.status === 'completed').length}
            </p>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
            <Input
              placeholder="Suchen nach E-Mail, Name oder Adresse..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-blue-200"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'new', 'contacted', 'completed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-blue-600 hover:bg-blue-50 border border-blue-200'
                }`}
              >
                {status === 'all' && 'Alle'}
                {status === 'new' && 'Neu'}
                {status === 'contacted' && 'Kontaktiert'}
                {status === 'completed' && 'Abgeschlossen'}
              </button>
            ))}
          </div>
        </div>

        {/* Inquiries Table */}
        <Card className="overflow-hidden border-blue-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-50 border-b border-blue-100">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-blue-700">Datum</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-blue-700">Kunde</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-blue-700">Service</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-blue-700">Von</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-blue-700">Nach</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-blue-700">Bilder</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-blue-700">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-blue-700">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {filteredInquiries.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-blue-500">
                      Keine Anfragen gefunden
                    </td>
                  </tr>
                ) : (
                  filteredInquiries.map((inquiry) => (
                    <tr key={inquiry.id} className="border-b border-blue-50 hover:bg-blue-50/50">
                      <td className="px-4 py-3 text-sm text-blue-600">
                        {new Date(inquiry.timestamp).toLocaleDateString('de-DE')}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-blue-900">
                          {inquiry.formData.firstName} {inquiry.formData.lastName}
                        </p>
                        <p className="text-sm text-blue-500">{inquiry.formData.email}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-blue-600">
                        {inquiry.formData.serviceType === 'umzug' && 'Umzug'}
                        {inquiry.formData.serviceType === 'transport' && 'Transport'}
                        {inquiry.formData.serviceType === 'entsorgung' && 'Entsorgung'}
                      </td>
                      <td className="px-4 py-3 text-sm text-blue-600">
                        {inquiry.formData.pickupAddress}, {inquiry.formData.pickupZip}
                      </td>
                      <td className="px-4 py-3 text-sm text-blue-600">
                        {inquiry.formData.destinationAddress 
                          ? `${inquiry.formData.destinationAddress}, ${inquiry.formData.destinationZip}`
                          : '-'
                        }
                      </td>
                      <td className="px-4 py-3 text-sm text-blue-600">
                        {inquiry.formData.images?.length || 0} Bilder
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className={
                            inquiry.status === 'new'
                              ? 'bg-blue-100 text-blue-700'
                              : inquiry.status === 'contacted'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-green-100 text-green-700'
                          }
                        >
                          {inquiry.status === 'new' && 'Neu'}
                          {inquiry.status === 'contacted' && 'Kontaktiert'}
                          {inquiry.status === 'completed' && 'Abgeschlossen'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedInquiry(inquiry);
                              setShowInquiryDetail(true);
                            }}
                          >
                            <EyeIcon className="w-4 h-4 mr-1" />
                            Details
                          </Button>
                          {inquiry.status === 'new' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateInquiryStatus(inquiry.id, 'contacted')}
                            >
                              Kontaktiert
                            </Button>
                          )}
                          {inquiry.status === 'contacted' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateInquiryStatus(inquiry.id, 'completed')}
                            >
                              Abschließen
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => deleteInquiry(inquiry.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </main>

      {/* Inquiry Detail Dialog */}
      <Dialog open={showInquiryDetail} onOpenChange={setShowInquiryDetail}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl text-blue-900">Anfrage Details</DialogTitle>
          </DialogHeader>
          {selectedInquiry && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-3">Kundendaten</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-500">Name:</span>
                    <p className="text-blue-900">{selectedInquiry.formData.firstName} {selectedInquiry.formData.lastName}</p>
                  </div>
                  <div>
                    <span className="text-blue-500">E-Mail:</span>
                    <p className="text-blue-900">{selectedInquiry.formData.email}</p>
                  </div>
                  <div>
                    <span className="text-blue-500">Telefon:</span>
                    <p className="text-blue-900">{selectedInquiry.formData.phone}</p>
                  </div>
                  <div>
                    <span className="text-blue-500">Datum:</span>
                    <p className="text-blue-900">{new Date(selectedInquiry.timestamp).toLocaleString('de-DE')}</p>
                  </div>
                </div>
              </div>

              {/* Service Details */}
              <div>
                <h3 className="font-semibold text-blue-900 mb-3">Service Details</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-blue-500">Service:</span> {selectedInquiry.formData.serviceType}</p>
                  {selectedInquiry.formData.umzugType && (
                    <p><span className="text-blue-500">Umzugsart:</span> {selectedInquiry.formData.umzugType}</p>
                  )}
                  {selectedInquiry.formData.transportType && (
                    <p><span className="text-blue-500">Transportart:</span> {selectedInquiry.formData.transportType}</p>
                  )}
                  {selectedInquiry.formData.entsorgungType && (
                    <p><span className="text-blue-500">Entsorgungsart:</span> {selectedInquiry.formData.entsorgungType}</p>
                  )}
                </div>
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Abholort</h4>
                  <p className="text-sm text-blue-700">{selectedInquiry.formData.pickupAddress}</p>
                  <p className="text-sm text-blue-700">{selectedInquiry.formData.pickupZip} {selectedInquiry.formData.pickupCity}</p>
                  <p className="text-sm text-blue-500 mt-1">Stockwerk: {selectedInquiry.formData.pickupFloor}</p>
                  <p className="text-sm text-blue-500">Aufzug: {selectedInquiry.formData.pickupElevator ? 'Ja' : 'Nein'}</p>
                </div>
                {selectedInquiry.formData.destinationAddress && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Zieladresse</h4>
                    <p className="text-sm text-blue-700">{selectedInquiry.formData.destinationAddress}</p>
                    <p className="text-sm text-blue-700">{selectedInquiry.formData.destinationZip} {selectedInquiry.formData.destinationCity}</p>
                    <p className="text-sm text-blue-500 mt-1">Stockwerk: {selectedInquiry.formData.destinationFloor}</p>
                    <p className="text-sm text-blue-500">Aufzug: {selectedInquiry.formData.destinationElevator ? 'Ja' : 'Nein'}</p>
                  </div>
                )}
              </div>

              {/* Additional Details */}
              {selectedInquiry.formData.livingSpace && (
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">Wohnungsdetails</h4>
                  <p className="text-sm text-blue-700">Wohnfläche: {selectedInquiry.formData.livingSpace}</p>
                  <p className="text-sm text-blue-700">Zimmer: {selectedInquiry.formData.rooms}</p>
                </div>
              )}

              {selectedInquiry.formData.transportItems && (
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">Transportgüter</h4>
                  <p className="text-sm text-blue-700">{selectedInquiry.formData.transportItems}</p>
                  {selectedInquiry.formData.transportWeight && (
                    <p className="text-sm text-blue-500">Geschätztes Gewicht: {selectedInquiry.formData.transportWeight}</p>
                  )}
                </div>
              )}

              {selectedInquiry.formData.wasteAmount && (
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">Entsorgungsdetails</h4>
                  <p className="text-sm text-blue-700">Menge: {selectedInquiry.formData.wasteAmount}</p>
                </div>
              )}

              {/* Date */}
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Termin</h4>
                <p className="text-sm text-blue-700">
                  {selectedInquiry.formData.dateType === 'fixed' 
                    ? `Festes Datum: ${selectedInquiry.formData.moveDate}` 
                    : 'Zeitlich flexibel'}
                </p>
              </div>

              {/* Images */}
              {selectedInquiry.formData.images && selectedInquiry.formData.images.length > 0 && (
                <div>
                  <h4 className="font-medium text-blue-900 mb-3">Bilder ({selectedInquiry.formData.images.length})</h4>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                    {selectedInquiry.formData.images.map((img, index) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden border border-blue-200">
                        <img src={img} alt={`Bild ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Info */}
              {selectedInquiry.formData.additionalInfo && (
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">Zusätzliche Informationen</h4>
                  <p className="text-sm text-blue-700 whitespace-pre-wrap">{selectedInquiry.formData.additionalInfo}</p>
                </div>
              )}

              {/* Services */}
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Zusatzleistungen</h4>
                <div className="flex gap-2 flex-wrap">
                  {selectedInquiry.formData.needsPacking && (
                    <Badge className="bg-blue-100 text-blue-700">Pack-Service</Badge>
                  )}
                  {selectedInquiry.formData.needsStorage && (
                    <Badge className="bg-blue-100 text-blue-700">Einlagerung</Badge>
                  )}
                  {selectedInquiry.formData.needsCleaning && (
                    <Badge className="bg-blue-100 text-blue-700">Endreinigung</Badge>
                  )}
                  {!selectedInquiry.formData.needsPacking && !selectedInquiry.formData.needsStorage && !selectedInquiry.formData.needsCleaning && (
                    <span className="text-sm text-blue-500">Keine Zusatzleistungen</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl text-blue-900">Einstellungen</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Logo Size */}
            <div>
              <Label className="mb-2 block">Logo Größe: {settings.logoSize}px</Label>
              <Slider
                value={[settings.logoSize]}
                onValueChange={(value) => updateSettings({ logoSize: value[0] })}
                min={32}
                max={120}
                step={4}
              />
            </div>

            {/* Datenschutz Text */}
            <div>
              <Label htmlFor="datenschutz" className="mb-2 block">Datenschutz Text</Label>
              <Textarea
                id="datenschutz"
                value={settings.datenschutzText}
                onChange={(e) => updateSettings({ datenschutzText: e.target.value })}
                className="min-h-[200px] border-blue-200"
              />
            </div>

            {/* Social Media */}
            <div>
              <Label className="mb-2 block">Social Media Links</Label>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="instagram" className="text-sm text-blue-500">Instagram URL</Label>
                  <Input
                    id="instagram"
                    value={settings.instagramUrl}
                    onChange={(e) => updateSettings({ instagramUrl: e.target.value })}
                    placeholder="https://instagram.com/..."
                    className="border-blue-200"
                  />
                </div>
                <div>
                  <Label htmlFor="tiktok" className="text-sm text-blue-500">TikTok URL</Label>
                  <Input
                    id="tiktok"
                    value={settings.tiktokUrl}
                    onChange={(e) => updateSettings({ tiktokUrl: e.target.value })}
                    placeholder="https://tiktok.com/@..."
                    className="border-blue-200"
                  />
                </div>
                <div>
                  <Label htmlFor="facebook" className="text-sm text-blue-500">Facebook URL</Label>
                  <Input
                    id="facebook"
                    value={settings.facebookUrl}
                    onChange={(e) => updateSettings({ facebookUrl: e.target.value })}
                    placeholder="https://facebook.com/..."
                    className="border-blue-200"
                  />
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );

  // Main Render
  return (
    <div>
      {currentView === 'home' && renderHome()}
      {currentView === 'questionnaire' && renderQuestionnaire()}
      {currentView === 'success' && renderSuccess()}
      {currentView === 'admin-login' && renderAdminLogin()}
      {currentView === 'admin-dashboard' && renderAdminDashboard()}
      {currentView === 'datenschutz' && renderDatenschutz()}
    </div>
  );
}

export default App;
