"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import Image from "next/image";

interface QRCodeData {
  username: string;
  password: string;
  autoLoginUrl: string;
  qrCodeImage?: string;
  full_name?: string;
  phone_number?: string;
}

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  credentials: {
    username: string;
    password: string;
    autoLoginUrl: string;
    qrCodeData?: QRCodeData;
  };
  roomNumber: number;
}

export function QRCodeModal({
  isOpen,
  onClose,
  credentials,
  roomNumber,
}: QRCodeModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(credentials.autoLoginUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  const handleCopyCredentials = async () => {
    const text = `Username: ${credentials.username}\nPassword: ${credentials.password}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy credentials:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Room {roomNumber} - Guest Login
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* QR Code Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              QR Code Login
            </h3>
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
              {credentials.qrCodeData?.qrCodeImage ? (
                <Image
                  src={credentials.qrCodeData.qrCodeImage || ""}
                  alt="QR Code"
                  className="w-48 h-48 object-contain"
                  width={200}
                  height={200}
                />
              ) : (
                <QRCodeSVG
                  value={credentials.autoLoginUrl}
                  size={200}
                  level="M"
                  includeMargin={true}
                />
              )}
            </div>
            <p className="text-sm text-gray-600">
              Scan this QR code with a mobile device to auto-login
            </p>

            {/* Copy URL Button */}
            <button
              onClick={handleCopyUrl}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {copied ? "URL Copied!" : "Copy Login URL"}
            </button>
          </div>

          {/* Credentials Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Login Credentials
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={credentials.username}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-mono text-sm"
                  />
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(credentials.username)
                    }
                    className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={credentials.password}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-mono text-sm"
                  />
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(credentials.password)
                    }
                    className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>

            {/* Copy All Credentials Button */}
            <button
              onClick={handleCopyCredentials}
              className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              {copied ? "Credentials Copied!" : "Copy All Credentials"}
            </button>

            {/* Guest Information */}
            {credentials.qrCodeData?.full_name && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">
                  Guest Information:
                </h4>
                <div className="text-sm text-green-700 space-y-1">
                  <p>
                    <strong>Name:</strong> {credentials.qrCodeData.full_name}
                  </p>
                  <p>
                    <strong>Phone:</strong>{" "}
                    {credentials.qrCodeData.phone_number}
                  </p>
                  <p>
                    <strong>Room:</strong> {roomNumber}
                  </p>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">
                Instructions for Guest:
              </h4>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Scan the QR code with your mobile device</li>
                <li>Or visit the login URL manually</li>
                <li>You will be automatically logged in</li>
                <li>Use the credentials above for manual login if needed</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Login URL Display */}
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">Auto-Login URL:</h4>
          <p className="text-sm text-gray-600 break-all font-mono">
            {credentials.autoLoginUrl}
          </p>
        </div>

        {/* Close Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#cfa349] text-white rounded-lg hover:bg-[#b8903e] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
