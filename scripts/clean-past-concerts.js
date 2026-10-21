// Node script to remove past concerts from eventsContent
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

function isFutureOrToday(event) {
  if (!event || !event.date) return false;
  // Parse event date (YYYY-MM-DD)
  const [year, month, day] = event.date.split('-').map(Number);
  if (!year || !month || !day) return true; // keep if non-standard

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const eventDate = new Date(year, month - 1, day);
  eventDate.setHours(0, 0, 0, 0);

  return eventDate.getTime() >= today.getTime();
}

function main() {
  const { events } = loadEvents();
  const initialCount = events.length;
  const filtered = events.filter(isFutureOrToday);

  if (filtered.length === initialCount) {
    console.log(`[Clean Concerts] All ${initialCount} concert(s) are upcoming or today. No past concerts to remove.`);
    return;
  }

  saveEvents(filtered);
  console.log(`[Clean Concerts] Successfully pruned ${initialCount - filtered.length} past concert(s). ${filtered.length} upcoming concert(s) retained.`);
}

main();
