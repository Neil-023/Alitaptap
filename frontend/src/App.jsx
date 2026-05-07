import React, { useCallback, useMemo, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Welcome from './components/Welcome.jsx'
import PreCapture from './components/PreCapture.jsx'
import Loading from './components/Loading.jsx'
import Dashboard from './components/Dashboard.jsx'
import Certificate from './components/Certificate.jsx'
import './App.css'

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8003').replace(/\/$/, '')

// Temporary testing bypass: allows opening /dashboard without upload/AI response.
const ENABLE_DASHBOARD_BYPASS =
  String(import.meta.env.VITE_ENABLE_DASHBOARD_BYPASS || 'false').toLowerCase() === 'true'

const TEST_DASHBOARD_DATA = {
  score: 67,
  overallRisk: 'Moderate risk detected. Prioritize fuel sources near heat and clear exit paths.',
  classification: 'Moderate Risk',
  breakdown: [
    { label: 'Stuff', value: 0.7, color: '#f46f5d' },
    { label: 'Power', value: 0.6, color: '#f6b44a' },
    { label: 'Space', value: 0.5, color: '#46d39a' },
    { label: 'Path', value: 0.4, color: '#f4d06f' },
  ],
  hazards: [
    {
      id: 'extension-near-curtain',
      title: 'Extension Cord Near Curtain',
      severity: 'high',
      risk: 'Heat buildup near fabric can increase ignition risk.',
      fix: 'Move the cord away from curtains and avoid overloading outlets.',
    },
    {
      id: 'blocked-walkway',
      title: 'Blocked Walkway',
      severity: 'medium',
      risk: 'Objects in the path can slow evacuation during an emergency.',
      fix: 'Clear the walkway to keep a direct route to exits.',
    },
    {
      id: 'paper-near-appliance',
      title: 'Paper Near Heat Source',
      severity: 'medium',
      risk: 'Combustible paper near powered appliances may ignite.',
      fix: 'Store papers away from electrical appliances and heat-producing devices.',
    },
  ],
}

const PILLAR_CONFIG = [
  { key: 'Fuel', label: 'Stuff', color: '#f46f5d' },
  { key: 'Heat', label: 'Power', color: '#f6b44a' },
  { key: 'space', label: 'Space', color: '#46d39a' },
  { key: 'Path', label: 'Path', color: '#f4d06f' },
]

const safeNumber = (value, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const normalizeSeverity = (value = '') => {
  const normalized = value.toLowerCase()
  if (normalized.includes('high')) {
    return 'high'
  }
  if (normalized.includes('moderate') || normalized.includes('medium')) {
    return 'medium'
  }
  if (normalized.includes('low')) {
    return 'low'
  }
  return 'medium'
}

const toId = (value, index) => {
  if (!value) {
    return `hazard-${index + 1}`
  }
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const mapAnalysisToUi = (analysis) => {
  const score = safeNumber(analysis?.overall_score, 0)
  const overallRisk =
    analysis?.agent_note || analysis?.Rremarks || analysis?.remarks || 'No summary provided.'
  const classification = analysis?.classification || ''
  const pillars = analysis?.pillars || {}

  const breakdown = PILLAR_CONFIG.map((pillar) => {
    const rawValue = safeNumber(pillars[pillar.key], 0)
    const value = Math.max(0, Math.min(10, rawValue)) / 10
    return { label: pillar.label, value, color: pillar.color }
  })

  const hazards = (analysis?.assessments || []).map((item, index) => {
    const title = item?.hazard || `Hazard ${index + 1}`
    return {
      id: toId(title, index),
      title,
      severity: normalizeSeverity(item?.class),
      risk: item?.risk || 'No details provided.',
      fix: item?.fix || 'No fix provided.',
    }
  })

  return { score, overallRisk, breakdown, hazards, classification }
}

function App() {
  const [captureFile, setCaptureFile] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [analysisError, setAnalysisError] = useState(null)

  const handleCapture = useCallback((file) => {
    setCaptureFile(file)
    setAnalysis(null)
    setAnalysisError(null)
  }, [])

  const analyzeCapture = useCallback(async () => {
    if (!captureFile) {
      const error = new Error('No photo selected.')
      setAnalysisError(error.message)
      throw error
    }

    const formData = new FormData()
    formData.append('file', captureFile)

    try {
      const response = await fetch(`${API_BASE}/api/assess`, {
        method: 'POST',
        body: formData,
      })

      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        const message = payload?.detail || `HTTP ${response.status} ${response.statusText || 'error'}`
        setAnalysisError(message)
        throw new Error(message)
      }

      setAnalysis(payload)
      setAnalysisError(null)
      return payload
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      setAnalysisError(message)
      throw error instanceof Error ? error : new Error(message)
    }
  }, [captureFile])

  const mappedAnalysis = useMemo(() => {
    if (!analysis) {
      return null
    }
    return mapAnalysisToUi(analysis)
  }, [analysis])

  const dashboardData = mappedAnalysis || (ENABLE_DASHBOARD_BYPASS ? TEST_DASHBOARD_DATA : null)

  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/precapture" element={<PreCapture onCapture={handleCapture} />} />
      <Route
        path="/loading"
        element={
          ENABLE_DASHBOARD_BYPASS ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Loading
              nextPath="/dashboard"
              onAnalyze={analyzeCapture}
              errorMessage={analysisError}
            />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          dashboardData ? (
            <Dashboard
              score={dashboardData.score}
              overallRisk={dashboardData.overallRisk}
              breakdown={dashboardData.breakdown}
              hazards={dashboardData.hazards}
              classification={dashboardData.classification}
  
            />
          ) : (
            <Navigate to="/precapture" replace />
          )
        }
      />
      <Route
        path="/certificate"
        element={
          <Certificate score={mappedAnalysis?.score ?? 0}/>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App