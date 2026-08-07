// Backtest-Logger: läuft stündlich per GitHub Actions (siehe .github/workflows/backtest-log.yml).
// Loggt (a) was jedes Modell für mehrere zukünftige Stunden vorhersagt und (b) den echten
// DWD-Messwert für "jetzt" — Grundlage, um W_NEAR/W_FAR in index.html später datengetrieben
// statt geschätzt zu setzen. Konstanten sind bewusst aus index.html dupliziert, nicht
// importiert (Projekt ist absichtlich build-step-frei).
import { mkdir, appendFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const FUSSEN = { lat: 47.5676, lon: 10.7012 };
const MODELS = ['icon_seamless', 'meteoswiss_icon_ch1', 'ecmwf_ifs', 'gfs_seamless', 'meteofrance_seamless'];
const LEAD_HOURS = [0, 6, 24, 48, 72, 96, 120, 144, 168]; // 0h bis 7 Tage, ab Tag 3 im Tagesabstand

const PRED_FILE = fileURLToPath(new URL('../backtest-data/predictions.jsonl', import.meta.url));
const OBS_FILE = fileURLToPath(new URL('../backtest-data/observations.jsonl', import.meta.url));

async function fetchPredictions(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation_probability&models=${MODELS.join(',')}&timezone=UTC&forecast_days=9`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
  const json = await res.json();
  if (!json?.hourly?.time) throw new Error('Open-Meteo: hourly.time fehlt');
  return json;
}

// issuedHourIso: aktuelle volle Stunde in UTC, z.B. "2026-08-06T14:00"
function extractPredictionRows(rawJson, issuedHourIso) {
  const times = rawJson.hourly.time;
  const si = times.findIndex((t) => t >= issuedHourIso);
  if (si === -1) return [];
  const rows = [];
  for (const leadH of LEAD_HOURS) {
    const ti = si + leadH;
    if (ti >= times.length) continue;
    for (const model of MODELS) {
      const temp = rawJson.hourly[`temperature_2m_${model}`]?.[ti];
      const precipProb = rawJson.hourly[`precipitation_probability_${model}`]?.[ti];
      if (temp == null || !isFinite(temp)) continue;
      rows.push({
        issued_at: `${times[si]}Z`,
        target_time: `${times[ti]}Z`,
        lead_h: leadH,
        model,
        temp,
        precip_prob: precipProb != null && isFinite(precipProb) ? precipProb : null,
      });
    }
  }
  return rows;
}

async function fetchObservation(lat, lon) {
  const url = `https://api.brightsky.dev/current_weather?lat=${lat}&lon=${lon}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Bright Sky ${res.status}`);
  const json = await res.json();
  if (!json?.weather || !json?.sources) throw new Error('Bright Sky: weather/sources fehlt');
  return json;
}

function buildObservationRow(brightSkyJson) {
  const w = brightSkyJson.weather;
  if (w.temperature == null) return null;
  const source = brightSkyJson.sources.find((s) => s.id === w.source_id) ?? brightSkyJson.sources[0];
  return {
    time: w.timestamp,
    temp: w.temperature,
    precip_mm: w.precipitation_60 ?? null,
    station: source?.station_name ?? null,
    dist_m: source?.distance ?? null,
    source: 'brightsky',
  };
}

async function appendJsonlLines(filePath, rows) {
  if (!rows.length) return;
  await mkdir(dirname(filePath), { recursive: true });
  const text = rows.map((r) => JSON.stringify(r)).join('\n') + '\n';
  await appendFile(filePath, text, 'utf8');
}

async function main() {
  const now = new Date();
  const issuedHourIso = now.toISOString().slice(0, 13) + ':00'; // "2026-08-06T14:00"

  let predRows = [];
  let obsRow = null;

  try {
    const raw = await fetchPredictions(FUSSEN.lat, FUSSEN.lon);
    predRows = extractPredictionRows(raw, issuedHourIso);
  } catch (e) {
    console.log(`::warning::predictions fetch failed: ${e.message}`);
  }

  try {
    const raw = await fetchObservation(FUSSEN.lat, FUSSEN.lon);
    obsRow = buildObservationRow(raw);
  } catch (e) {
    console.log(`::warning::observation fetch failed: ${e.message}`);
  }

  await appendJsonlLines(PRED_FILE, predRows);
  await appendJsonlLines(OBS_FILE, obsRow ? [obsRow] : []);

  console.log(`Logged ${predRows.length} prediction row(s), ${obsRow ? 1 : 0} observation row(s).`);

  if (predRows.length === 0 && !obsRow) {
    console.log('::error::both sources failed, nothing logged this hour');
    process.exit(1);
  }
}

main();
