// Google Sheets CSV URL - REPLACE WITH YOUR SHEET URL
// Instructions to get your URL:
// 1. Go to your Google Sheet
// 2. Click Share → Make it "Anyone with link can view"
// 3. Get Share link: https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit
// 4. Replace YOUR_SHEET_ID in the URL below

const GOOGLE_SHEETS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRh5GoW3bvEFhA9qODh5k6FJCFD-A4a_Fu4nb3irpPgWng6kyFlJ3m3Lrr-ZHFYo5thtEMeUJ8mVsqH/pub?output=csv';

// Global variables
let allWordsData = [];
let subjectsByGrade = {};
let dataLoaded = false;

// Load word data from Google Sheets
async function loadWordData() {
    try {
        console.log('Loading word data from Google Sheets...');
        showLoading(true);
        
        // Fetch CSV from Google Sheets
        const response = await fetch(GOOGLE_SHEETS_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const csvText = await response.text();
        console.log('CSV fetched. First 500 chars:', csvText.substring(0, 500));
        
        // Parse CSV
        const lines = csvText.trim().split('\n');
        if (lines.length < 2) {
            throw new Error('CSV appears to be empty or invalid');
        }
        
        // Get headers
        const headers = lines[0].split(',').map(h => h.trim());
        console.log('Headers found:', headers);
        
        // Find column indices (case-insensitive)
        const gradeIndex = headers.findIndex(h => h.toLowerCase() === 'grade');
        const subjectIndex = headers.findIndex(h => h.toLowerCase() === 'subject');
        const wordIndex = headers.findIndex(h => h.toLowerCase() === 'word');
        const meaningIndex = headers.findIndex(h => h.toLowerCase() === 'meaning');
        const ipaIndex = headers.findIndex(h => h.toLowerCase() === 'ipa');
        
        if (gradeIndex === -1 || subjectIndex === -1 || wordIndex === -1) {
            throw new Error(`Required columns not found. Found: ${headers.join(', ')}`);
        }
        
        console.log(`Column indices - Grade: ${gradeIndex}, Subject: ${subjectIndex}, Word: ${wordIndex}, Meaning: ${meaningIndex}, IPA: ${ipaIndex}`);
        
        // Parse data rows
        allWordsData = [];
        subjectsByGrade = {};
        
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            // Handle CSV with quoted fields
            const fields = parseCSVLine(line);
            
            if (fields.length > Math.max(gradeIndex, subjectIndex, wordIndex)) {
                const grade = parseInt(fields[gradeIndex].trim());
                const subject = fields[subjectIndex].trim();
                const word = fields[wordIndex].trim();
                const meaning = meaningIndex >= 0 ? fields[meaningIndex].trim() : 'Word definition';
                const ipa = ipaIndex >= 0 ? fields[ipaIndex].trim() : '';
                
                if (!isNaN(grade) && subject && word) {
                    // Initialize grade if needed
                    if (!subjectsByGrade[grade]) {
                        subjectsByGrade[grade] = new Set();
                    }
                    subjectsByGrade[grade].add(subject);
                    
                    // Add word
                    allWordsData.push({
                        grade: grade,
                        subject: subject,
                        word: word,
                        meaning: meaning,
                        ipa: ipa,
                        setId: Math.floor((allWordsData.filter(w => w.grade === grade && w.subject === subject).length) / 10),
                        index: allWordsData.filter(w => w.grade === grade && w.subject === subject).length
                    });
                }
            }
        }
        
        // Convert Sets to Arrays
        Object.keys(subjectsByGrade).forEach(grade => {
            subjectsByGrade[grade] = Array.from(subjectsByGrade[grade]).sort();
        });
        
        console.log(`Total words loaded: ${allWordsData.length}`);
        console.log('Subjects by grade:', subjectsByGrade);
        
        if (allWordsData.length === 0) {
            throw new Error('No words found in the spreadsheet. Check column names (Grade, Subject, Word, Meaning, IPA)');
        }
        
        dataLoaded = true;
        showLoading(false);
        return true;
        
    } catch (error) {
        console.error('Error loading word data:', error);
        showLoading(false);
        showError('Error loading word data: ' + error.message);
        return false;
    }
}

// Parse CSV line handling quoted fields
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current);
    return result.map(field => field.replace(/^"|"$/g, '').trim());
}

// Get words for grade and subject
function getWordsForGradeAndSubject(grade, subject, setId = null) {
    if (!dataLoaded) {
        console.error('Word data not loaded yet');
        return [];
    }
    
    let words = allWordsData.filter(w => w.grade === grade && w.subject === subject);
    
    if (setId !== null) {
        words = words.filter(w => w.setId === setId);
    }
    
    console.log(`Words for Grade ${grade}, Subject ${subject}, Set ${setId}:`, words.length);
    return words;
}

// Get all subjects for a grade
function getSubjectsForGrade(grade) {
    if (!dataLoaded) {
        console.error('Word data not loaded yet');
        return [];
    }
    
    return subjectsByGrade[grade] || [];
}

// Get number of sets for a subject
function getSetCountForSubject(grade, subject) {
    if (!dataLoaded) {
        return 0;
    }
    
    const words = getWordsForGradeAndSubject(grade, subject);
    const maxSetId = Math.max(...words.map(w => w.setId), -1);
    return maxSetId + 1;
}

// Check if data is loaded
function isDataLoaded() {
    return dataLoaded;
}
