'use client'

import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useScriptStore } from '@/stores/script-store'
import { useSettingsStore } from '@/stores/settings-store'
import { calculateStats } from '@/lib/stats'
import { cn } from '@/lib/utils'
import type { ApexOptions } from 'apexcharts'

// Dynamic import for ApexCharts (SSR disabled)
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

// Stat card component
function StatCard({
  label,
  value,
  icon,
}: {
  label: string
  value: string | number
  icon: string
}) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-4 flex flex-col items-center justify-center text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold text-[var(--color-primary)]">{value}</div>
      <div className="text-sm text-[var(--color-text-secondary)]">{label}</div>
    </div>
  )
}

export default function StatsPage() {
  const { scriptData, loadScript, isLoading } = useScriptStore()
  const { playId, theme } = useSettingsStore()
  const [mounted, setMounted] = useState(false)

  // Load script on mount
  useEffect(() => {
    if (scriptData.length === 0) {
      loadScript(playId)
    }
    setMounted(true)
  }, [playId, scriptData.length, loadScript])

  // Calculate stats from script data
  const stats = useMemo(() => calculateStats(scriptData), [scriptData])

  // Determine if dark mode (for chart theming)
  const isDark = theme === 'dark'

  // Chart colors - consistent across all charts
  const chartColors = [
    '#FF6A00', '#FF8533', '#FFA366', '#FFC199', '#FFDACC',
    '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE',
    '#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5',
    '#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#EDE9FE',
  ]

  // Common chart theme options
  const commonOptions: ApexOptions = {
    theme: {
      mode: isDark ? 'dark' : 'light',
    },
    chart: {
      background: 'transparent',
      toolbar: {
        show: false,
      },
      fontFamily: 'Inter, system-ui, sans-serif',
    },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
    },
  }

  // Donut chart options (word share)
  const donutOptions: ApexOptions = {
    ...commonOptions,
    chart: {
      ...commonOptions.chart,
      type: 'donut',
    },
    labels: stats.actors.slice(0, 10).map((a) => a.name),
    colors: chartColors,
    legend: {
      position: 'bottom',
      labels: {
        colors: isDark ? '#f3f3f3' : '#111827',
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(1)}%`,
    },
    plotOptions: {
      pie: {
        donut: {
          size: '55%',
          labels: {
            show: true,
            name: {
              show: true,
              color: isDark ? '#f3f3f3' : '#111827',
            },
            value: {
              show: true,
              color: isDark ? '#f3f3f3' : '#111827',
              formatter: (val: string) => `${val} Worter`,
            },
            total: {
              show: true,
              label: 'Gesamt',
              color: isDark ? '#a1a1aa' : '#6b7280',
              formatter: () => `${stats.totalWords}`,
            },
          },
        },
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 300,
          },
          legend: {
            position: 'bottom',
          },
        },
      },
    ],
  }

  // Bar chart for occurrences (horizontal)
  const occurrencesOptions: ApexOptions = {
    ...commonOptions,
    chart: {
      ...commonOptions.chart,
      type: 'bar',
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        dataLabels: {
          position: 'top',
        },
      },
    },
    dataLabels: {
      enabled: true,
      offsetX: -6,
      style: {
        fontSize: '11px',
        colors: ['#fff'],
      },
    },
    xaxis: {
      categories: stats.actors.slice(0, 10).map((a) => a.name),
      labels: {
        style: {
          colors: isDark ? '#a1a1aa' : '#6b7280',
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: isDark ? '#f3f3f3' : '#111827',
        },
      },
    },
    colors: ['#FF6A00'],
    grid: {
      borderColor: isDark ? '#2e2e33' : '#e5e7eb',
    },
  }

  // Bar chart for words (vertical)
  const wordsOptions: ApexOptions = {
    ...commonOptions,
    chart: {
      ...commonOptions.chart,
      type: 'bar',
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 4,
        columnWidth: '60%',
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: stats.actors.slice(0, 10).map((a) => a.name),
      labels: {
        rotate: -45,
        rotateAlways: true,
        style: {
          colors: isDark ? '#a1a1aa' : '#6b7280',
          fontSize: '10px',
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: isDark ? '#a1a1aa' : '#6b7280',
        },
      },
    },
    colors: ['#3B82F6'],
    grid: {
      borderColor: isDark ? '#2e2e33' : '#e5e7eb',
    },
  }

  // Series data
  const donutSeries = stats.actors.slice(0, 10).map((a) => a.words)
  const occurrencesSeries = [
    {
      name: 'Auftritte',
      data: stats.actors.slice(0, 10).map((a) => a.occurrences),
    },
  ]
  const wordsSeries = [
    {
      name: 'Worter',
      data: stats.actors.slice(0, 10).map((a) => a.words),
    },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto mb-4" />
          <p className="text-[var(--color-text-secondary)]">Lade Statistiken...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] pb-8">
      {/* Header */}
      <header className="sticky top-0 bg-[var(--color-surface)] border-b border-[var(--color-border)] p-4 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="text-[var(--color-primary)] hover:underline flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Zuruck
          </Link>
          <h1 className="text-lg font-semibold">Statistiken</h1>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        {/* Summary Cards */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Ubersicht</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon="🎭" label="Rollen" value={stats.totalActors} />
            <StatCard icon="💬" label="Gesprochene Worter" value={stats.totalWords.toLocaleString('de-DE')} />
            <StatCard icon="🎬" label="Szenen" value={stats.totalScenes} />
            <StatCard icon="📊" label="O Worter pro Rolle" value={stats.avgWords.toLocaleString('de-DE')} />
          </div>
        </section>

        {/* Role breakdown table */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Rollenverteilung</h2>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-background)]">
                    <th className="text-left p-3 font-medium text-[var(--color-text-secondary)]">#</th>
                    <th className="text-left p-3 font-medium text-[var(--color-text-secondary)]">Rolle</th>
                    <th className="text-right p-3 font-medium text-[var(--color-text-secondary)]">Auftritte</th>
                    <th className="text-right p-3 font-medium text-[var(--color-text-secondary)]">Worter</th>
                    <th className="text-right p-3 font-medium text-[var(--color-text-secondary)]">Anteil</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.actors.map((actor, idx) => (
                    <tr
                      key={actor.name}
                      className={cn(
                        'border-b border-[var(--color-border)] last:border-b-0',
                        'hover:bg-[var(--color-primary-light)] transition-colors'
                      )}
                    >
                      <td className="p-3 text-[var(--color-text-muted)]">{idx + 1}</td>
                      <td className="p-3 font-medium">{actor.name}</td>
                      <td className="p-3 text-right tabular-nums">{actor.occurrences}</td>
                      <td className="p-3 text-right tabular-nums">{actor.words.toLocaleString('de-DE')}</td>
                      <td className="p-3 text-right tabular-nums text-[var(--color-primary)]">
                        {actor.percent}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Charts */}
        {mounted && stats.actors.length > 0 && (
          <>
            {/* Word Share Donut Chart */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Wortanteil (Top 10)</h2>
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-4">
                <Chart
                  options={donutOptions}
                  series={donutSeries}
                  type="donut"
                  height={350}
                />
              </div>
            </section>

            {/* Occurrences Bar Chart */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Auftritte (Top 10)</h2>
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-4">
                <Chart
                  options={occurrencesOptions}
                  series={occurrencesSeries}
                  type="bar"
                  height={350}
                />
              </div>
            </section>

            {/* Words Bar Chart */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Worter (Top 10)</h2>
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-4">
                <Chart
                  options={wordsOptions}
                  series={wordsSeries}
                  type="bar"
                  height={350}
                />
              </div>
            </section>
          </>
        )}

        {stats.actors.length === 0 && !isLoading && (
          <div className="text-center py-12 text-[var(--color-text-muted)]">
            <div className="text-4xl mb-2">📊</div>
            <div>Keine Daten verfugbar</div>
          </div>
        )}
      </main>
    </div>
  )
}
