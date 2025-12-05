// =============================================================================
// WORDS AND PHRASES DATABASE
// =============================================================================

// Common words database organized by first letter
// Greek word database loaded from wordDatabase.json
let wordDatabaseGreek = {};
let wordDatabaseEnglish = {};
let wordDatabase = {}; // Active database based on keyboard type

// Load Greek word database from JSON file
fetch('wordDatabase.json')
    .then(response => response.json())
    .then(data => {
        wordDatabaseGreek = data;
        // Set as active if Greek is current keyboard or default
        if (!currentKeyboardType || currentKeyboardType === 'greek') {
            wordDatabase = wordDatabaseGreek;
        }
        console.log('Greek word database loaded successfully');
    })
    .catch(error => {
        console.error('Error loading Greek word database:', error);
    });

// Load English word database from JSON file
fetch('wordDatabase-en.json')
    .then(response => response.json())
    .then(data => {
        wordDatabaseEnglish = data;
        // Set as active if English is current keyboard
        if (currentKeyboardType === 'english') {
            wordDatabase = wordDatabaseEnglish;
        }
        console.log('English word database loaded successfully');
    })
    .catch(error => {
        console.error('Error loading English word database:', error);
    });

// Function to switch active word database
function switchWordDatabase(keyboardType) {
    if (keyboardType === 'greek') {
        wordDatabase = wordDatabaseGreek;
    } else if (keyboardType === 'english') {
        wordDatabase = wordDatabaseEnglish;
    } else {
        // For numerical keyboard, use empty database
        wordDatabase = {};
    }
    console.log('[DATABASE] Switched word database to:', keyboardType);
}

// Common Greek phrases
const commonPhrasesGreek = [
    // Greetings and polite expressions
    'καλημέρα',
    'καλησπέρα',
    'καληνύχτα',
    'ευχαριστώ',
    'ευχαριστώ πολύ',
    'παρακαλώ',
    'συγγνώμη',
    'συγγνώμη πολύ',

    // Common questions
    'τι κάνεις',
    'πώς είσαι',
    'πού είναι',
    'τι ώρα είναι',
    'ποιος είναι',

    // Responses
    'καλά είμαι',
    'όχι καλά',
    'πολύ καλά',
    'έτσι κι έτσι',

    // Needs and requests
    'θέλω να',
    'μπορώ να',
    'πρέπει να',
    'χρειάζομαι',
    'χρειάζομαι βοήθεια',
    'χρειάζομαι γιατρό',
    'χρειάζομαι νοσοκόμα',

    // Physical needs
    'πονάω',
    'πονάει εδώ',
    'έχω πόνο',
    'διψάω',
    'θέλω νερό',
    'πεινάω',
    'θέλω φαγητό',
    'είμαι κουρασμένος',
    'θέλω να ξεκουραστώ',
    'θέλω να κοιμηθώ',

    // Comfort requests
    'είναι ζεστό',
    'είναι κρύο',
    'πολύ ζεστό',
    'πολύ κρύο',
    'άνοιξε το παράθυρο',
    'κλείσε το παράθυρο',
    'άνοιξε το φως',
    'κλείσε το φως',

    // Position and movement
    'θέλω να σηκωθώ',
    'θέλω να καθίσω',
    'θέλω να ξαπλώσω',
    'άλλαξε θέση',
    'κινήσου αργά',

    // Bathroom needs
    'τουαλέτα',
    'θέλω τουαλέτα',
    'χρειάζομαι τουαλέτα',

    // Communication
    'ναι ακριβώς',
    'όχι δεν είναι',
    'δεν καταλαβαίνω',
    'καταλαβαίνω',
    'ξανά παρακαλώ',
    'πιο αργά',
    'πιο γρήγορα',
    'επικοινώνησε με',

    // Medical
    'χάπι',
    'θέλω χάπι',
    'φάρμακο',
    'πόνος κεφάλι',
    'δύσκολη αναπνοή',
    'καρδιά',

    // Family and visitors
    'θέλω την οικογένεια',
    'καλέστε τον γιατρό',
    'τηλέφωνο',
    'θέλω τηλέφωνο',

    // Time and scheduling
    'τι ώρα',
    'τι μέρα',
    'πότε θα έρθει',
    'σε λίγο',
    'αργότερα',
    'αύριο',
    'σήμερα',

    // Emergency
    'επείγον',
    'βοήθεια τώρα',
    'γρήγορα',
    'καλέστε ασθενοφόρο',

    // Preferences
    'μου αρέσει',
    'δεν μου αρέσει',
    'θέλω αυτό',
    'όχι αυτό',
    'προτιμώ',

    // Technology
    'τηλεόραση',
    'άνοιξε τηλεόραση',
    'κλείσε τηλεόραση',
    'ραδιόφωνο',
    'βάλε μουσική',
    'ψάξε στο ίντερνετ',

    // Emotions
    'φοβάμαι',
    'είμαι λυπημένος',
    'είμαι χαρούμενος',
    'είμαι θυμωμένος',
    'είμαι αγχωμένος',
    'είμαι ήρεμος',

    // Swear Words
    'Γαμώ το μπελά μου',
    'Γαμώ την πουτάνα μου',
    'Γαμώ την τύχη μου γαμώ μέσα',
    'Στ αρχίδια μου',
    'Χέσε μέσα',
    'Θα πάρει μια μάντρα',
    'Της πουτάνας',
    'Μη μου τα πρήζετε',

];

// Common English phrases
const commonPhrasesEnglish = [
    // Greetings and polite expressions
    'good morning',
    'good afternoon',
    'good evening',
    'good night',
    'thank you',
    'thank you very much',
    'please',
    'sorry',
    'excuse me',

    // Common questions
    'how are you',
    'what time is it',
    'where is',
    'who is',

    // Responses
    'I am fine',
    'not good',
    'very good',
    'so so',

    // Needs and requests
    'I want to',
    'I can',
    'I must',
    'I need',
    'I need help',
    'I need a doctor',
    'I need a nurse',

    // Physical needs
    'I have pain',
    'it hurts',
    'it hurts here',
    'I am thirsty',
    'I want water',
    'I am hungry',
    'I want food',
    'I am tired',
    'I want to rest',
    'I want to sleep',

    // Comfort requests
    'it is hot',
    'it is cold',
    'too hot',
    'too cold',
    'open the window',
    'close the window',
    'turn on the light',
    'turn off the light',

    // Position and movement
    'I want to get up',
    'I want to sit',
    'I want to lie down',
    'change position',
    'move slowly',

    // Bathroom needs
    'toilet',
    'I want toilet',
    'I need toilet',
    'bathroom',

    // Communication
    'yes exactly',
    'no it is not',
    'I don\'t understand',
    'I understand',
    'again please',
    'slower',
    'faster',

    // Medical
    'pill',
    'I want pill',
    'medicine',
    'headache',
    'difficult breathing',
    'heart',

    // Family and visitors
    'I want my family',
    'call the doctor',
    'phone',
    'I want phone',

    // Time and scheduling
    'what time',
    'what day',
    'when will come',
    'in a while',
    'later',
    'tomorrow',
    'today',

    // Emergency
    'urgent',
    'help now',
    'quickly',
    'call ambulance',

    // Preferences
    'I like it',
    'I don\'t like it',
    'I want this',
    'not this',
    'I prefer',

    // Technology
    'television',
    'open television',
    'close television',
    'radio',
    'play music',
    'search internet',

    // Emotions
    'I am scared',
    'I am sad',
    'I am happy',
    'I am angry',
    'I am anxious',
    'I am calm'
];

// Active phrases based on keyboard type
let commonPhrases = commonPhrasesGreek;

// Function to switch active phrase database
function switchPhraseDatabase(keyboardType) {
    if (keyboardType === 'greek') {
        commonPhrases = commonPhrasesGreek;
    } else if (keyboardType === 'english') {
        commonPhrases = commonPhrasesEnglish;
    } else {
        // For numerical keyboard, use empty phrases
        commonPhrases = [];
    }
    console.log('[DATABASE] Switched phrase database to:', keyboardType);
}

