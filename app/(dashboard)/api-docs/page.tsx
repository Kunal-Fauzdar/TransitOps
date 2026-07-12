'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import 'swagger-ui-react/swagger-ui.css'

// Dynamically import SwaggerUI to prevent SSR (Server-Side Rendering) issues
const SwaggerUI = dynamic(() => import('swagger-ui-react'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
      <div className="text-xl font-semibold animate-pulse">Loading API Documentation...</div>
    </div>
  ),
})

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="py-6 px-8 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">TransitOps API Playground</h1>
          <p className="text-sm text-slate-400 mt-1">Interactive OpenAPI Swagger UI to test and document backend endpoints</p>
        </div>
      </header>
      <main className="swagger-dark-theme-wrapper">
        <SwaggerUI url="/openapi.json" />
      </main>
    </div>
  )
}
