
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, X, Smartphone, Monitor, Chrome } from 'lucide-react';
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
  const [sessionDismissed, setSessionDismissed] = useState(false);

  useEffect(() => {
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches || 
          (window.navigator as any).standalone === true) {
        setIsInstalled(true);
        return true;
      }
      return false;
    };

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

    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show prompt more aggressively - after 3 seconds and not permanently dismissed
      setTimeout(() => {
        if (!isInstalled && !sessionDismissed && !localStorage.getItem('pwa-never-show')) {
          setShowPrompt(true);
        }
      }, 3000);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      localStorage.removeItem('pwa-never-show');
      console.log('NyxChat PWA was installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // For iOS and unsupported browsers, show manual prompt
    if (installSource === 'ios' || (!deferredPrompt && !isInstalled)) {
      setTimeout(() => {
        if (!isInstalled && !sessionDismissed && !localStorage.getItem('pwa-never-show')) {
          setShowPrompt(true);
        }
      }, 5000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled, sessionDismissed, deferredPrompt, installSource]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (installSource === 'ios') {
        alert('To install NyxChat:\n\n1. Tap the Share button (↗️)\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" in the top-right corner\n\nEnjoy your native NyxChat experience!');
      } else {
        alert('To install NyxChat:\n\n1. Look for the install icon in your browser\'s address bar\n2. Or check your browser\'s menu for "Install" or "Add to Home Screen"\n3. Follow the prompts to install\n\nEnjoy your native NyxChat experience!');
      }
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        localStorage.removeItem('pwa-never-show');
      } else {
        console.log('User dismissed the install prompt');
        setSessionDismissed(true);
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('Error during PWA installation:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setSessionDismissed(true);
  };

  const handleNeverShow = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-never-show', 'true');
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
        return <Chrome className="h-5 w-5" />;
    }
  };

  if (isInstalled || !showPrompt || localStorage.getItem('pwa-never-show')) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.9 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="fixed bottom-4 left-4 right-4 z-[200] md:left-auto md:right-4 md:max-w-sm"
      >
        <Card className="border-2 border-primary/30 bg-card/98 backdrop-blur-lg shadow-2xl rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5 text-primary bg-primary/10 p-2 rounded-xl">
                {getInstallIcon()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base mb-1">Install NyxChat</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  Get instant access, work offline, and enjoy a native app experience on your device
                </p>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleInstallClick}
                    size="sm"
                    className="flex-1 h-9 text-sm font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    {getInstallText()}
                  </Button>
                  <Button 
                    onClick={handleDismiss}
                    variant="outline"
                    size="sm"
                    className="h-9 w-9 p-0 rounded-xl border-2 hover:border-primary/30 transition-all duration-200"
                    title="Dismiss"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <button
                  onClick={handleNeverShow}
                  className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors duration-200 underline-offset-2 hover:underline"
                >
                  Don't show again
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};
