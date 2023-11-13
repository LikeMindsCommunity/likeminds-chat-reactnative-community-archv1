export function generateVoiceNoteName() {
  const currentDate = new Date();
  const timestamp = currentDate
    .toISOString()
    .replace(/[-T:]/g, '')
    .slice(0, -5); // Remove dashes, colons, and seconds

  return `VoiceNote_${timestamp}`; // You can change the file extension or format as needed
}
