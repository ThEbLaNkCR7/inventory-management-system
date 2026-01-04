// Test script to verify date accuracy and conversion
const { englishToNepali, formatNepaliDate } = require('./lib/nepaliDateUtils.ts');

console.log('=== Date Accuracy Test ===\n');

// Test current date
const now = new Date();
console.log('Current English Date:', now.toISOString().split('T')[0]);
console.log('Current English Date (formatted):', now.toLocaleDateString('en-US'));

try {
  const nepaliDate = englishToNepali(now);
  console.log('Current Nepali Date:', formatNepaliDate(nepaliDate, 'YYYY MMMM DD'));
  console.log('Current Nepali Year:', nepaliDate.getYear());
  console.log('Current Nepali Month:', nepaliDate.getMonth() + 1);
  console.log('Current Nepali Day:', nepaliDate.getDate());
} catch (error) {
  console.error('Error converting to Nepali date:', error.message);
}

console.log('\n=== Sample Date Conversions ===\n');

// Test some sample dates
const testDates = [
  '2024-01-15',
  '2024-06-15', 
  '2024-12-25',
  '2023-04-14', // Nepali New Year
  '2023-10-28'  // Tihar
];

testDates.forEach(dateStr => {
  const date = new Date(dateStr);
  console.log(`English: ${dateStr} (${date.toLocaleDateString('en-US')})`);
  
  try {
    const nepaliDate = englishToNepali(date);
    const nepaliFormatted = formatNepaliDate(nepaliDate, 'YYYY MMMM DD');
    console.log(`Nepali:  ${nepaliFormatted}`);
  } catch (error) {
    console.log(`Nepali:  Error - ${error.message}`);
  }
  console.log('');
});

console.log('=== Date Picker Format Test ===\n');

// Test the format that will be used in the DatePicker
const sampleDate = new Date('2024-06-15');
console.log('Sample Date:', sampleDate.toISOString().split('T')[0]);

try {
  const nepaliDate = englishToNepali(sampleDate);
  const nepaliFormatted = formatNepaliDate(nepaliDate, 'YYYY MMMM DD');
  const englishFormatted = sampleDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric', 
    month: 'long',
    day: 'numeric'
  });
  
  console.log('DatePicker Display Format:');
  console.log(`${nepaliFormatted} (${englishFormatted})`);
} catch (error) {
  console.error('Error in DatePicker format test:', error.message);
} 