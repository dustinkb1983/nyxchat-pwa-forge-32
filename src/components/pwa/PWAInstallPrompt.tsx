
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, X, Smartphone, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installSource, setInstallSource] = useState<'browser' | 'ios' | 'android'>('browser');

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches || 
          (window.navigator as any).standalone === true) {
        setIsInstalled(true);
        return true;
      }
      return false;
    };

    // Detect platform
    const detectPlatform = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(userAgent)) {
        setInstallSource('ios');
      } else if (/android/.test(userAgent)) {
        setInstallSource('android');
      } else {
        setInstallSource('browser');
      }
    };

    if (checkInstalled()) return;
    detectPlatform();

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show prompt after user has interacted with the app
      setTimeout(() => {
        if (!isInstalled && !sessionStorage.getItem('pwa-prompt-dismissed')) {
          setShowPrompt(true);
        }
      }, 5000); // Wait 5 seconds before showing
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      console.log('NyxChat PWA was installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Show manual installation instructions for iOS
      if (installSource === 'ios') {
        alert('To install NyxChat:\n1. Tap the Share button\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" in the top-right corner');
      }
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
        sessionStorage.setItem('pwa-prompt-dismissed', 'true');
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('Error during PWA installation:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  const getInstallText = () => {
    switch (installSource) {
      case 'ios':
        return 'Add to Home Screen';
      case 'android':
        return 'Install App';
      default:
        return 'Install NyxChat';
    }
  };

  const getInstallIcon = () => {
    switch (installSource) {
      case 'ios':
        return <Smartphone className="h-5 w-5" />;
      case 'android':
        return <Download className="h-5 w-5" />;
      default:
        return <Monitor className="h-5 w-5" />;
    }
  };

  // Don't show if installed, dismissed, or conditions not met
  if (isInstalled || !showPrompt || sessionStorage.getItem('pwa-prompt-dismissed')) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.9 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm"
      >
        <Card className="border-2 border-primary/20 bg-card/95 backdrop-blur-sm shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5 text-primary">
                {getInstallIcon()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm mb-1">Install NyxChat</h3>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                  Get quick access, work offline, and enjoy a native app experience
                </p>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleInstallClick}
                    size="sm"
                    className="flex-1 h-8 text-xs font-medium"
                  >
                    {getInstallText()}
                  </Button>
                  <Button 
                    onClick={handleDismiss}
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    title="Dismiss"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};
