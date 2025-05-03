"use client";

import Link from 'next/link';

export default function TestPage() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-blue-100">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-4 text-blue-600">Test Page</h1>
        <p className="mb-4">This is a simple test page to verify UI rendering.</p>
        <div className="flex gap-4">
          <Link href="/" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Go to Home
          </Link>
          <Link href="/consolidated" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
            Go to Consolidated Version
          </Link>
        </div>
      </div>
    </div>
  );
} 