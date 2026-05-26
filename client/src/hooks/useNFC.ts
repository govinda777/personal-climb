"use client";

import { useState, useEffect } from "react";

export function useNFC() {
  const [isSupported, setIsSupported] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [lastMessage, setLastMessage] = useState<string | null>(null);

  useEffect(() => {
    if ("NDEFReader" in window) {
      setIsSupported(true);
    }
  }, []);

  const startScan = async () => {
    if (!isSupported) {
      alert("NFC não suportado neste navegador.");
      return;
    }

    try {
      // @ts-expect-error - Web NFC is still experimental in some types
      const ndef = new NDEFReader();
      await ndef.scan();
      setIsReading(true);

      ndef.addEventListener(
        "reading",
        ({ serialNumber }: { serialNumber: string }) => {
          console.log(`> Serial Number: ${serialNumber}`);
          // Handle NFC data (e.g., check-in at equipment)
          setLastMessage(`Tag lida: ${serialNumber}`);
        },
      );
    } catch (error) {
      console.error(`Erro no NFC: ${error}`);
      setIsReading(false);
    }
  };

  return {
    isSupported,
    isReading,
    lastMessage,
    startScan,
  };
}
