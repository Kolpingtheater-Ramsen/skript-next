'use client'

import { useEffect } from 'react'
import { useUIStore } from '@/stores/ui-store'
import { useSettingsStore } from '@/stores/settings-store'
import { useScriptStore } from '@/stores/script-store'
import { useDirectorStore } from '@/stores/director-store'
import { usePlaysStore } from '@/stores'
import { Modal, Button, Select, Checkbox, RangeSlider, Input } from '@/components/ui'
import { cn } from '@/lib/utils'
import { socketManager } from '@/lib/socket'

export function SettingsModal() {
  const { settingsOpen, setSettingsOpen } = useUIStore()
  const settings = useSettingsStore()
  const actors = useScriptStore((state) => state.actors)
  const director = useDirectorStore()
  const { plays, loadPlays } = usePlaysStore()

  // Load plays on mount
  useEffect(() => {
    loadPlays()
  }, [loadPlays])

  // Build actor options
  const actorOptions = [
    { value: '', label: 'Alle Charaktere anzeigen' },
    ...actors.map((a) => ({
      value: a.role,
      label: settings.useActorNames ? `${a.role} (${a.name})` : a.role,
    })),
  ]

  const handleBecomeDirector = () => {
    if (director.credentials.name && director.credentials.password) {
      socketManager.setDirector(
        director.credentials.name,
        director.credentials.password
      )
    }
  }

  const handleLeaveDirector = () => {
    if (director.isDirector) {
      socketManager.unsetDirector(director.directorName)
      director.setIsDirector(false)
      director.setDirectorName('')
    }
  }

  return (
    <Modal
      isOpen={settingsOpen}
      onClose={() => setSettingsOpen(false)}
      title="⚙️ Einstellungen"
      footer={
        <Button variant="secondary" onClick={() => setSettingsOpen(false)}>
          Schließen
        </Button>
      }
    >
      {/* Production Section */}
      <SettingsSection title="📽️ Produktion">
        {plays.length > 1 && (
          <Select
            label="Stück auswählen"
            options={plays.map((p) => ({ value: p.id, label: p.name }))}
            value={settings.playId}
            onChange={(e) => {
              settings.setPlayId(e.target.value)
              window.location.reload()
            }}
          />
        )}
        <Select
          label="Rolle / Charakter"
          options={actorOptions}
          value={settings.selectedActor}
          onChange={(e) => settings.setSelectedActor(e.target.value)}
        />
        <Checkbox
          checked={settings.useActorNames}
          onChange={(e) => settings.setUseActorNames(e.target.checked)}
          label="Schauspielernamen zu Rollen anzeigen"
        />
      </SettingsSection>

      {/* Display Section */}
      <SettingsSection title="🎨 Darstellung">
        <div className="flex gap-3 mb-4">
          <ThemeOption
            id="light"
            label="Hell"
            selected={settings.theme === 'light'}
            onClick={() => settings.setTheme('light')}
            previewClass="bg-white border border-gray-200"
          />
          <ThemeOption
            id="dark"
            label="Dunkel"
            selected={settings.theme === 'dark'}
            onClick={() => settings.setTheme('dark')}
            previewClass="bg-gray-900"
          />
          <ThemeOption
            id="pink"
            label="Pink"
            selected={settings.theme === 'pink'}
            onClick={() => settings.setTheme('pink')}
            previewClass="bg-pink-200"
          />
        </div>
        <Checkbox
          checked={settings.showSceneOverview}
          onChange={(e) => settings.setShowSceneOverview(e.target.checked)}
          label="Szenenübersicht anzeigen"
        />
      </SettingsSection>

      {/* Content Filters Section */}
      <SettingsSection title="📝 Inhalt & Filter">
        <Checkbox
          checked={settings.showActorText}
          onChange={() => settings.toggleFilter('showActorText')}
          label="Schauspielertexte anzeigen"
        />

        <FilterWithContext
          checked={settings.showDirections}
          onChange={() => settings.toggleFilter('showDirections')}
          label="📝 Bühnenanweisungen"
          colorClass="checked:!bg-instruction checked:!border-instruction"
          contextValue={settings.directionsContext}
          onContextChange={(v) => settings.setContextLines('directionsContext', v)}
        />

        <FilterWithContext
          checked={settings.showTechnical}
          onChange={() => settings.toggleFilter('showTechnical')}
          label="🛠️ Technik"
          colorClass="checked:!bg-technical checked:!border-technical"
          contextValue={settings.technicalContext}
          onContextChange={(v) => settings.setContextLines('technicalContext', v)}
        />

        <FilterWithContext
          checked={settings.showLighting}
          onChange={() => settings.toggleFilter('showLighting')}
          label="💡 Beleuchtung"
          colorClass="checked:!bg-lighting checked:!border-lighting"
          contextValue={settings.lightingContext}
          onContextChange={(v) => settings.setContextLines('lightingContext', v)}
        />

        <FilterWithContext
          checked={settings.showEinspieler}
          onChange={() => settings.toggleFilter('showEinspieler')}
          label="🔊 Einspieler / Audio"
          colorClass="checked:!bg-audio checked:!border-audio"
          contextValue={settings.einspielContext}
          onContextChange={(v) => settings.setContextLines('einspielContext', v)}
        />

        <FilterWithContext
          checked={settings.showRequisiten}
          onChange={() => settings.toggleFilter('showRequisiten')}
          label="📦 Requisiten"
          colorClass="checked:!bg-props checked:!border-props"
          contextValue={settings.requisitenContext}
          onContextChange={(v) => settings.setContextLines('requisitenContext', v)}
        />

        <Checkbox
          checked={settings.showMicro}
          onChange={() => settings.toggleFilter('showMicro')}
          label="🎤 Mikrofonnummern anzeigen"
        />

        <FilterWithContext
          checked={settings.showMikrofonCues}
          onChange={() => settings.toggleFilter('showMikrofonCues')}
          label="🎤 Mikrofon Cues"
          colorClass="checked:!bg-microphone checked:!border-microphone"
          contextValue={settings.mikrofonContext}
          onContextChange={(v) => settings.setContextLines('mikrofonContext', v)}
        />
      </SettingsSection>

      {/* Notes Section */}
      <SettingsSection title="📒 Notizen">
        <div className="p-3 bg-[rgba(245,158,11,0.15)] dark:bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.3)] rounded-lg">
          <Checkbox
            checked={settings.enableNotes}
            onChange={(e) => settings.setEnableNotes(e.target.checked)}
            label="📝 Lokale Notizen aktivieren"
            description="Notizen werden lokal im Browser gespeichert und nie synchronisiert."
          />
        </div>
      </SettingsSection>

      {/* Practice Mode Section */}
      <SettingsSection title="🎭 Übungsmodus">
        <Checkbox
          checked={settings.blurLines}
          onChange={(e) => settings.setBlurLines(e.target.checked)}
          label="🙈 Meine Texte verstecken (zum Üben)"
        />
        <Checkbox
          checked={settings.autoScroll}
          onChange={(e) => settings.setAutoScroll(e.target.checked)}
          label="📜 Automatisch scrollen (Director Mode)"
        />
      </SettingsSection>

      {/* Director Section */}
      <SettingsSection title="🎬 Director Mode">
        <div
          className={cn(
            'p-4 rounded-lg border',
            director.isDirector
              ? 'border-error bg-error-light'
              : 'border-[var(--color-border)] bg-gray-50 dark:bg-gray-800'
          )}
        >
          <div className="mb-2 text-xs text-[var(--color-text-secondary)]">
            Aktueller Director:{' '}
            <span className={director.currentDirector ? 'font-medium' : ''}>
              {director.currentDirector || 'Niemand'}
            </span>
          </div>

          {!director.isDirector && (
            <div className="flex flex-col gap-3">
              <Input
                placeholder="Name"
                value={director.credentials.name}
                onChange={(e) =>
                  director.setCredentials(
                    e.target.value,
                    director.credentials.password
                  )
                }
              />
              <Input
                type="password"
                placeholder="Passwort"
                value={director.credentials.password}
                onChange={(e) =>
                  director.setCredentials(
                    director.credentials.name,
                    e.target.value
                  )
                }
              />
              <div className="flex gap-2">
                <Button onClick={handleBecomeDirector}>Director werden</Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => director.clearCredentials()}
                >
                  Daten löschen
                </Button>
              </div>
            </div>
          )}

          {director.isDirector && (
            <div className="flex gap-2">
              <Button variant="danger" onClick={handleLeaveDirector}>
                Director abgeben
              </Button>
            </div>
          )}
        </div>
      </SettingsSection>

      {/* Quick Links */}
      <SettingsSection title="QUICK LINKS">
        <div className="grid grid-cols-2 gap-2">
          <LinkButton href="/stats">📊 Statistiken</LinkButton>
          <LinkButton href="/suggestor">🎲 Rollenvorschläge</LinkButton>
          <LinkButton href="/stage" target="_blank">📺 Bühnen-Viewer</LinkButton>
          <LinkButton href="/actor" target="_blank">🎭 Schauspieler-Viewer</LinkButton>
        </div>
      </SettingsSection>
    </Modal>
  )
}

// Helper components
function SettingsSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="mb-6 last:mb-0">
      <h4 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3 pb-2 border-b border-[var(--color-border)]">
        {title}
      </h4>
      {children}
    </div>
  )
}

function ThemeOption({
  id,
  label,
  selected,
  onClick,
  previewClass,
}: {
  id: string
  label: string
  selected: boolean
  onClick: () => void
  previewClass: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-2 p-2 rounded-lg cursor-pointer bg-transparent border-2 transition-all',
        selected
          ? 'border-[var(--color-primary)]'
          : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700'
      )}
    >
      <div className={cn('w-12 h-8 rounded', previewClass)} />
      <span className="text-sm">{label}</span>
    </button>
  )
}

function FilterWithContext({
  checked,
  onChange,
  label,
  colorClass,
  contextValue,
  onContextChange,
}: {
  checked: boolean
  onChange: () => void
  label: string
  colorClass: string
  contextValue: number
  onContextChange: (value: number) => void
}) {
  return (
    <div>
      <Checkbox
        checked={checked}
        onChange={onChange}
        label={label}
        colorClass={colorClass}
      />
      {checked && (
        <RangeSlider
          label="Kontextzeilen:"
          min={0}
          max={5}
          value={contextValue}
          onChange={(e) => onContextChange(parseInt(e.target.value, 10))}
        />
      )}
    </div>
  )
}

function LinkButton({
  href,
  children,
  target,
}: {
  href: string
  children: React.ReactNode
  target?: string
}) {
  return (
    <a
      href={href}
      target={target}
      rel={target === '_blank' ? 'noopener noreferrer' : undefined}
      className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-[var(--color-border)] bg-gray-100 dark:bg-gray-800 text-[var(--color-text)] no-underline hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
    >
      {children}
    </a>
  )
}
