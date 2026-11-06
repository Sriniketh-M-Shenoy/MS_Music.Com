// Node script to remove past concerts from eventsContent
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { filterUpcomingConcerts } from '../src/utils/concerts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const eventsPath = path.resolve(__dirname, '..', 'src', 'content', 'events.js');

function loadEvents() {
  if (!fs.existsSync(eventsPath)) {
    console.error(`Events file not found at: ${eventsPath}`);
    process.exit(1);
  }
  const raw = fs.readFileSync(eventsPath, 'utf-8');
  const match = raw.match(/export const eventsContent = (\[[\s\S]*?\]);/);
  if (!match) {
    console.error('Could not parse export const eventsContent array in events.js');
    process.exit(1);
  }
  const arrayText = match[1];
  // eslint-disable-next-line no-eval
  const events = eval(arrayText);
  return { raw, events };
}

function saveEvents(events) {
  const newArrayText = JSON.stringify(events, null, 2).replace(/"([a-zA-Z0-9_]+)":/g, '$1:');
  const fileContent = `export const eventsContent = ${newArrayText};\n`;
  fs.writeFileSync(eventsPath, fileContent, 'utf-8');
}

export function cleanPastConcerts() {
  const { events } = loadEvents();
  const initialCount = events.length;
  const filtered = filterUpcomingConcerts(events);

  if (filtered.length === initialCount) {
    console.log(`[Clean Concerts] All ${initialCount} concert(s) are upcoming or today. No past concerts to remove.`);
    return { pruned: 0, retained: initialCount, events: filtered };
  }

  saveEvents(filtered);
  console.log(`[Clean Concerts] Successfully pruned ${initialCount - filtered.length} past concert(s). ${filtered.length} upcoming concert(s) retained.`);
  return { pruned: initialCount - filtered.length, retained: filtered.length, events: filtered };
}

function main() {
  cleanPastConcerts();
}

// Run immediately if executed directly via CLI
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
