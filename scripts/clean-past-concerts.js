// Node script to remove past concerts from eventsContent
import fs from 'fs';
import path from 'path';

const eventsPath = path.resolve(process.cwd(), 'src', 'content', 'events.js');

function loadEvents() {
  const raw = fs.readFileSync(eventsPath, 'utf-8');
  // Use eval to get the exported array (since file uses ES module export)
  // We'll extract the array literal between brackets.
  const match = raw.match(/export const eventsContent = (\[([\s\S]*?)\]);/);
  if (!match) {
    console.error('Could not parse events file');
    process.exit(1);
  }
  const arrayText = match[1];
  // eslint-disable-next-line no-eval
  const events = eval(arrayText);
  return { raw, events, startIdx: match.index, endIdx: match.index + match[0].length };
}

function saveEvents(raw, events) {
  const newArrayText = JSON.stringify(events, null, 2).replace(/"([^\"]+)":/g, '$1:'); // simple conversion to object style
  const newContent = raw.replace(/export const eventsContent = \[[\s\S]*?\];/, `export const eventsContent = ${newArrayText};`);
  fs.writeFileSync(eventsPath, newContent, 'utf-8');
}

function isFuture(event) {
  const today = new Date();
  const eventDate = new Date(event.date);
  // keep events that are today or in future
  return eventDate >= today;
}

function main() {
  const { raw, events } = loadEvents();
  const filtered = events.filter(isFuture);
  if (filtered.length === events.length) {
    console.log('No past concerts to remove.');
    return;
  }
  saveEvents(raw, filtered);
  console.log(`Removed ${events.length - filtered.length} past concert(s).`);
}

main();
