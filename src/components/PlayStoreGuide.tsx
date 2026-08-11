import React, { useState } from 'react';
import {
  Smartphone,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  ArrowLeft,
  Terminal,
  ShieldCheck,
  Globe,
  Layers,
  HelpCircle,
  FileCode,
  Sparkles
} from 'lucide-react';
import { soundFx } from '../utils/sound';

interface PlayStoreGuideProps {
  onClose: () => void;
}

export const PlayStoreGuide: React.FC<PlayStoreGuideProps> = ({ onClose }) => {
  const [copiedManifest, setCopiedManifest] = useState(false);
  const [copiedAssetLinks, setCopiedAssetLinks] = useState(false);

  const manifestJson = `{
  "name": "Space Shooter: Galaxy Defender",
  "short_name": "GalaxyDefender",
  "description": "Action-packed arcade space shooter game with weapon upgrades and boss battles.",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#0b0f19",
  "theme_color": "#0b0f19",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}`;

  const assetLinksJson = `[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.galaxydefender.spaceshooter",
      "sha256_cert_fingerprints": [
        "REPLACE_WITH_YOUR_RELEASE_CERT_SHA256"
      ]
    }
  }
]`;

  const copyToClipboard = (text: string, type: 'manifest' | 'asset') => {
    navigator.clipboard.writeText(text);
    if (type === 'manifest') {
      setCopiedManifest(true);
      setTimeout(() => setCopiedManifest(false), 2000);
    } else {
      setCopiedAssetLinks(true);
      setTimeout(() => setCopiedAssetLinks(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        {/* Top Navigation */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>RETURN TO GAME</span>
          </button>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-800/80">
            <ShieldCheck className="w-4 h-4" />
            Release Checklist
          </span>
        </div>

        {/* Hero Header */}
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 border border-indigo-800/50 rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            Google Play Store Publish Guide
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Steps to Publish on Google Play Store (Step-by-Step Guide)
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            This game is optimized for mobile browsers and includes the web assets needed for a PWA/TWA packaging workflow. An Android AAB must still be generated, signed, and tested before Play Console submission.
          </p>
        </div>

        {/* Method 1: PWABuilder (Easiest - 0 Code) */}
        <section className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Method 1: PWABuilder (Easiest Method - Free APK/AAB Generation)</h2>
              <p className="text-xs text-slate-400">Generate Android Bundle (.aab) in 2 minutes with zero coding</p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-slate-300 pl-2 border-l-2 border-indigo-500/50">
            <div className="flex items-start gap-2">
              <span className="font-bold text-indigo-400 min-w-[20px]">1.</span>
              <p>After deploying your app, copy its live HTTPS web URL and use that URL for the PWA/TWA packaging step.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-indigo-400 min-w-[20px]">2.</span>
              <p>
                Go to: <a href="https://www.pwabuilder.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline inline-flex items-center gap-1">PWABuilder.com <ExternalLink className="w-3 h-3" /></a>
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-indigo-400 min-w-[20px]">3.</span>
              <p>Paste your app URL and click <strong>"Start"</strong>.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-indigo-400 min-w-[20px]">4.</span>
              <p>Select <strong>Android</strong> under <strong>"Package for Stores"</strong> and click <strong>Download Android Package (.aab)</strong>.</p>
            </div>
          </div>
        </section>

        {/* Method 2: Bubblewrap CLI */}
        <section className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Method 2: Bubblewrap CLI (Official Google TWA Tool)</h2>
              <p className="text-xs text-slate-400">Build signed Google Play Store APK files directly from your terminal</p>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 space-y-2">
            <p className="text-slate-500"># 1. Install Bubblewrap CLI</p>
            <p>npm i -g @bubblewrap/cli</p>
            <p className="text-slate-500 mt-2"># 2. Initialize Android Project</p>
            <p>bubblewrap init --manifest=https://YOUR-LIVE-DOMAIN.example/manifest.json</p>
            <p className="text-slate-500 mt-2"># 3. Build APK & AAB Files</p>
            <p>bubblewrap build</p>
          </div>
        </section>

        {/* Web App Manifest Configuration Code */}
        <section className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-base">`manifest.json` File Code</h3>
            </div>
            <button
              onClick={() => copyToClipboard(manifestJson, 'manifest')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Copy className="w-3.5 h-3.5 text-amber-400" />
              <span>{copiedManifest ? 'COPIED!' : 'COPY CODE'}</span>
            </button>
          </div>

          <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto">
            {manifestJson}
          </pre>
        </section>

        {/* Play Store Checklist */}
        <section className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 space-y-4">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Google Play Console Checklist
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-1">
              <span className="font-bold text-indigo-400 block">1. Google Play Developer Account</span>
              <p className="text-slate-400">Requires a Google Play Developer Account ($25 one-time fee).</p>
            </div>
            <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-1">
              <span className="font-bold text-indigo-400 block">2. App Icon & Feature Graphic</span>
              <p className="text-slate-400">512x512 High-res Icon and 1024x500 Feature Graphic banner.</p>
            </div>
            <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-1">
              <span className="font-bold text-indigo-400 block">3. Privacy Policy URL</span>
              <p className="text-slate-400">Link to a published Privacy Policy page.</p>
            </div>
            <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-1">
              <span className="font-bold text-indigo-400 block">4. Signed Android Bundle (.aab)</span>
              <p className="text-slate-400">Upload the .aab bundle generated via PWABuilder or Bubblewrap.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
