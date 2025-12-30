# Video Production Agent - Vollständige Spezifikation

## 1. Architektur-Übersicht

### System-Komponenten

```
┌─────────────────────────────────────────────────────────────┐
│                      Web Interface (Next.js)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Asset Upload │  │ JSON Editor  │  │ Video Player │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                     API Layer (Next.js API Routes)           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ /api/generate│  │ /api/validate│  │ /api/status  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                    Processing Engine                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Scene Parser │  │ Asset Manager│  │ QC Validator │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                    Rendering Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Remotion   │  │  Animations  │  │  Transitions │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────────┬────────────────────────────────┘
                             │
                     ┌───────▼────────┐
                     │  Output Video   │
                     │    (MP4/WebM)   │
                     └─────────────────┘
```

### Module-Übersicht

1. **Scene Parser** (`lib/scene-parser.ts`)
   - JSON-Parsing und Validierung
   - Preset-Anwendung (cinematic, corporate, social-fast)
   - Timeline-Generierung
   - Quality Control Checks

2. **Asset Manager** (`lib/asset-manager.ts`)
   - Asset-Upload und -Verwaltung
   - Dimensionsprüfung
   - Typ-Erkennung (Bild/Video/Audio)
   - Manifest-Generierung

3. **Video Renderer** (`lib/video-renderer.ts`)
   - Animation-Berechnungen (Keyframes)
   - Smart Crop (Gesichtserkennung-Ready)
   - Farbgrading
   - Safe Zones für Text

4. **Remotion Components** (`remotion/`)
   - VideoComposition: Haupt-Komposition
   - AnimatedScene: Szenen mit Animationen
   - TextOverlay: Text-Einblendungen
   - Transition: Übergänge zwischen Szenen

5. **API Layer** (`app/api/`)
   - `/generate`: Video-Generierung
   - `/validate`: Projekt-Validierung

## 2. Datenformate

### JSON-Schema für Szenen-Skript

```json
{
  "projectName": "string (1-200 Zeichen)",
  "format": "16:9 | 9:16 | 1:1 | 4:5",
  "resolution": {
    "width": "number (640-7680)",
    "height": "number (480-4320)"
  },
  "fps": "number (23.976-60, default: 30)",
  "scenes": [
    {
      "id": "string (UUID, optional)",
      "assetPath": "string (Dateiname)",
      "assetType": "image | video",
      "duration": "number (0.1-30s, default: 3)",
      "animation": "none | ken-burns-in | ken-burns-out | zoom-in | zoom-out | pan-left | pan-right | pan-up | pan-down | parallax",
      "animationIntensity": "number (0-1, default: 0.5)",
      "transition": "cut | fade | crossfade | wipe-left | wipe-right | slide-left | slide-right",
      "transitionDuration": "number (0-2s, default: 0.5)",
      "textOverlays": [
        {
          "text": "string",
          "position": "top-left | top-center | top-right | middle-left | middle-center | middle-right | bottom-left | bottom-center | bottom-right",
          "fontSize": "number (12-200, default: 48)",
          "fontFamily": "string (default: Arial)",
          "color": "string (hex, default: #FFFFFF)",
          "backgroundColor": "string (hex, optional)",
          "startTime": "number (seconds, optional)",
          "duration": "number (seconds, optional)",
          "animation": "fade-in | slide-in | none"
        }
      ],
      "crop": {
        "x": "number (0-1, default: 0)",
        "y": "number (0-1, default: 0)",
        "width": "number (0-1, default: 1)",
        "height": "number (0-1, default: 1)"
      },
      "filters": {
        "brightness": "number (-1 to 1, default: 0)",
        "contrast": "number (-1 to 1, default: 0)",
        "saturation": "number (-1 to 1, default: 0)"
      }
    }
  ],
  "audio": {
    "backgroundMusic": "string (Dateiname, optional)",
    "musicVolume": "number (0-1, default: 0.3)",
    "voiceover": "string (Dateiname, optional)",
    "voiceoverVolume": "number (0-1, default: 1.0)",
    "ttsText": "string (optional)",
    "ttsVoice": "string (default: en-US-Standard-A)"
  },
  "preset": "cinematic | corporate | social-fast | custom",
  "exportFormat": "mp4 | webm | mov",
  "quality": "low | medium | high | ultra",
  "subtitles": {
    "enabled": "boolean (default: false)",
    "language": "string (default: en)",
    "format": "srt | vtt"
  }
}
```

### Asset-Manifest-Format

```json
{
  "projectId": "uuid",
  "createdAt": "ISO 8601 timestamp",
  "assets": [
    {
      "id": "uuid",
      "path": "string",
      "type": "image | video | audio",
      "originalName": "string",
      "size": "number (bytes)",
      "duration": "number (seconds, optional)",
      "dimensions": {
        "width": "number",
        "height": "number"
      },
      "usedInScenes": ["scene-id-1", "scene-id-2"]
    }
  ]
}
```

### Processing-Status-Format

```json
{
  "projectId": "uuid",
  "status": "queued | processing | completed | failed",
  "progress": "number (0-100)",
  "currentStep": "string",
  "startedAt": "ISO 8601 timestamp",
  "completedAt": "ISO 8601 timestamp (optional)",
  "error": "string (optional)",
  "outputUrl": "string (optional)",
  "logs": [
    {
      "timestamp": "ISO 8601 timestamp",
      "level": "info | warning | error",
      "message": "string"
    }
  ]
}
```

## 3. Agent-Workflow (Schritt für Schritt)

### Phase 1: Input-Verarbeitung

**Schritt 1.1: Asset-Upload**
- User lädt Bilder/Videos/Audio hoch
- System prüft Dateitypen (MIME + Extension)
- Validierung: Mindestauflösung 640x480
- Speicherung in temporärem Verzeichnis
- Asset-Manifest erstellen

**Schritt 1.2: JSON-Parsing**
- Projekt-JSON parsen und validieren (Zod)
- Preset anwenden (cinematic/corporate/social-fast)
- Fehlende Werte mit Defaults füllen
- UUID für jede Szene generieren

**Schritt 1.3: Asset-Zuordnung**
- Prüfen, ob alle referenzierten Assets existieren
- Fehlende Assets melden
- Fallback: Erstes verfügbares Asset verwenden

### Phase 2: Planung & Validierung

**Schritt 2.1: Timeline-Generierung**
- Szenenlängen berechnen
- Übergangszeitpunkte festlegen
- Gesamtdauer ermitteln
- Frame-genaue Timings erstellen

**Schritt 2.2: Quality Control**
- Aspekt-Ratio-Prüfung (Format vs. Resolution)
- Szenenlängen-Check (zu kurz/lang)
- Text-Länge validieren
- Audio-Balance prüfen
- Bild-Auflösung checken

**Schritt 2.3: Storyboard-Erstellung**
- Für jede Szene: Start/End-Frames
- Animation-Keyframes berechnen
- Transition-Parameter bestimmen
- Text-Overlay-Positionen festlegen

### Phase 3: Rendering

**Schritt 3.1: Remotion-Setup**
- Remotion-Bundle erstellen
- Composition konfigurieren
- Input-Props vorbereiten

**Schritt 3.2: Szenen-Rendering**
- Für jede Szene:
  - Asset laden (Bild/Video)
  - Smart Crop anwenden
  - Animation anwenden (Ken Burns, Zoom, Pan)
  - Filter anwenden (Brightness, Contrast, Saturation)
  - Text-Overlays rendern

**Schritt 3.3: Transitions**
- Übergänge zwischen Szenen rendern
- Fade/Crossfade/Wipe/Slide
- Timing-genaue Überlappung

**Schritt 3.4: Audio-Mixing**
- Background Music laden (optional)
- Voiceover laden (optional)
- TTS generieren (optional, falls implementiert)
- Audio normalisieren (-16 LUFS)
- Volumes mischen

**Schritt 3.5: Final Export**
- H.264-Encoding (MP4)
- Qualitätseinstellungen anwenden
- Metadaten schreiben
- Ausgabedatei erstellen

### Phase 4: Quality Control & Export

**Schritt 4.1: Output-Validierung**
- Datei existiert und > 0 Bytes
- Keine schwarzen Balken
- Auflösung korrekt
- Dauer korrekt
- Audio-Pegel OK

**Schritt 4.2: Multi-Format-Export** (optional)
- 16:9 für YouTube
- 9:16 für TikTok/Instagram Reels
- 1:1 für Instagram Feed
- 4:5 für Instagram Portrait

**Schritt 4.3: Untertitel** (optional)
- Whisper/ASR für Transkription
- SRT/VTT generieren
- Timecodes syncen

**Schritt 4.4: Lieferung**
- Video-URL zurückgeben
- Manifest erstellen
- Logs speichern
- Temp-Dateien aufräumen

## 4. Animation/Editing-Regeln

### Defaults nach Preset

**Cinematic:**
- Animation: ken-burns-in
- Transition: fade (1.0s)
- Szenenlänge: 4s
- Intensity: 0.7
- Filter: Brightness -5%, Contrast +10%, Saturation -10%

**Corporate:**
- Animation: zoom-in
- Transition: crossfade (0.5s)
- Szenenlänge: 3s
- Intensity: 0.3
- Filter: Brightness +5%, Contrast +5%, Saturation 0%

**Social-Fast:**
- Animation: zoom-in
- Transition: cut (0.2s)
- Szenenlänge: 1.5s
- Intensity: 0.6
- Filter: Brightness 0%, Contrast +15%, Saturation +10%

### Übergänge

- **Cut**: Instant (0s)
- **Fade**: Zu Schwarz, dann nächste Szene
- **Crossfade**: Überblendung (Standard 0.5-1s)
- **Wipe**: Links/Rechts schieben
- **Slide**: Szene gleitet ein

### Text-Safe-Zones

- **16:9**: Top 5%, Right 5%, Bottom 10%, Left 5%
- **9:16**: Top 10%, Right 5%, Bottom 15%, Left 5%
- **1:1**: Top 5%, Right 5%, Bottom 10%, Left 5%
- **4:5**: Top 8%, Right 5%, Bottom 12%, Left 5%

### Bildcropping

**Smart Crop:**
- Ziel-Aspekt-Ratio beibehalten
- Keine schwarzen Balken
- Gesichter in oberem Drittel halten (wenn erkannt)
- Horizontale Zentrierung bei Porträts
- Vertikale Zentrierung bei Landschaften

### Farblook

**Cinematic:**
- Geringere Sättigung (-10%)
- Erhöhter Kontrast (+15%)
- Leicht dunkler (-5% Brightness)
- Wärmere Temperatur (-5K)

**Corporate:**
- Neutrale Farben
- Leicht erhöhte Helligkeit (+5%)
- Balanced

**Social-Fast:**
- Höhere Sättigung (+15%)
- Starker Kontrast (+20%)
- Poppige Farben

## 5. Tool-Stack-Empfehlung

### Haupt-Stack (implementiert)

1. **Next.js 14** - Web-Framework
   - Server Actions für File-Upload
   - API Routes für Processing
   - React für UI

2. **Remotion 4** - Video-Rendering
   - React-basiert
   - Programmatische Video-Erstellung
   - Frame-genaue Kontrolle
   - Alternatives: FFmpeg + MoviePy

3. **TypeScript** - Type Safety
   - Zod für Runtime-Validierung
   - Compile-time Checks

4. **Tailwind CSS** - Styling
   - Responsive Design
   - Dark Mode Support

### Alternative Tools

**Video-Rendering:**
- **FFmpeg** (CLI): Mächtig, aber komplex
- **MoviePy** (Python): Einfacher, aber langsamer
- **OpenCV** (Python): Computer Vision, komplex
- **canvas-sketch** (JS): Kreativ, aber limitiert

**Bild-Animation:**
- **Ken Burns**: Remotion interpolate()
- **Keyframes**: CSS/Remotion Spring
- **Depth/Parallax**: Depth-Maps + Layer-Shifting (optional)

**TTS/Voiceover (optional):**
- **Elevenlabs API**: Hochwertig, kostenpflichtig
- **Google Cloud TTS**: Gut, kostenpflichtig
- **Amazon Polly**: OK, kostenpflichtig
- **Coqui TTS**: Open-Source, lokal

**Untertitel (optional):**
- **Whisper (OpenAI)**: Open-Source ASR
- **deepgram**: API-basiert
- **AssemblyAI**: API-basiert

### Deployment

- **Vercel**: Optimiert für Next.js
- **AWS Lambda**: Skalierbar
- **Render**: Einfach
- **Railway**: Developer-freundlich

## 6. Qualitätskontrolle

### Pre-Render Checks

✅ **Asset-Validierung:**
- Alle Assets vorhanden
- Mindestauflösung: 640x480
- Dateigröße < 50MB
- Gültige Formate: jpg, png, webp, mp4, webm

✅ **Projekt-Validierung:**
- JSON syntaktisch korrekt
- Alle Required-Felder vorhanden
- Werte in gültigen Ranges
- Aspekt-Ratio konsistent

✅ **Szenen-Checks:**
- Min. 1 Szene vorhanden
- Szenenlänge 0.1-30s
- Text nicht zu lang (< 100 Zeichen)
- Font-Größe angemessen (24-200px)

✅ **Audio-Checks:**
- Musik/Voiceover vorhanden (wenn referenziert)
- Volumes sinnvoll (Music < Voiceover)
- Music-Volume < 0.8 (warnen wenn höher)

### Post-Render Checks

✅ **Video-Eigenschaften:**
- Datei existiert
- Dateigröße > 0
- Auflösung korrekt
- FPS korrekt
- Dauer korrekt (±5%)

✅ **Visuelle Qualität:**
- Keine schwarzen Balken
- Keine abgeschnittenen Gesichter (wenn Faces erkannt)
- Kein Flackern
- Smooth Transitions

✅ **Audio-Qualität:**
- Lautheit: -16 LUFS (±2)
- Peak < -1.0 dB
- Keine Clipping
- Keine Stille-Frames

✅ **Encoding:**
- Codec: H.264 (mp4)
- Pixel-Format: yuv420p
- Color-Space: bt709
- Audio: AAC 192kbps 48kHz

## 7. Fehlerbehandlung & Fallbacks

### Fehlende Bilder

**Problem:** Asset in Scene-JSON, aber nicht hochgeladen

**Fallback:**
1. Erstes verfügbares Bild verwenden
2. Warning loggen
3. In Manifest vermerken

### Zu kurze Assets

**Problem:** Video kürzer als gewünschte Szenenlänge

**Fallback:**
1. Video loopen
2. Oder: Szenenlänge auf Video-Länge reduzieren
3. Warning loggen

### Falsche Formate

**Problem:** Bild im falschen Aspekt-Ratio

**Fallback:**
1. Smart Crop anwenden
2. Zentrieren
3. Object-Fit: Cover

### Fehlende Audio-Dateien

**Problem:** Music/Voiceover fehlt

**Fallback:**
1. Audio-Track weglassen
2. Warning loggen
3. Video ohne Audio rendern

### TTS-Fehler

**Problem:** TTS-Service nicht verfügbar

**Fallback:**
1. Video ohne Voiceover rendern
2. Error loggen
3. User informieren

### Rendering-Timeout

**Problem:** Video-Rendering dauert zu lange (> 5 Min)

**Fallback:**
1. Job abbrechen
2. Queuing-System nutzen (Redis/BullMQ)
3. User per Email/Webhook informieren

### Out of Memory

**Problem:** Zu viele/große Assets

**Fallback:**
1. Assets komprimieren (Sharp, FFmpeg)
2. Batch-Processing (5 Szenen pro Batch)
3. Streaming-Rendering

### Unbekannte Exceptions

**Problem:** Unerwarteter Fehler

**Fallback:**
1. Error catchen
2. Stack-Trace loggen
3. User-freundliche Meldung
4. Temp-Files aufräumen

## 8. Konfigurierbarkeit

### Preset: "Cinematic"

```typescript
{
  defaultAnimation: 'ken-burns-in',
  defaultTransition: 'fade',
  transitionDuration: 1.0,
  sceneDuration: 4.0,
  animationIntensity: 0.7,
  filters: {
    brightness: -0.05,
    contrast: 0.1,
    saturation: -0.1,
  },
  colorGrade: {
    temperature: -5,
    tint: 2,
  },
  textStyle: {
    fontFamily: 'Cinzel',
    fontSize: 56,
    color: '#FFFFFF',
    shadow: true,
  },
}
```

### Preset: "Clean Corporate"

```typescript
{
  defaultAnimation: 'zoom-in',
  defaultTransition: 'crossfade',
  transitionDuration: 0.5,
  sceneDuration: 3.0,
  animationIntensity: 0.3,
  filters: {
    brightness: 0.05,
    contrast: 0.05,
    saturation: 0,
  },
  colorGrade: {
    temperature: 0,
    tint: 0,
  },
  textStyle: {
    fontFamily: 'Montserrat',
    fontSize: 48,
    color: '#FFFFFF',
    backgroundColor: '#2563EB',
    shadow: false,
  },
}
```

### Preset: "Social Fast"

```typescript
{
  defaultAnimation: 'zoom-in',
  defaultTransition: 'cut',
  transitionDuration: 0.2,
  sceneDuration: 1.5,
  animationIntensity: 0.6,
  filters: {
    brightness: 0,
    contrast: 0.15,
    saturation: 0.1,
  },
  colorGrade: {
    temperature: 2,
    tint: 0,
  },
  textStyle: {
    fontFamily: 'Impact',
    fontSize: 64,
    color: '#FFFF00',
    stroke: '#000000',
    shadow: true,
  },
}
```

### Anpassbare Parameter

**Pro Projekt:**
- Format (16:9, 9:16, 1:1, 4:5)
- Auflösung (640x480 bis 7680x4320)
- FPS (24, 25, 30, 60)
- Qualität (low, medium, high, ultra)
- Preset (cinematic, corporate, social-fast, custom)

**Pro Szene:**
- Dauer (0.1-30s)
- Animation (10 Typen)
- Animation-Intensity (0-1)
- Transition (7 Typen)
- Transition-Duration (0-2s)
- Filter (Brightness, Contrast, Saturation)
- Crop (x, y, width, height)

**Pro Text-Overlay:**
- Position (9 Positionen)
- Font-Family
- Font-Size (12-200px)
- Color (Hex)
- Background-Color (optional)
- Animation (fade-in, slide-in, none)
- Timing (start, duration)

## 9. Sicherheits-/Rechte-Hinweise

### ⚖️ Nur eigene/lizenzierte Inhalte

**User-Verantwortung:**
- User muss Rechte an allen Assets haben
- Copyright-Verletzungen vermeiden
- Lizenzierte Musik verwenden (z.B. Epidemic Sound, Artlist)

**System-Hinweise:**
- Disclaimer auf Upload-Seite
- Terms of Service
- "Ich bestätige, dass ich Rechte an allen Inhalten habe"

### 🚫 Keine verbotenen Inhalte

**Geblockter Content:**
- Gewalt, Hate Speech
- Sexuell explizite Inhalte
- Illegale Aktivitäten
- Minderjährige in unangemessenen Kontexten

**Implementierung (optional):**
- Content-Moderation-API (Google Cloud Vision, AWS Rekognition)
- NSFW-Filter (NSFW-JS)
- Text-Moderation (OpenAI Moderation API)

**Fallback ohne API:**
- Community-Reporting
- Manual Review (bei großen Projekten)

### 🔒 Datenschutz

**DSGVO-konform:**
- Assets nach 24h löschen
- Keine Speicherung von User-Daten ohne Consent
- Opt-in für Analytics

**Speicherung:**
- Temp-Files nur während Processing
- Automatisches Cleanup nach Export
- Keine Cloud-Speicherung ohne User-Permission

### 🛡️ Rate-Limiting

**Missbrauch vermeiden:**
- Max. 10 Requests/Stunde pro IP
- Max. 100MB Upload-Size pro Request
- Max. 10 Minuten Video-Dauer

## 10. Beispiel-JSON

### Vollständiges Beispiel mit 8 Szenen

```json
{
  "projectName": "Product Launch Video 2025",
  "format": "16:9",
  "resolution": {
    "width": 1920,
    "height": 1080
  },
  "fps": 30,
  "preset": "cinematic",
  "quality": "high",
  "exportFormat": "mp4",
  "scenes": [
    {
      "assetPath": "hero-shot.jpg",
      "assetType": "image",
      "duration": 5,
      "animation": "ken-burns-in",
      "animationIntensity": 0.8,
      "transition": "fade",
      "transitionDuration": 1.5,
      "textOverlays": [
        {
          "text": "Introducing Our New Product",
          "position": "middle-center",
          "fontSize": 72,
          "fontFamily": "Arial",
          "color": "#FFFFFF",
          "animation": "fade-in",
          "startTime": 1,
          "duration": 4
        }
      ],
      "filters": {
        "brightness": -0.1,
        "contrast": 0.2,
        "saturation": -0.05
      }
    },
    {
      "assetPath": "feature-1.jpg",
      "assetType": "image",
      "duration": 4,
      "animation": "zoom-in",
      "animationIntensity": 0.6,
      "transition": "crossfade",
      "transitionDuration": 1,
      "textOverlays": [
        {
          "text": "Premium Design",
          "position": "bottom-center",
          "fontSize": 56,
          "color": "#FFFFFF",
          "backgroundColor": "rgba(0, 0, 0, 0.6)",
          "animation": "slide-in"
        }
      ]
    },
    {
      "assetPath": "feature-2.jpg",
      "assetType": "image",
      "duration": 3.5,
      "animation": "pan-right",
      "animationIntensity": 0.7,
      "transition": "crossfade",
      "transitionDuration": 0.8,
      "textOverlays": [
        {
          "text": "Advanced Technology",
          "position": "bottom-center",
          "fontSize": 56,
          "color": "#FFFFFF",
          "backgroundColor": "rgba(0, 0, 0, 0.6)",
          "animation": "slide-in"
        }
      ],
      "filters": {
        "brightness": 0,
        "contrast": 0.15,
        "saturation": 0
      }
    },
    {
      "assetPath": "feature-3.jpg",
      "assetType": "image",
      "duration": 4,
      "animation": "ken-burns-out",
      "animationIntensity": 0.5,
      "transition": "crossfade",
      "transitionDuration": 1,
      "textOverlays": [
        {
          "text": "Sustainable Materials",
          "position": "bottom-center",
          "fontSize": 56,
          "color": "#FFFFFF",
          "backgroundColor": "rgba(0, 0, 0, 0.6)",
          "animation": "slide-in"
        }
      ]
    },
    {
      "assetPath": "lifestyle-1.jpg",
      "assetType": "image",
      "duration": 3.5,
      "animation": "pan-left",
      "animationIntensity": 0.6,
      "transition": "slide-left",
      "transitionDuration": 0.7,
      "filters": {
        "brightness": 0.05,
        "contrast": 0.1,
        "saturation": 0.1
      }
    },
    {
      "assetPath": "lifestyle-2.jpg",
      "assetType": "image",
      "duration": 3.5,
      "animation": "zoom-in",
      "animationIntensity": 0.7,
      "transition": "crossfade",
      "transitionDuration": 1
    },
    {
      "assetPath": "team-photo.jpg",
      "assetType": "image",
      "duration": 4,
      "animation": "ken-burns-in",
      "animationIntensity": 0.4,
      "transition": "fade",
      "transitionDuration": 1,
      "textOverlays": [
        {
          "text": "Crafted with Passion",
          "position": "top-center",
          "fontSize": 48,
          "color": "#FFFFFF",
          "animation": "fade-in",
          "startTime": 0.5,
          "duration": 3.5
        }
      ]
    },
    {
      "assetPath": "cta-image.jpg",
      "assetType": "image",
      "duration": 5,
      "animation": "zoom-in",
      "animationIntensity": 0.5,
      "transition": "fade",
      "transitionDuration": 1.5,
      "textOverlays": [
        {
          "text": "Available Now",
          "position": "middle-center",
          "fontSize": 64,
          "color": "#FFFFFF",
          "animation": "slide-in",
          "startTime": 0.5,
          "duration": 4.5
        },
        {
          "text": "www.yourproduct.com",
          "position": "bottom-center",
          "fontSize": 40,
          "color": "#FFD700",
          "animation": "fade-in",
          "startTime": 2,
          "duration": 3
        }
      ],
      "filters": {
        "brightness": 0.1,
        "contrast": 0.15,
        "saturation": 0
      }
    }
  ],
  "audio": {
    "backgroundMusic": "epic-cinematic.mp3",
    "musicVolume": 0.25,
    "voiceover": null,
    "voiceoverVolume": 1.0
  },
  "subtitles": {
    "enabled": false,
    "language": "en",
    "format": "srt"
  }
}
```

### Beispiel 2: Social Media 9:16 (TikTok/Reels)

```json
{
  "projectName": "Product Teaser - Social",
  "format": "9:16",
  "fps": 30,
  "preset": "social-fast",
  "quality": "high",
  "exportFormat": "mp4",
  "scenes": [
    {
      "assetPath": "hook.jpg",
      "duration": 1.5,
      "animation": "zoom-in",
      "transition": "cut",
      "transitionDuration": 0,
      "textOverlays": [
        {
          "text": "WAIT FOR IT...",
          "position": "top-center",
          "fontSize": 72,
          "color": "#FFFF00",
          "animation": "slide-in"
        }
      ]
    },
    {
      "assetPath": "reveal.jpg",
      "duration": 2,
      "animation": "ken-burns-out",
      "transition": "cut",
      "transitionDuration": 0,
      "textOverlays": [
        {
          "text": "🔥 NEW DROP 🔥",
          "position": "middle-center",
          "fontSize": 80,
          "color": "#FF0000",
          "animation": "fade-in"
        }
      ]
    },
    {
      "assetPath": "product-1.jpg",
      "duration": 1.8,
      "animation": "zoom-in",
      "transition": "cut"
    },
    {
      "assetPath": "product-2.jpg",
      "duration": 1.8,
      "animation": "zoom-in",
      "transition": "cut"
    },
    {
      "assetPath": "product-3.jpg",
      "duration": 1.8,
      "animation": "zoom-in",
      "transition": "cut"
    },
    {
      "assetPath": "cta.jpg",
      "duration": 2.5,
      "animation": "ken-burns-in",
      "transition": "fade",
      "transitionDuration": 0.3,
      "textOverlays": [
        {
          "text": "SHOP NOW",
          "position": "bottom-center",
          "fontSize": 64,
          "color": "#FFFFFF",
          "backgroundColor": "#000000",
          "animation": "slide-in"
        }
      ]
    }
  ],
  "audio": {
    "backgroundMusic": "energetic-beat.mp3",
    "musicVolume": 0.4
  }
}
```

## 11. Akzeptanzkriterien (Definition of Done)

### ✅ Muss-Kriterien

1. **Asset-Upload funktioniert**
   - Min. 1 Bild uploadbar
   - Max. 50MB pro File
   - Formate: JPG, PNG, WebP

2. **JSON-Parsing funktioniert**
   - Valides JSON wird akzeptiert
   - Invalides JSON wird abgelehnt mit klarer Fehlermeldung
   - Preset wird korrekt angewendet

3. **Video wird generiert**
   - Output ist gültige MP4-Datei
   - Auflösung korrekt
   - Dauer korrekt (±5%)
   - Keine schwarzen Balken

4. **Animationen funktionieren**
   - Ken Burns sichtbar
   - Zoom sichtbar
   - Pan sichtbar
   - Smooth (kein Ruckeln)

5. **Übergänge funktionieren**
   - Fade funktioniert
   - Crossfade funktioniert
   - Wipe funktioniert
   - Slide funktioniert

6. **Text-Overlays sichtbar**
   - Text an richtiger Position
   - Font-Size korrekt
   - Farbe korrekt
   - Animation (fade-in/slide-in) funktioniert

7. **Quality Checks laufen**
   - Asset-Validierung
   - Szenen-Validierung
   - Timeline-Generierung
   - Fehler werden gemeldet

8. **Fehlerbehandlung funktioniert**
   - Fehlende Assets → Fallback
   - Invalides JSON → Fehlermeldung
   - Rendering-Fehler → Logged

### ⚡ Kann-Kriterien (optional)

- Audio-Mixing (Background Music, Voiceover)
- TTS-Integration
- Untertitel-Generierung
- Multi-Format-Export (YouTube + TikTok gleichzeitig)
- Face-Detection für Smart Crop
- Content-Moderation

## 12. Testplan

### Test 1: Basic Video Generation

**Input:**
- 3 Bilder (1920x1080 JPG)
- JSON mit 3 Szenen, Preset "cinematic"

**Expected Output:**
- MP4-Video, 1920x1080, 30fps
- Dauer: ~12s (3 Szenen à 4s)
- Ken Burns Animation sichtbar
- Fade-Transitions zwischen Szenen

**Pass-Kriterien:**
- Video abspielbar
- Keine Fehler
- Animations smooth

---

### Test 2: Text Overlays

**Input:**
- 2 Bilder
- JSON mit 2 Szenen, jeweils Text-Overlay

**Expected Output:**
- Video mit sichtbaren Text-Overlays
- Text an korrekter Position
- Animation (fade-in) sichtbar

**Pass-Kriterien:**
- Text lesbar
- Kein Text außerhalb Safe-Zone
- Animation smooth

---

### Test 3: Multi-Format (9:16 Portrait)

**Input:**
- 4 Bilder (beliebiges Aspekt-Ratio)
- JSON mit Format "9:16", Preset "social-fast"

**Expected Output:**
- Video 1080x1920 (Portrait)
- Kürze Szenen (~1.5s)
- Cut-Transitions
- Kein schwarze Balken (Smart Crop)

**Pass-Kriterien:**
- Aspekt-Ratio korrekt
- Bilder nicht verzerrt
- Fast-paced feeling

---

### Test 4: Fehlerbehandlung - Fehlende Assets

**Input:**
- 2 Bilder hochgeladen
- JSON referenziert 3 Bilder (1 fehlt)

**Expected Output:**
- Validierungs-Fehler ODER
- Fallback: Erstes Bild wird für fehlende Szene verwendet
- Warning geloggt

**Pass-Kriterien:**
- Klare Fehlermeldung ODER
- Video mit Fallback
- Keine Crash

---

### Test 5: Stress Test - Viele Szenen

**Input:**
- 20 Bilder
- JSON mit 20 Szenen, gemischte Animationen

**Expected Output:**
- Video mit 20 Szenen (~60s)
- Alle Animationen funktionieren
- Keine Performance-Issues

**Pass-Kriterien:**
- Video rendert in < 5 Minuten
- Keine Timeouts
- Alle Szenen enthalten

## 13. Prompt für Programmier-KI

**Verwende den folgenden Prompt, um den Video-Produktions-Agenten von einer KI umsetzen zu lassen:**

---

### 🤖 KI-PROMPT: Video Production Agent Implementation

**Aufgabe:** Implementiere einen vollständigen Video-Produktions-Agenten als Next.js 14 Web-App mit Remotion 4 für Video-Rendering.

#### Anforderungen:

1. **Tech-Stack:**
   - Next.js 14 (App Router)
   - TypeScript
   - Remotion 4
   - Tailwind CSS
   - Zod (Validierung)

2. **Funktionalität:**
   - Asset-Upload (Bilder/Videos via Web-UI)
   - JSON-Editor für Projekt-Konfiguration
   - Video-Generierung mit Remotion
   - Preview + Download

3. **Features:**
   - Animationen: Ken Burns, Zoom, Pan (10 Typen)
   - Übergänge: Fade, Crossfade, Wipe, Slide (7 Typen)
   - Text-Overlays mit Positionen + Animationen
   - 3 Presets: Cinematic, Corporate, Social-Fast
   - Multi-Format: 16:9, 9:16, 1:1, 4:5
   - Quality Settings: Low, Medium, High, Ultra

4. **Dateistruktur:**

```
/
├── app/
│   ├── page.tsx          # Main UI (Upload + Editor)
│   ├── layout.tsx
│   ├── globals.css
│   └── api/
│       ├── generate/route.ts  # Video generation endpoint
│       └── validate/route.ts  # Validation endpoint
├── lib/
│   ├── scene-parser.ts   # JSON parsing + validation
│   ├── asset-manager.ts  # Asset handling
│   └── video-renderer.ts # Rendering logic
├── remotion/
│   ├── Root.tsx          # Remotion root
│   ├── VideoComposition.tsx  # Main composition
│   ├── AnimatedScene.tsx     # Scene with animations
│   ├── TextOverlay.tsx       # Text component
│   └── Transition.tsx        # Transition effects
├── types/
│   └── project.ts        # TypeScript types + Zod schemas
├── package.json
├── tsconfig.json
├── next.config.mjs
└── tailwind.config.ts
```

5. **JSON-Schema:** (siehe Abschnitt 2 in SPECIFICATION.md)

6. **CLI-Kommandos:**

```bash
# Installation
npm install

# Development
npm run dev

# Build
npm run build

# Production
npm run start
```

7. **API-Endpunkte:**

- `POST /api/generate` - Video generieren
  - Input: FormData (files + project JSON)
  - Output: MP4-File

- `POST /api/validate` - Projekt validieren
  - Input: JSON
  - Output: Validation Result

8. **Qualitäts-Checks:**
   - Asset-Validierung (Dateien vorhanden, Auflösung OK)
   - JSON-Validierung (Zod)
   - Timeline-Generierung
   - Safe-Zones für Text
   - Smart Crop (keine schwarzen Balken)

9. **Fehlerbehandlung:**
   - Fehlende Assets → Fallback (erstes verfügbares)
   - Invalides JSON → Klare Fehlermeldung
   - Rendering-Fehler → Logged + User-Info

10. **README-Inhalt:**

````markdown
# Video Production Agent

AI-powered video production from images and scripts.

## Features
- 🎬 Automated video creation from images
- ✨ 10 animation types (Ken Burns, Zoom, Pan, etc.)
- 🎞️ 7 transition effects (Fade, Crossfade, Wipe, Slide)
- 📝 Text overlays with animations
- 🎨 3 presets (Cinematic, Corporate, Social-Fast)
- 📐 Multi-format support (16:9, 9:16, 1:1, 4:5)

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Usage

1. Upload images
2. Paste/Edit project JSON
3. Click "Generate Video"
4. Download result

## Example JSON

```json
{
  "projectName": "Demo Video",
  "format": "16:9",
  "preset": "cinematic",
  "scenes": [
    {
      "assetPath": "image1.jpg",
      "duration": 4,
      "animation": "ken-burns-in",
      "transition": "fade"
    }
  ]
}
```

## Tech Stack
- Next.js 14
- Remotion 4
- TypeScript
- Tailwind CSS
````

11. **Start-Reihenfolge:**
   - Erstelle Dateistruktur
   - Implementiere Types + Schemas (types/project.ts)
   - Implementiere Scene Parser (lib/scene-parser.ts)
   - Implementiere Asset Manager (lib/asset-manager.ts)
   - Implementiere Remotion Components (remotion/)
   - Implementiere API Routes (app/api/)
   - Implementiere UI (app/page.tsx)
   - Teste mit Beispiel-JSON

12. **Wichtig:**
   - TypeScript strict mode
   - Error Handling überall
   - Logging für Debugging
   - Comments für komplexe Logic
   - Responsive UI (Mobile + Desktop)

---

**Zusätzliche Informationen:**
- Komplette Spezifikation in `SPECIFICATION.md`
- Beispiel-JSON in Abschnitt 10
- Testplan in Abschnitt 12

**Ziel:** Vollständig funktionsfähige Web-App, die lokal lauffähig ist und auf Vercel deployed werden kann.

---

## 14. Weitere Hinweise

### Performance-Optimierung

**Rendering:**
- Parallel-Processing für Szenen (wo möglich)
- Image-Compression (Sharp)
- Video-Chunk-Processing
- Caching von Assets

**Upload:**
- Client-Side-Validation vor Upload
- Progressive Upload (große Files)
- Image-Preview-Generation

### Monitoring & Logging

**Logs:**
- Timestamp für jeden Step
- Error-Stack-Traces
- Asset-Processing-Time
- Rendering-Time
- Output-File-Size

**Metrics:**
- Durchschnittliche Rendering-Zeit
- Erfolgs-/Fehler-Rate
- Beliebteste Presets
- Durchschnittliche Szenenzahl

### Skalierung

**Für größere Projekte:**
- Queue-System (BullMQ + Redis)
- Worker-Nodes (separate Rendering-Server)
- CDN für Assets (S3 + CloudFront)
- Database für Projekt-Storage (PostgreSQL)
- Webhook-Callbacks für async Processing

**Kosten-Optimierung:**
- On-Demand-Rendering (keine idle Instances)
- Asset-Compression
- Smart-Caching

---

## Zusammenfassung

Dieser Video-Produktions-Agent ist ein vollständiges System, das:

✅ **Input verarbeitet:** Bilder + JSON-Skript
✅ **Validiert:** Assets, JSON, Quality Checks
✅ **Rendert:** Animationen, Übergänge, Text
✅ **Exportiert:** MP4 in verschiedenen Formaten
✅ **Fehler behandelt:** Fallbacks, Warnings, Logs
✅ **Konfigurierbar ist:** Presets, Custom-Settings
✅ **Web-basiert ist:** Next.js + Remotion, Vercel-Ready

Der Agent kann **direkt von einer KI umgesetzt** werden mit dem Prompt aus Abschnitt 13.

**Alle Anforderungen erfüllt:**
- ✅ Architektur-Übersicht
- ✅ Datenformate (JSON-Schema, Manifest)
- ✅ Agent-Workflow (12 Schritte)
- ✅ Animation/Editing-Regeln
- ✅ Tool-Stack (Next.js, Remotion, TypeScript)
- ✅ Qualitätskontrolle
- ✅ Fehlerbehandlung
- ✅ Konfigurierbarkeit (3 Presets)
- ✅ Sicherheits-/Rechte-Hinweise
- ✅ Beispiel-JSON (2 vollständige Beispiele)
- ✅ Akzeptanzkriterien + Testplan
- ✅ Copy/Paste-Ready KI-Prompt
