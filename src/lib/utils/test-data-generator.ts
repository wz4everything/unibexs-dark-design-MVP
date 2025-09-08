/**
 * Test Data Generator for Arabic Students
 * 
 * Generates realistic test data for Arabic students to accelerate testing
 * of the New Application flow with culturally appropriate data.
 */

interface ArabicStudentData {
  // Student Information
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationality: string;
  passportNumber: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  
  // Contact Information
  currentAddress: string;
  permanentAddress: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  
  // Academic Background
  highestEducation: string;
  graduationYear: number;
  gpa: number;
  englishProficiencyType: string;
  englishProficiencyScore: string;
}

interface ArabicProgramData {
  universityName: string;
  programName: string;
  programLevel: 'Foundation' | 'Diploma' | 'Bachelor' | 'Master' | 'PhD';
  programUrl: string;
  intendedIntake: string;
  tuitionFee: number;
  commissionPercentage: number;
}

// Arabic Names Database
const ARABIC_NAMES = {
  male: {
    first: [
      'محمد', 'أحمد', 'علي', 'حسن', 'عمر', 'عبدالله', 'خالد', 'سعد', 'فهد', 'سلطان',
      'عبدالعزيز', 'يوسف', 'إبراهيم', 'عبدالرحمن', 'ماجد', 'طارق', 'نايف', 'بندر', 'راشد', 'سلمان'
    ],
    last: [
      'الخالدي', 'السعيدي', 'النعيمي', 'الراشدي', 'العلي', 'الأحمد', 'المحمدي', 'الحسني', 
      'العمري', 'الفهدي', 'السلماني', 'اليوسفي', 'الطارقي', 'الماجدي', 'البندري', 'النايفي'
    ]
  },
  female: {
    first: [
      'فاطمة', 'عائشة', 'مريم', 'زينب', 'خديجة', 'سارة', 'نورا', 'ريم', 'أمل', 'هند',
      'لطيفة', 'منى', 'سلمى', 'دانا', 'لينا', 'رنا', 'شيماء', 'هالة', 'ندى', 'غادة'
    ],
    last: [
      'الخالدي', 'السعيدي', 'النعيمي', 'الراشدي', 'العلي', 'الأحمد', 'المحمدي', 'الحسني', 
      'العمري', 'الفهدي', 'السلماني', 'اليوسفي', 'الطارقي', 'الماجدي', 'البندري', 'النايفي'
    ]
  }
};

// Countries and their data
const ARABIC_COUNTRIES = {
  'Saudi Arabia': {
    code: 'SA',
    phonePrefix: '+966',
    cities: ['Riyadh', 'Jeddah', 'Dammam', 'Mecca', 'Medina', 'Khobar', 'Taif'],
    addressPatterns: [
      'King Fahd Road, {city}',
      'Prince Sultan Street, {city}', 
      'Al-Olaya District, {city}',
      'King Abdullah Road, {city}',
      'Al-Malaz District, {city}'
    ]
  },
  'UAE': {
    code: 'AE',
    phonePrefix: '+971',
    cities: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Fujairah', 'Ras Al Khaimah'],
    addressPatterns: [
      'Sheikh Zayed Road, {city}',
      'Dubai Marina, {city}',
      'Downtown {city}',
      'Business Bay, {city}',
      'Al-Karama District, {city}'
    ]
  },
  'Kuwait': {
    code: 'KW',
    phonePrefix: '+965',
    cities: ['Kuwait City', 'Hawalli', 'Salmiya', 'Jahra', 'Ahmadi'],
    addressPatterns: [
      'Salem Al-Mubarak Street, {city}',
      'Arabian Gulf Road, {city}',
      'Al-Salam District, {city}',
      'Fahad Al-Salem Street, {city}'
    ]
  },
  'Oman': {
    code: 'OM',
    phonePrefix: '+968',
    cities: ['Muscat', 'Salalah', 'Nizwa', 'Sohar', 'Sur'],
    addressPatterns: [
      'Sultan Qaboos Street, {city}',
      'Al-Khuwair District, {city}',
      'Ruwi Commercial District, {city}',
      'Al-Seeb Area, {city}'
    ]
  },
  'Qatar': {
    code: 'QA',
    phonePrefix: '+974',
    cities: ['Doha', 'Al Rayyan', 'Al Wakrah', 'Al Khor'],
    addressPatterns: [
      'Corniche Road, {city}',
      'West Bay Area, {city}',
      'Al-Sadd District, {city}',
      'Pearl Qatar, {city}'
    ]
  },
  'Bahrain': {
    code: 'BH',
    phonePrefix: '+973',
    cities: ['Manama', 'Muharraq', 'Riffa', 'Hamad Town'],
    addressPatterns: [
      'King Faisal Highway, {city}',
      'Diplomatic Area, {city}',
      'Seef District, {city}',
      'Juffair Area, {city}'
    ]
  }
};

// Universities popular with Arabic students
const POPULAR_UNIVERSITIES = [
  {
    name: 'Asia Pacific University (APU)',
    programs: [
      { name: 'Computer Science', level: 'Bachelor', fee: 45000 },
      { name: 'Software Engineering', level: 'Bachelor', fee: 47000 },
      { name: 'Information Technology', level: 'Bachelor', fee: 43000 },
      { name: 'MBA', level: 'Master', fee: 55000 },
      { name: 'Data Science', level: 'Master', fee: 52000 }
    ]
  },
  {
    name: 'Taylor\'s University',
    programs: [
      { name: 'Business Administration', level: 'Bachelor', fee: 48000 },
      { name: 'Engineering', level: 'Bachelor', fee: 52000 },
      { name: 'Medicine', level: 'Bachelor', fee: 180000 },
      { name: 'Architecture', level: 'Bachelor', fee: 55000 },
      { name: 'Accounting', level: 'Bachelor', fee: 45000 }
    ]
  },
  {
    name: 'Universiti Teknologi PETRONAS (UTP)',
    programs: [
      { name: 'Petroleum Engineering', level: 'Bachelor', fee: 58000 },
      { name: 'Chemical Engineering', level: 'Bachelor', fee: 55000 },
      { name: 'Electrical Engineering', level: 'Bachelor', fee: 53000 },
      { name: 'Mechanical Engineering', level: 'Bachelor', fee: 54000 }
    ]
  },
  {
    name: 'INTI International University',
    programs: [
      { name: 'Foundation in Science', level: 'Foundation', fee: 25000 },
      { name: 'Foundation in Business', level: 'Foundation', fee: 23000 },
      { name: 'Diploma in Engineering', level: 'Diploma', fee: 35000 },
      { name: 'Psychology', level: 'Bachelor', fee: 46000 }
    ]
  }
];

// Utility functions
const randomChoice = <T>(array: T[]): T => array[Math.floor(Math.random() * array.length)];

const randomNumber = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

const generatePassportNumber = (countryCode: string): string => {
  const numbers = Array.from({ length: 8 }, () => randomNumber(0, 9)).join('');
  return `${countryCode}${numbers}`;
};

const generatePhoneNumber = (phonePrefix: string): string => {
  const numbers = Array.from({ length: 8 }, () => randomNumber(0, 9)).join('');
  return `${phonePrefix}-${numbers.substring(0, 3)}-${numbers.substring(3, 6)}-${numbers.substring(6)}`;
};

const generateEmail = (firstName: string, lastName: string): string => {
  const firstTransliterated = transliterateArabic(firstName);
  const lastTransliterated = transliterateArabic(lastName);
  const domains = ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com'];
  const domain = randomChoice(domains);
  return `${firstTransliterated}.${lastTransliterated}@${domain}`.toLowerCase();
};

const transliterateArabic = (name: string): string => {
  const transliterations: { [key: string]: string } = {
    'محمد': 'Mohammed',
    'أحمد': 'Ahmed', 
    'علي': 'Ali',
    'حسن': 'Hassan',
    'عمر': 'Omar',
    'عبدالله': 'Abdullah',
    'خالد': 'Khalid',
    'سعد': 'Saad',
    'فهد': 'Fahad',
    'سلطان': 'Sultan',
    'عبدالعزيز': 'Abdulaziz',
    'يوسف': 'Youssef',
    'إبراهيم': 'Ibrahim',
    'عبدالرحمن': 'Abdulrahman',
    'ماجد': 'Majed',
    'طارق': 'Tariq',
    'نايف': 'Naif',
    'بندر': 'Bandar',
    'راشد': 'Rashid',
    'سلمان': 'Salman',
    'فاطمة': 'Fatima',
    'عائشة': 'Aisha',
    'مريم': 'Mariam',
    'زينب': 'Zainab',
    'خديجة': 'Khadija',
    'سارة': 'Sarah',
    'نورا': 'Nora',
    'ريم': 'Reem',
    'أمل': 'Amal',
    'هند': 'Hind',
    'لطيفة': 'Latifa',
    'منى': 'Mona',
    'سلمى': 'Salma',
    'دانا': 'Dana',
    'لينا': 'Lina',
    'رنا': 'Rana',
    'شيماء': 'Shaima',
    'هالة': 'Hala',
    'ندى': 'Nada',
    'غادة': 'Ghada',
    'الخالدي': 'Al-Khalidi',
    'السعيدي': 'Al-Saeedi',
    'النعيمي': 'Al-Nuaimi',
    'الراشدي': 'Al-Rashidi',
    'العلي': 'Al-Ali',
    'الأحمد': 'Al-Ahmed',
    'المحمدي': 'Al-Mohammadi',
    'الحسني': 'Al-Hasani',
    'العمري': 'Al-Omari',
    'الفهدي': 'Al-Fahdi',
    'السلماني': 'Al-Salmani',
    'اليوسفي': 'Al-Youssefi',
    'الطارقي': 'Al-Tariqi',
    'الماجدي': 'Al-Majedi',
    'البندري': 'Al-Bandari',
    'النايفي': 'Al-Naifi'
  };
  
  return transliterations[name] || name;
};

const generateBirthDate = (minAge: number = 17, maxAge: number = 25): string => {
  const today = new Date();
  const birthYear = today.getFullYear() - randomNumber(minAge, maxAge);
  const birthMonth = randomNumber(1, 12);
  const birthDay = randomNumber(1, 28); // Use 28 to avoid month-end issues
  
  return `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`;
};

const generateAddress = (country: string, city: string): string => {
  const countryData = ARABIC_COUNTRIES[country as keyof typeof ARABIC_COUNTRIES];
  const pattern = randomChoice(countryData.addressPatterns);
  const houseNumber = randomNumber(100, 9999);
  return `${houseNumber} ${pattern.replace('{city}', city)}`;
};

// Main generator functions
export const generateArabicStudentData = (): ArabicStudentData => {
  const gender = randomChoice(['male', 'female']) as 'male' | 'female';
  const nationality = randomChoice(Object.keys(ARABIC_COUNTRIES));
  const countryData = ARABIC_COUNTRIES[nationality as keyof typeof ARABIC_COUNTRIES];
  
  const firstName = randomChoice(ARABIC_NAMES[gender].first);
  const lastName = randomChoice(ARABIC_NAMES[gender].last);
  const fullName = `${firstName} ${lastName}`;
  
  const city = randomChoice(countryData.cities);
  const address = generateAddress(nationality, city);
  
  // Generate different city for permanent address sometimes
  const permanentCity = Math.random() > 0.3 ? city : randomChoice(countryData.cities);
  const permanentAddress = Math.random() > 0.5 ? address : generateAddress(nationality, permanentCity);
  
  // Generate emergency contact (usually father for both genders)
  const emergencyContactFirstName = randomChoice(ARABIC_NAMES.male.first);
  const emergencyContactName = `${emergencyContactFirstName} ${lastName}`;
  
  const englishTests = ['IELTS', 'TOEFL', 'PTE', 'Duolingo'];
  const englishTest = randomChoice(englishTests);
  let englishScore = '';
  
  switch (englishTest) {
    case 'IELTS':
      englishScore = (5.5 + Math.random() * 3.5).toFixed(1); // 5.5-9.0
      break;
    case 'TOEFL':
      englishScore = String(randomNumber(60, 120));
      break;
    case 'PTE':
      englishScore = String(randomNumber(50, 90));
      break;
    case 'Duolingo':
      englishScore = String(randomNumber(95, 160));
      break;
  }
  
  return {
    fullName,
    firstName: transliterateArabic(firstName),
    lastName: transliterateArabic(lastName),
    email: generateEmail(firstName, lastName),
    phone: generatePhoneNumber(countryData.phonePrefix),
    nationality,
    passportNumber: generatePassportNumber(countryData.code),
    dateOfBirth: generateBirthDate(),
    gender,
    
    currentAddress: address,
    permanentAddress: permanentAddress,
    emergencyContactName: transliterateArabic(emergencyContactName),
    emergencyContactPhone: generatePhoneNumber(countryData.phonePrefix),
    emergencyContactRelationship: randomChoice(['Father', 'Mother', 'Brother', 'Uncle']),
    
    highestEducation: randomChoice(['High School', 'Foundation', 'Diploma', 'Bachelor']),
    graduationYear: randomNumber(2020, 2024),
    gpa: Number((3.2 + Math.random() * 0.8).toFixed(2)), // 3.2-4.0
    englishProficiencyType: englishTest,
    englishProficiencyScore: englishScore,
  };
};

export const generateArabicProgramData = (): ArabicProgramData => {
  const university = randomChoice(POPULAR_UNIVERSITIES);
  const program = randomChoice(university.programs);
  
  // Generate intake dates (next 3 upcoming intakes)
  const today = new Date();
  const intakeMonths = [1, 3, 5, 8, 9, 11]; // Jan, Mar, May, Aug, Sep, Nov
  const currentMonth = today.getMonth() + 1;
  
  // Find next intake month
  const nextIntakeMonth = intakeMonths.find(month => month > currentMonth) || intakeMonths[0];
  const intakeYear = nextIntakeMonth > currentMonth ? today.getFullYear() : today.getFullYear() + 1;
  
  const intakeDate = `${intakeYear}-${String(nextIntakeMonth).padStart(2, '0')}-15`;
  
  return {
    universityName: university.name,
    programName: program.name,
    programLevel: program.level as 'Foundation' | 'Diploma' | 'Bachelor' | 'Master' | 'PhD',
    programUrl: `https://${university.name.toLowerCase().replace(/\s+/g, '')}.edu.my/programs/${program.name.toLowerCase().replace(/\s+/g, '-')}`,
    intendedIntake: intakeDate,
    tuitionFee: program.fee + randomNumber(-5000, 5000), // Add some variation
    commissionPercentage: randomNumber(10, 20), // 10-20% commission
  };
};

// Export combined test data generator
export const generateFullTestData = () => {
  return {
    student: generateArabicStudentData(),
    program: generateArabicProgramData(),
  };
};