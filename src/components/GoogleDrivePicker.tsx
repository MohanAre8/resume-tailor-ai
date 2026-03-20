'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

// Extend Window to include Google API globals loaded via script tag
declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

interface GoogleDrivePickerProps {
  onFileSelect: (fileId: string, fileName: string) => void;
  label: string;
  mimeTypeMask?: string;
}

export default function GoogleDrivePicker({ onFileSelect, label, mimeTypeMask }: GoogleDrivePickerProps) {
  const { data: session } = useSession() as { data: any };
  const [pickerApiLoaded, setPickerApiLoaded] = useState(false);

  useEffect(() => {
    // Load the Google API script dynamically
    const loadGoogleAPI = () => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        window.gapi.load('picker', { callback: () => setPickerApiLoaded(true) });
      };
      document.body.appendChild(script);
    };

    if (!window.gapi) {
      loadGoogleAPI();
    } else if (!window.google?.picker) {
      window.gapi.load('picker', { callback: () => setPickerApiLoaded(true) });
    } else {
      setPickerApiLoaded(true);
    }
  }, []);

  const handleOpenPicker = () => {
    if (!session?.accessToken || !pickerApiLoaded || !window.google?.picker) {
      alert("Google API is still loading or you are not authenticated properly.");
      return;
    }

    const view = new window.google.picker.DocsView();
    if (mimeTypeMask) {
      // e.g. 'application/vnd.google-apps.document'
      view.setMimeTypes(mimeTypeMask);
    }

    const picker = new window.google.picker.PickerBuilder()
      .addView(view)
      .setOAuthToken(session.accessToken)
      .setDeveloperKey(process.env.NEXT_PUBLIC_GOOGLE_API_KEY || "")
      .setCallback((data: any) => {
        if (data.action === window.google.picker.Action.PICKED) {
          const file = data.docs[0];
          onFileSelect(file.id, file.name);
        }
      })
      .build();

    picker.setVisible(true);
  };

  return (
    <button 
      onClick={handleOpenPicker}
      type="button"
      className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 py-3 px-4 rounded-xl transition-all"
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.16 8.32l-6-6A2 2 0 0 0 11.75 2h-6A2 2 0 0 0 3.75 4v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9.75a2 2 0 0 0-.59-1.43zM13.75 4.16L17.59 8H13.75V4.16zM17.75 20h-12V4h6v6a2 2 0 0 0 2 2h4v8z"/></svg>
      {label}
    </button>
  );
}
