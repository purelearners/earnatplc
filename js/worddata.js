// Word Data - Embedded word lists by grade and subject
// This replaces Google Sheets loading
const WORD_DATA = {
    1: {
        "English": [
            { word: "cat", meaning: "A small domestic animal with fur", ipa: "kæt" },
            { word: "dog", meaning: "A domestic animal, man's best friend", ipa: "dɔg" },
            { word: "apple", meaning: "A round red or green fruit", ipa: "ˈæpəl" },
            { word: "run", meaning: "To move quickly on foot", ipa: "rən" },
            { word: "jump", meaning: "To leap into the air", ipa: "dʒəmp" },
            { word: "play", meaning: "To engage in activity for enjoyment", ipa: "pleɪ" },
            { word: "sun", meaning: "The star at the center of our solar system", ipa: "sən" },
            { word: "moon", meaning: "Earth's natural satellite", ipa: "mun" },
            { word: "tree", meaning: "A large plant with branches and leaves", ipa: "tri" },
            { word: "book", meaning: "A set of pages bound together", ipa: "bʊk" }
        ]
    },
    2: {
        "English": [
            { word: "beautiful", meaning: "Pleasing to the eye", ipa: "ˈbjutəfəl" },
            { word: "school", meaning: "A place of learning", ipa: "skul" },
            { word: "friend", meaning: "A person you like and trust", ipa: "frend" },
            { word: "family", meaning: "Parents and children", ipa: "ˈfæməli" },
            { word: "happy", meaning: "Feeling joy and contentment", ipa: "ˈhæpi" },
            { word: "summer", meaning: "The warmest season of the year", ipa: "ˈsəmər" },
            { word: "winter", meaning: "The coldest season of the year", ipa: "ˈwɪntər" },
            { word: "morning", meaning: "The time from sunrise to noon", ipa: "ˈmɔrnɪŋ" },
            { word: "evening", meaning: "The period of day before night", ipa: "ˈivnɪŋ" },
            { word: "celebrate", meaning: "To honor a special occasion", ipa: "ˈseləbreɪt" }
        ]
    },
    3: {
        "English": [
            { word: "adventure", meaning: "An exciting or unusual experience", ipa: "ədˈvenʃər" },
            { word: "necessary", meaning: "Required or needed", ipa: "ˈnesəseri" },
            { word: "knowledge", meaning: "Information learned or understood", ipa: "ˈnɑlɪdʒ" },
            { word: "courage", meaning: "Bravery in facing difficulty", ipa: "ˈkɝɪdʒ" },
            { word: "environment", meaning: "The surroundings or conditions", ipa: "ɪnˈvaɪrənmənt" },
            { word: "behavior", meaning: "The way someone acts", ipa: "bɪˈheɪvyər" },
            { word: "receive", meaning: "To get or accept something", ipa: "rɪˈsiv" },
            { word: "believe", meaning: "To accept as true", ipa: "bɪˈliv" },
            { word: "achieve", meaning: "To accomplish a goal", ipa: "əˈtʃiv" },
            { word: "describe", meaning: "To give details about", ipa: "dɪˈskraɪb" }
        ]
    },
    4: {
        "English": [
            { word: "appreciate", meaning: "To recognize the value of", ipa: "əˈpriʃieɪt" },
            { word: "responsibility", meaning: "A duty or obligation", ipa: "respɑnsəˈbɪləti" },
            { word: "independent", meaning: "Not dependent on others", ipa: "ˌɪndɪˈpendənt" },
            { word: "committee", meaning: "A group appointed for a function", ipa: "kəˈmɪti" },
            { word: "definitely", meaning: "Without doubt", ipa: "ˈdefənətli" },
            { word: "efficient", meaning: "Working in a well-organized way", ipa: "ɪˈfɪʃənt" },
            { word: "business", meaning: "A commercial enterprise", ipa: "ˈbɪznəs" },
            { word: "separate", meaning: "To divide or set apart", ipa: "ˈsepərət" },
            { word: "government", meaning: "The system that runs a country", ipa: "ˈɡəvərnmənt" },
            { word: "available", meaning: "Able to be used", ipa: "əˈveɪləbəl" }
        ]
    },
    5: {
        "English": [
            { word: "contemporary", meaning: "Modern or of the same time period", ipa: "kənˈtempəreri" },
            { word: "persistent", meaning: "Continuing firmly despite difficulty", ipa: "pərˈsɪstənt" },
            { word: "phenomenon", meaning: "A remarkable event or thing", ipa: "fəˈnɑmənən" },
            { word: "sophisticated", meaning: "Complex or refined", ipa: "səˈfɪstɪkeɪtɪd" },
            { word: "accumulate", meaning: "To gather gradually", ipa: "əˈkjuməleɪt" },
            { word: "deliberate", meaning: "Done consciously and intentionally", ipa: "dɪˈlɪbərət" },
            { word: "accommodate", meaning: "To provide lodging or adjust", ipa: "əˈkɑmədeɪt" },
            { word: "maintenance", meaning: "The process of keeping in good condition", ipa: "ˈmeɪntənəns" },
            { word: "consequence", meaning: "A result or effect", ipa: "ˈkɑnsəkwens" },
            { word: "bibliography", meaning: "A list of books or sources", ipa: "ˌbɪbliˈɑɡrəfi" }
        ]
    }
};

// Load all word data
function loadWordData() {
    try {
        allWordsData = [];
        subjectsByGrade = {};

        // Process embedded word data
        Object.keys(WORD_DATA).forEach(gradeStr => {
            const grade = parseInt(gradeStr);
            subjectsByGrade[grade] = [];

            Object.keys(WORD_DATA[gradeStr]).forEach(subject => {
                if (!subjectsByGrade[grade].includes(subject)) {
                    subjectsByGrade[grade].push(subject);
                }

                WORD_DATA[gradeStr][subject].forEach((wordObj, index) => {
                    allWordsData.push({
                        grade: grade,
                        subject: subject,
                        setId: Math.floor(index / 10),
                        index: index,
                        ...wordObj
                    });
                });
            });
        });

        console.log('Word data loaded:', allWordsData.length, 'words');
        console.log('Subjects by grade:', subjectsByGrade);
        return true;

    } catch (error) {
        console.error('Error loading word data:', error);
        return false;
    }
}

// Get words for grade and subject
function getWordsForGradeAndSubject(grade, subject, setId = null) {
    let words = allWordsData.filter(w => w.grade === grade && w.subject === subject);

    if (setId !== null) {
        words = words.filter(w => w.setId === setId);
    }

    return words;
}

// Get all subjects for a grade
function getSubjectsForGrade(grade) {
    return subjectsByGrade[grade] || [];
}

// Get number of sets for a subject
function getSetCountForSubject(grade, subject) {
    const words = getWordsForGradeAndSubject(grade, subject);
    const maxSetId = Math.max(...words.map(w => w.setId), -1);
    return maxSetId + 1;
}