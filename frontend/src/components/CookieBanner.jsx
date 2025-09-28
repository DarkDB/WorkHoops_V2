import React, { useState, useEffect } from 'react';
import { X, Cookie, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true, cannot be disabled
    analytics: false,
    marketing: false,
    personalization: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('workhoops-cookie-consent');
    if (!cookieConsent) {
      // Show banner after a short delay
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    } else {
      // Load saved preferences
      try {
        const savedPreferences = JSON.parse(cookieConsent);
        setPreferences(prev => ({ ...prev, ...savedPreferences }));
      } catch (error) {
        console.error('Error parsing cookie preferences:', error);
      }
    }
  }, []);

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      personalization: true,
    };
    setPreferences(allAccepted);
    savePreferences(allAccepted);
    setShowBanner(false);
  };

  const acceptNecessary = () => {
    const necessaryOnly = {
      necessary: true,
      analytics: false,
      marketing: false,
      personalization: false,
    };
    setPreferences(necessaryOnly);
    savePreferences(necessaryOnly);
    setShowBanner(false);
  };

  const saveCustomPreferences = () => {
    savePreferences(preferences);
    setShowBanner(false);
    setShowSettings(false);
  };

  const savePreferences = (prefs) => {
    localStorage.setItem('workhoops-cookie-consent', JSON.stringify(prefs));
    
    // Here you would typically integrate with your analytics/marketing tools
    if (prefs.analytics) {
      // Initialize analytics (e.g., Google Analytics)
      console.log('Analytics enabled');
    }
    
    if (prefs.marketing) {
      // Initialize marketing tools (e.g., Facebook Pixel)
      console.log('Marketing enabled');
    }
    
    if (prefs.personalization) {
      // Enable personalization features
      console.log('Personalization enabled');
    }
  };

  const updatePreference = (key, value) => {
    if (key === 'necessary') return; // Cannot disable necessary cookies
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  if (!showBanner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-none" data-testid="cookie-banner">
      <Card className="w-full max-w-md bg-white border border-gray-200 shadow-2xl pointer-events-auto animate-in slide-in-from-bottom-4">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Cookie className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Cookies y Privacidad</h3>
                <p className="text-sm text-gray-500">Respetamos tu privacidad</p>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            Utilizamos cookies para mejorar tu experiencia, analizar el tráfico y personalizar el contenido. 
            Puedes gestionar tus preferencias en cualquier momento.
          </p>

          <div className="space-y-3">
            <div className="flex space-x-2">
              <Button 
                onClick={acceptAll}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                data-testid="accept-all-cookies"
              >
                Aceptar todo
              </Button>
              <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="shrink-0"
                    data-testid="cookie-settings"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Configuración de Cookies</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Cookies necesarias</h4>
                          <p className="text-sm text-gray-500">Esenciales para el funcionamiento del sitio</p>
                        </div>
                        <Switch 
                          checked={true} 
                          disabled 
                          data-testid="necessary-cookies-toggle"
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Cookies analíticas</h4>
                          <p className="text-sm text-gray-500">Nos ayudan a mejorar el sitio</p>
                        </div>
                        <Switch 
                          checked={preferences.analytics}
                          onCheckedChange={(checked) => updatePreference('analytics', checked)}
                          data-testid="analytics-cookies-toggle"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Cookies de marketing</h4>
                          <p className="text-sm text-gray-500">Para publicidad personalizada</p>
                        </div>
                        <Switch 
                          checked={preferences.marketing}
                          onCheckedChange={(checked) => updatePreference('marketing', checked)}
                          data-testid="marketing-cookies-toggle"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Personalización</h4>
                          <p className="text-sm text-gray-500">Contenido adaptado a ti</p>
                        </div>
                        <Switch 
                          checked={preferences.personalization}
                          onCheckedChange={(checked) => updatePreference('personalization', checked)}
                          data-testid="personalization-cookies-toggle"
                        />
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 pt-4">
                      <Button 
                        onClick={saveCustomPreferences}
                        className="flex-1 bg-orange-600 hover:bg-orange-700"
                        data-testid="save-cookie-preferences"
                      >
                        Guardar preferencias
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <Button 
              onClick={acceptNecessary}
              variant="ghost"
              className="w-full text-gray-600 hover:text-gray-900"
              data-testid="reject-cookies"
            >
              Solo necesarias
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CookieBanner;