import React, { useCallback, useMemo, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Welcome from './components/Welcome.jsx'
import PreCapture from './components/PreCapture.jsx'
import Loading from './components/Loading.jsx'
import Dashboard from './components/Dashboard.jsx'
import Certificate from './components/Certificate.jsx'
import './App.css'

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

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

    const response = await fetch(`${API_BASE}/api/assess`, {
      method: 'POST',
      body: formData,
    })

    const payload = await response.json().catch(() => null)

    if (!response.ok) {
      const message = payload?.detail || 'Unable to analyze image.'
      setAnalysisError(message)
      throw new Error(message)
    }

    setAnalysis(payload)
    setAnalysisError(null)
    return payload
  }, [captureFile])

  const mappedAnalysis = useMemo(() => {
    if (!analysis) {
      return null
    }
    return mapAnalysisToUi(analysis)
  }, [analysis])

  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/precapture" element={<PreCapture onCapture={handleCapture} />} />
      <Route
        path="/loading"
        element={
          <Loading
            nextPath="/dashboard"
            onAnalyze={analyzeCapture}
            errorMessage={analysisError}
          />
        }
      />
      <Route
        path="/dashboard"
        element={
          mappedAnalysis ? (
            <Dashboard
              score={mappedAnalysis.score}
              overallRisk={mappedAnalysis.overallRisk}
              breakdown={mappedAnalysis.breakdown}
              hazards={mappedAnalysis.hazards}
              classification={mappedAnalysis.classification}
            />
          ) : (
            <Navigate to="/precapture" replace />
          )
        }
      />
      <Route
        path="/certificate"
        element={
          <Certificate score={mappedAnalysis?.score ?? 0} />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App