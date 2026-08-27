/* =========================================================================
   MahaSetu — Government Digital Integration Platform (Prototype)
   Frontend-only simulation: mock departmental APIs, canonical data model,
   consent engine, eligibility rules, workflow orchestration, audit trail.
   All data is fabricated demonstration data. No real government systems
   are contacted. See section "MOCK APIS" below for the simulated sources.
   ========================================================================= */

/* ---------------------------- MOCK DATA ---------------------------- */

const DEPARTMENTS = [
  { id: 'revenue', name: 'Revenue Department', code: 'REV' },
  { id: 'social', name: 'Social Justice Department', code: 'SJD' },
  { id: 'education', name: 'Education Department', code: 'EDU' },
  { id: 'rural', name: 'Rural Development Department', code: 'RDD' },
];

const SYSTEMS = [
  { id: 'identity', name: 'Maharashtra Identity Registry', dept: 'revenue', latency: 82 },
  { id: 'residence', name: 'Revenue & Residence Registry', dept: 'revenue', latency: 106 },
  { id: 'income', name: 'Income Verification System', dept: 'revenue', latency: 94 },
  { id: 'education', name: 'Education Records System', dept: 'education', latency: 118 },
  { id: 'benefits', name: 'Benefits Registry', dept: 'social', latency: 101 },
  { id: 'documents', name: 'Document Vault', dept: 'rural', latency: 73 },
];

// Raw per-system records, deliberately using inconsistent field names —
// this is what the normalization layer reconciles into the canonical model.
const CITIZENS = {
  'MH-CIT-99999': {
    citizenId: 'MH-CIT-99999', name: 'Takshil Sangle', email: 'takshils2007@gmail.com',
    identity: { full_name: 'Takshil Sangle', dob: '2007-12-21', aadhaar_masked: 'MASKED-ID-8842', gender: 'Male' },
    residence: { name: 'Takshil Sangle', residentialDistrict: 'Pune', pincode: '411001', state: 'Maharashtra' },
    income: { applicantName: 'Takshil Sangle', annual_income: 180000, financial_year: '2025-26' },
    education: { student_name: 'Takshil Sangle', date_of_birth: '2007-12-21', institution: 'PCCOE&R, Pune', level: 'Undergraduate', status: 'Enrolled' },
    benefits: { name: 'Takshil Sangle', previous_scholarship: false, active_schemes: [] },
    documents: [
      { type: 'Residence Certificate', issuer: 'Revenue Department', issued: '2025-03-11', expires: '2027-03-11', verified: true },
      { type: 'Income Certificate', issuer: 'Revenue Department', issued: '2025-04-02', expires: '2026-04-02', verified: true },
      { type: 'Student ID', issuer: 'Education Department', issued: '2025-06-01', expires: '2026-06-01', verified: true },
      { type: 'Marksheet (HSC)', issuer: 'Education Department', issued: '2023-05-20', expires: null, verified: true },
    ],
  },
  'MH-CIT-20917': {
    citizenId: 'MH-CIT-20917', name: 'Sneha Kulkarni', email: 'sneha@example.com',
    identity: { full_name: 'Sneha Kulkarni', dob: '2004-11-02', aadhaar_masked: 'MASKED-ID-2291', gender: 'Female' },
    residence: { name: 'Sneha Kulkarni', residentialDistrict: 'Nashik', pincode: '422001', state: 'Maharashtra' },
    income: { applicantName: 'Sneha Kulkarni', annual_income: 340000, financial_year: '2025-26' },
    education: { student_name: 'Sneha Kulkarni', date_of_birth: '2004-11-02', institution: 'BYK College, Nashik', level: 'Undergraduate', status: 'Enrolled' },
    benefits: { name: 'Sneha Kulkarni', previous_scholarship: false, active_schemes: [] },
    documents: [
      { type: 'Residence Certificate', issuer: 'Revenue Department', issued: '2025-01-18', expires: '2027-01-18', verified: true },
      { type: 'Income Certificate', issuer: 'Revenue Department', issued: '2025-02-09', expires: '2026-02-09', verified: true },
    ],
  },
};

const SCHEME = {
  id: 'scholarship', name: 'Maharashtra Student Scholarship', dept: 'Education Department',
  eligibility: ['Maharashtra resident', 'Enrolled student', 'Annual family income below ₹2,50,000', 'No previous scholarship received', 'Required documents available'],
  requires: ['identity', 'residence', 'income', 'education', 'benefits', 'documents'],
};







// Government guides data for chatbot
const GOVERNMENT_GUIDES = {
  'driving-license': {
    title: '🚗 Driving License Registration',
    steps: [
      { text: 'Visit the Sarathi Parivahan portal: https://sarathi.parivahan.gov.in', link: 'https://sarathi.parivahan.gov.in' },
      { text: 'Click on "Apply for Learner\'s License" or "Apply for Driving License".' },
      { text: 'Fill in the application form with your personal details.' },
      { text: 'Upload required documents (proof of age, address, passport-sized photos).' },
      { text: 'Pay the fee online.' },
      { text: 'Schedule your test slot at the nearest RTO.' },
      { text: 'Appear for the test (if applicable) and collect your license.' }
    ]
  },
  'passport': {
    title: '🛂 Passport Application',
    steps: [
      { text: 'Register on the Passport Seva portal: https://www.passportindia.gov.in', link: 'https://www.passportindia.gov.in' },
      { text: 'Login and click "Apply for Fresh Passport/Re-issue of Passport".' },
      { text: 'Fill in the application form with your details.' },
      { text: 'Upload required documents (proof of date of birth, address, photos).' },
      { text: 'Pay the fee online.' },
      { text: 'Schedule an appointment at the nearest Passport Seva Kendra (PSK) or Post Office Passport Seva Kendra (POPSK).' },
      { text: 'Visit the PSK/POPSK with original documents for verification.' }
    ]
  },
  'voter-id': {
    title: '🗳️ Voter ID Registration',
    steps: [
      { text: 'Visit the Voter Portal of Election Commission of India: https://voters.eci.gov.in/', link: 'https://voters.eci.gov.in/' },
      { text: 'Click on "Fill Form 6 in New Voter panel"' },
      { text: 'Fill in Form 6 online with your details.' },
      { text: 'Upload required documents (proof of age, address, photo).' },
      { text: 'Submit the form and note the reference ID.' },
      { text: 'Booth Level Officer (BLO) will visit your address for verification.' },
      { text: 'After verification, your voter ID card will be dispatched by post.' }
    ]
  },
  'scholarship': {
    title: '🎓 Maharashtra Student Scholarship Application',
    steps: [
      { text: 'Visit the Maharashtra Government Scholarship Portal: https://mahadbt2.maharashtra.gov.in/', link: 'https://mahadbt2.maharashtra.gov.in/' },
      { text: 'Register on the portal using your Aadhaar or mobile number.' },
      { text: 'Fill in the scholarship application form with your personal and academic details.' },
      { text: 'Upload required documents: residence certificate, income certificate, academic marksheets, and admission proof.' },
      { text: 'Submit the application and note the application ID for tracking.' },
      { text: 'Wait for verification and approval from the concerned department.' },
      { text: 'Once approved, the scholarship amount will be disbursed directly to your bank account.' }
    ]
  }
};

// Language translation system
let currentLang = localStorage.getItem('mahasetu-lang') || 'en'; // default to English

const translations = {
  en: {
    "Marksheet (HSC)": "Marksheet (HSC)",
    "Student ID": "Student ID",
    "Visit the Sarathi Parivahan portal: https://sarathi.parivahan.gov.in": "Visit the Sarathi Parivahan portal: https://sarathi.parivahan.gov.in",
    "Click on \"Apply for Learner's License\" or \"Apply for Driving License\".": "Click on \"Apply for Learner's License\" or \"Apply for Driving License\".",
    "Fill in the application form with your personal details.": "Fill in the application form with your personal details.",
    "Upload required documents (proof of age, address, passport-sized photos).": "Upload required documents (proof of age, address, passport-sized photos).",
    "Pay the fee online.": "Pay the fee online.",
    "Schedule your test slot at the nearest RTO.": "Schedule your test slot at the nearest RTO.",
    "Appear for the test (if applicable) and collect your license.": "Appear for the test (if applicable) and collect your license.",
    "Register on the Passport Seva portal: https://www.passportindia.gov.in": "Register on the Passport Seva portal: https://www.passportindia.gov.in",
    "Login and click \"Apply for Fresh Passport/Re-issue of Passport\".": "Login and click \"Apply for Fresh Passport/Re-issue of Passport\".",
    "Fill in the application form with your details.": "Fill in the application form with your details.",
    "Upload required documents (proof of date of birth, address, photos).": "Upload required documents (proof of date of birth, address, photos).",
    "Schedule an appointment at the nearest Passport Seva Kendra (PSK) or Post Office Passport Seva Kendra (POPSK).": "Schedule an appointment at the nearest Passport Seva Kendra (PSK) or Post Office Passport Seva Kendra (POPSK).",
    "Visit the PSK/POPSK with original documents for verification.": "Visit the PSK/POPSK with original documents for verification.",
    "Visit the Voter Portal of Election Commission of India: https://voters.eci.gov.in/": "Visit the Voter Portal of Election Commission of India: https://voters.eci.gov.in/",
    "Click on \"Fill Form 6 in New Voter panel\"": "Click on \"Fill Form 6 in New Voter panel\"",
    "Fill in Form 6 online with your details.": "Fill in Form 6 online with your details.",
    "Upload required documents (proof of age, address, photo).": "Upload required documents (proof of age, address, photo).",
    "Submit the form and note the reference ID.": "Submit the form and note the reference ID.",
    "Booth Level Officer (BLO) will visit your address for verification.": "Booth Level Officer (BLO) will visit your address for verification.",
    "After verification, your voter ID card will be dispatched by post.": "After verification, your voter ID card will be dispatched by post.",
    "brand": "MahaSetu",
    "how_it_works": "How it works",
    "sign_in": "Sign in",
    "launch_demo": "Launch Demo",
    "hero_title": "A single, consent-driven layer<br>connecting every department.",
    "hero_subtitle": "Citizens stop proving the same facts twice. Departments exchange authorized data, not paperwork.",
    "footer_text": "MahaSetu is a hackathon prototype (SIH26129). All departments, systems, citizens and metrics shown are <strong>simulated demonstration data</strong>. No connection exists to real Aadhaar, DigiLocker, or any Government of Maharashtra database.",
    "english": "English",
    "marathi": "Marathi",
    "hindi": "Hindi",
    "overview": "Overview",
    "government_schemes": "Government Schemes",
    "applications": "Applications",
    "document_vault": "Document Vault",
    "consent_management": "Consent Management",
    "notifications": "Notifications",
    "profile": "Profile",
    "data_privacy": "Data Privacy",
    "home": "Home",
    "exit": "Exit",
    "chatbot": "Chatbot",
    "eligibility_check": "Check My Eligibility",
    "learn_how_to_apply": "Learn How to Apply",
    "already_applied": "Already Applied",
    "active": "Active",
    "coming_soon": "Coming soon",
    "not_yet_onboarded": "Not yet onboarded",
    "verified_via": "Verified via",
    "government_systems": "government systems",
    "welcome_back": "Welcome back",
    "welcome": "Welcome",
    "citizen_id": "Citizen ID",
    "district": "District",
    "verified_information": "Verified information",
    "connected_government_services": "Connected government services",
    "manage_consent": "Manage consent →",
    "active_applications": "Active applications",
    "no_active_applications": "No active applications yet.",
    "browse_schemes": "Browse schemes →",
    "no_applications_yet": "No applications yet.",
    "eligibility_is_checked": "Eligibility is checked automatically against your connected government records — you won't be asked to re-enter information departments already have.",
    "checking_eligibility": "Checking eligibility",
    "result": "Result",
    "submitted": "Submitted",
    "you_are_eligible": "You are eligible",
    "not_currently_eligible": "Not currently eligible",
    "confidence_verified": "Confidence: verified from 5 connected government systems",
    "maharashtra_residence": "Maharashtra residence",
    "student_status": "Student status",
    "income_threshold": "Income threshold (≤ ₹2,50,000)",
    "no_previous_scholarship": "No previous scholarship",
    "required_documents_available": "Required documents available",
    "documents_available_info": "Documents available through connected government systems. You won't be asked to upload these again — MahaSetu reuses the verified record.",
    "connecting_to": "Connecting to",
    "requesting_authorized_record": "Requesting authorized record",
    "record_retrieved": "Record retrieved",
    "section_title": "Section title",
    "identity": "Identity",
    "residence": "Residence",
    "income": "Income",
    "education": "Education",
    "Approved": "Approved",
    "Verified": "Verified",
    "Connected": "Connected",
    "Operational": "Operational",
    "Successful": "Successful",
    "Pending": "Pending",
    "Under Review": "Under Review",
    "Completed": "Completed",
    "In progress": "In progress",
    "Verification": "Verification",
    "Degraded": "Degraded",
    "Rejected": "Rejected",
    "Failed": "Failed",
    "Offline": "Offline",
    "Denied": "Denied",
    "document_reuse_example": "Document reuse example",
    "income_certificate_already_available": "Income Certificate already available",
    "source_revenue_dept_verified": "Source: Revenue Department · Verified ✓",
    "use_existing_document": "Use Existing Document"
    ,
    "Revenue Department": "Revenue Department",
    "Education Department": "Education Department",
    "Social Justice & Special Assistance": "Social Justice & Special Assistance",
    "Rural Development Department": "Rural Development Department",
    "Maharashtra Identity Registry": "Maharashtra Identity Registry",
    "Revenue & Residence Registry": "Revenue & Residence Registry",
    "Income Verification System": "Income Verification System",
    "Education Records System": "Education Records System",
    "Benefits Registry": "Benefits Registry",
    "Document Vault": "Document Vault",
    "Maharashtra Student Scholarship": "Maharashtra Student Scholarship",
    "Residence Certificate": "Residence Certificate",
    "Income Certificate": "Income Certificate",
    "Student ID": "Student ID",
    "Marksheet": "Marksheet",
    "Caste Certificate": "Caste Certificate",
    "Bank Account Proof": "Bank Account Proof",
    "Identity": "Identity",
    "Residence": "Residence",
    "Income": "Income",
    "Education records": "Education records",
    "Previous benefit history": "Previous benefit history",
    "Information Request": "Information Request",
    "wants to access the following": "wants to access the following"
    ,
    "Applications by department": "Applications by department",
    "Processing time — before vs. after MahaSetu": "Processing time — before vs. after MahaSetu",
    "Duplicate verification — before vs. after": "Duplicate verification — before vs. after",
    "Application status": "Application status",
    "Simulated prototype metrics": "Simulated prototype metrics",
    "Education": "Education",
    "Social Justice": "Social Justice",
    "Revenue": "Revenue",
    "Rural Dev.": "Rural Dev.",
    "Before (avg. days)": "Before (avg. days)",
    "After (avg. days)": "After (avg. days)",
    "Before": "Before",
    "After": "After",
    "No audit events yet. Run the eligibility check or data exchange demo to generate a trail.": "No audit events yet. Run the eligibility check or data exchange demo to generate a trail.",
    "Why:": "Why:",
    "Data:": "Data:",
    "Consent:": "Consent:",
    "Departments": "Departments",
    "Name": "Name",
    "Code": "Code",
    "Document types": "Document types",
    "Application statuses": "Application statuses",
    "Scenario controls": "Scenario controls",
    "Session state": "Session state",
    "Drive the hackathon demo without hunting through screens.": "Drive the hackathon demo without hunting through screens.",
    "Run Scholarship Verification": "Run Scholarship Verification",
    "Simulate API Failure (Income System)": "Simulate API Failure (Income System)",
    "Simulate Consent Denial": "Simulate Consent Denial",
    "Approve Latest Application": "Approve Latest Application",
    "Reset Demo": "Reset Demo",
    "Applications this session": "Applications this session",
    "Active consents": "Active consents",
    "Audit events logged": "Audit events logged",
    "API calls logged": "API calls logged"
    ,
    "Social Justice Department": "Social Justice Department"
    ,
    "Requested residence verification via Revenue Department": "Requested residence verification via Revenue Department",
    "Scholarship review — cross-department verification": "Scholarship review — cross-department verification",
    "Granted (existing)": "Granted (existing)",
    "Citizen (self-check)": "Citizen (self-check)",
    "Ran eligibility check for Maharashtra Student Scholarship": "Ran eligibility check for Maharashtra Student Scholarship",
    "Scheme eligibility discovery": "Scheme eligibility discovery",
    "Identity, Residence, Income, Education, Benefits": "Identity, Residence, Income, Education, Benefits",
    "N/A — self view": "N/A — self view",
    "Requested identity verification": "Requested identity verification",
    "Demographic match for application": "Demographic match for application",
    "Denied (No active mandate)": "Denied (No active mandate)"
    ,
    "Rural Housing Assistance": "Rural Housing Assistance",
    "Rural residence": "Rural residence",
    "Household income below ₹1,20,000": "Household income below ₹1,20,000",
    "No existing pucca house": "No existing pucca house",
    "Maharashtra resident": "Maharashtra resident",
    "Enrolled student": "Enrolled student",
    "Annual family income below ₹2,50,000": "Annual family income below ₹2,50,000",
    "No previous scholarship received": "No previous scholarship received"
    ,
    "Maharashtra": "Maharashtra",
    "Enrolled": "Enrolled",
    "Not currently enrolled": "Not currently enrolled",
    "year": "year",
    "Previous scholarship on record": "Previous scholarship on record",
    "No prior record found": "No prior record found",
    "verified documents on file": "verified documents on file"
    ,
    "Existing Income Certificate reused — no re-upload needed": "Existing Income Certificate reused — no re-upload needed",
    "Scopes:": "Scopes:",
    "Granted": "Granted",
    "Expires": "Expires",
    "Revoke": "Revoke",
    "No active consents.": "No active consents.",
    "History": "History",
    "Department": "Department",
    "Purpose": "Purpose",
    "Status": "Status",
    "No consent history yet.": "No consent history yet.",
    "Scholarship application data sharing": "Scholarship application data sharing",
    "Benefits": "Benefits",
    "You're all caught up.": "You're all caught up.",
    "Mark read": "Mark read",
    "Just now": "Just now",
    "Consent revoked": "Consent revoked",
    "Revoked": "Revoked"
    ,
    "You are in control of your data": "You are in control of your data",
    "Your data is shared only when:": "Your data is shared only when:",
    "You authorize access": "You authorize access",
    "The requesting department is authorized": "The requesting department is authorized",
    "The purpose is specified": "The purpose is specified",
    "The requested information is necessary": "The requested information is necessary",
    "Citizen ID:": "Citizen ID:",
    "Date of Birth:": "Date of Birth:",
    "Connected Systems": "Connected Systems",
    "Applications Processed": "Applications Processed",
    "Reduction in Duplicate Verification": "Reduction in Duplicate Verification",
    "Faster Processing": "Faster Processing",
    "Recent applications": "Recent applications",
    "Applicant": "Applicant",
    "Scheme": "Scheme",
    "Verifications": "Verifications",
    "vs. pre-MahaSetu baseline": "vs. pre-MahaSetu baseline",
    "avg. turnaround improvement": "avg. turnaround improvement",
    "All operational": "All operational",
    "↑ 8.2% this month": "↑ 8.2% this month",
    "complete": "complete"
    ,
    "Document": "Document",
    "Issuing department": "Issuing department",
    "Issued": "Issued",
    "Documents": "Documents",
    "Pune": "Pune",
    "Savitribai Phule Pune University": "Savitribai Phule Pune University",
    "Student enrolled at {0}": "Student enrolled at {0}",
    "MahaSetu Assistant": "MahaSetu Assistant",
    "chatbot_welcome": "Hello! I am your MahaSetu Assistant. I can guide you through common government services step-by-step. Please select a topic below:",
    "driving_license": "Driving License Registration",
    "passport_app": "Passport Application",
    "voter_id": "Voter ID Registration",
    "scholarship_app": "Maharashtra Student Scholarship Application",
    "back_to_topics": "Back to topics",
    "Show me guide for {0}": "Show me guide for {0}",
    "🚗 Driving License Registration": "🚗 Driving License Registration",
    "🛂 Passport Application": "🛂 Passport Application",
    "🗳️ Voter ID Registration": "🗳️ Voter ID Registration",
    "🎓 Maharashtra Student Scholarship Application": "🎓 Maharashtra Student Scholarship Application",
    "Visit the Maharashtra Government Scholarship Portal: https://mahadbt2.maharashtra.gov.in/": "Visit the Maharashtra Government Scholarship Portal: https://mahadbt2.maharashtra.gov.in/",
    "Register on the portal using your Aadhaar or mobile number.": "Register on the portal using your Aadhaar or mobile number.",
    "Fill in the scholarship application form with your personal and academic details.": "Fill in the scholarship application form with your personal and academic details.",
    "Upload required documents: residence certificate, income certificate, academic marksheets, and admission proof.": "Upload required documents: residence certificate, income certificate, academic marksheets, and admission proof.",
    "Submit the application and note the application ID for tracking.": "Submit the application and note the application ID for tracking.",
    "Wait for verification and approval from the concerned department.": "Wait for verification and approval from the concerned department.",
    "Once approved, the scholarship amount will be disbursed directly to your bank account.": "Once approved, the scholarship amount will be disbursed directly to your bank account.",
    "Not currently enrolled in an approved institution": "Not currently enrolled in an approved institution",
    "Household income of ₹{0} (Verified via PAN/ITR)": "Household income of ₹{0} (Verified via PAN/ITR)",
    "Income exceeds scholarship threshold": "Income exceeds scholarship threshold",
    "Verified Maharashtra domicile": "Verified Maharashtra domicile",
    "Not a registered resident": "Not a registered resident"
  },
  mr: {
    "Marksheet (HSC)": "गुणपत्रिका (HSC)",
    "Student ID": "विद्यार्थी ओळखपत्र",
    "Visit the Sarathi Parivahan portal: https://sarathi.parivahan.gov.in": "सारथी परिवहन पोर्टलला भेट द्या: https://sarathi.parivahan.gov.in",
    "Click on \"Apply for Learner's License\" or \"Apply for Driving License\".": "\"Apply for Learner's License\" किंवा \"Apply for Driving License\" वर क्लिक करा.",
    "Fill in the application form with your personal details.": "तुमच्या वैयक्तिक तपशीलांसह अर्ज भरा.",
    "Upload required documents (proof of age, address, passport-sized photos).": "आवश्यक कागदपत्रे अपलोड करा (वयाचा पुरावा, पत्ता, पासपोर्ट आकाराचे फोटो).",
    "Pay the fee online.": "शुल्क ऑनलाइन भरा.",
    "Schedule your test slot at the nearest RTO.": "तुमच्या जवळच्या आरटीओमध्ये तुमची चाचणी वेळ निश्चित करा.",
    "Appear for the test (if applicable) and collect your license.": "चाचणीसाठी हजर राहा (लागू असल्यास) आणि तुमचा परवाना गोळा करा.",
    "Register on the Passport Seva portal: https://www.passportindia.gov.in": "पासपोर्ट सेवा पोर्टलवर नोंदणी करा: https://www.passportindia.gov.in",
    "Login and click \"Apply for Fresh Passport/Re-issue of Passport\".": "लॉग इन करा आणि \"Apply for Fresh Passport/Re-issue of Passport\" वर क्लिक करा.",
    "Fill in the application form with your details.": "तुमच्या तपशीलांसह अर्ज भरा.",
    "Upload required documents (proof of date of birth, address, photos).": "आवश्यक कागदपत्रे अपलोड करा (जन्मतारखेचा पुरावा, पत्ता, फोटो).",
    "Schedule an appointment at the nearest Passport Seva Kendra (PSK) or Post Office Passport Seva Kendra (POPSK).": "जवळच्या पासपोर्ट सेवा केंद्र (PSK) किंवा पोस्ट ऑफिस पासपोर्ट सेवा केंद्र (POPSK) मध्ये अपॉइंटमेंट निश्चित करा.",
    "Visit the PSK/POPSK with original documents for verification.": "पडताळणीसाठी मूळ कागदपत्रांसह PSK/POPSK ला भेट द्या.",
    "Visit the Voter Portal of Election Commission of India: https://voters.eci.gov.in/": "भारतीय निवडणूक आयोगाच्या मतदार पोर्टलला भेट द्या: https://voters.eci.gov.in/",
    "Click on \"Fill Form 6 in New Voter panel\"": "\"New Voter panel मध्ये Form 6 भरा\" वर क्लिक करा",
    "Fill in Form 6 online with your details.": "तुमच्या तपशीलांसह फॉर्म 6 ऑनलाइन भरा.",
    "Upload required documents (proof of age, address, photo).": "आवश्यक कागदपत्रे अपलोड करा (वयाचा पुरावा, पत्ता, फोटो).",
    "Submit the form and note the reference ID.": "फॉर्म सबमिट करा आणि संदर्भ आयडी नोंदवून ठेवा.",
    "Booth Level Officer (BLO) will visit your address for verification.": "बूथ लेव्हल ऑफिसर (BLO) पडताळणीसाठी तुमच्या पत्त्यावर भेट देतील.",
    "After verification, your voter ID card will be dispatched by post.": "पडताळणीनंतर, तुमचे मतदार ओळखपत्र पोस्टाने पाठवले जाईल.",
    "brand": "महासेतू",
    "how_it_works": "हा कसे काम करतो",
    "sign_in": "साइन इन करा",
    "launch_demo": "डेमो लॉन्च करा",
    "hero_title": "एकजट, सहमती-आधारित स्तर<br>सर्व विभागां जोडतो",
    "hero_subtitle": "नागरिकांना एकाच माहिती दोनदा साबित करायची आवश्यकता नाही. विभागे अधिकृत डेटा बदलतात, कागजपत्रे नहीं.",
    "footer_text": "महासेतू एक हॅकाथॉन प्रोटोटाइप (SIH26129) आहे. सर्व विभागे, प्रणाली, नागरिक आणि मेट्रिक्स दर्शवितले आहे <strong>सिमुलेटेड डिमонстрेशन डेटा</strong>. काही देखील रियल आधार, डिजिलॉकर, किंवा महाराष्ट्र शासनचे कोणतेही डेटाबेसशी कदाचित कधी देखील कडुन जोड नाही.",
    "english": "इंग्रजी",
    "marathi": "मराठी",
    "hindi": "हिंदी",
    "overview": "परिदर्शन",
    "government_schemes": "सरकारी योजना",
    "applications": "अर्ज",
    "document_vault": "दस्तऐवज भंडार",
    "consent_management": "अनुमती व्यवस्थापन",
    "notifications": "सूचना",
    "profile": "प्रोफाइल",
    "data_privacy": "माहितीचा खाजगीपणा",
    "home": "घर",
    "exit": "निकास",
    "chatbot": "चॅटबॉट",
    "eligibility_check": "पात्रता जांचा",
    "learn_how_to_apply": "आवेदन कसे करायचे शिकवा",
    "already_applied": "पहिलेला अर्ज केला",
    "active": "सक्रिय",
    "coming_soon": "जलद येणार",
    "not_yet_onboarded": "अद्याप जोडलेली नाही",
    "verified_via": "सत्यापित माध्यमातून",
    "government_systems": "सरकारी प्रणालींमध्ये",
    "welcome_back": "पुनः स्वागत आहे",
    "welcome": "स्वागत आहे",
    "citizen_id": "नागरिक आयडी",
    "district": "जिल्हा",
    "verified_information": "सत्यापित माहिती",
    "connected_government_services": "जोडलेली सरकारी सेवा",
    "manage_consent": "अनुमती व्यवस्थापन करा →",
    "active_applications": "सक्रिय अर्ज",
    "no_active_applications": " इतके सक्रिय अर्ज नाही.",
    "browse_schemes": "योजना बघा →",
    "no_applications_yet": "काही अर्ज आला नाही.",
    "eligibility_is_checked": "योग्यता स्वचालितरूपे तुमच्या जोडलेली सरकारी अभिलेखांवर जांच केली जाते — तुम्हाला पुन्हा माहिती देण्याची आवश्यकता नाही जे विभागे आधीच उपलब्ध आहेत.",
    "checking_eligibility": "योग्यता तपासणी जारी आहे",
    "result": "परिणाम",
    "submitted": "सादर केले",
    "you_are_eligible": "तुम्ही योग्य हो",
    "not_currently_eligible": "तुम्ही अद्याप योग्य नाही",
    "confidence_verified": "विश्वास: 5 जोडलेली सरकारी प्रणालींमध्ये सत्यापित",
    "maharashtra_residence": "महाराष्ट्रातील निवासी",
    "student_status": "विद्यार्थी स्थिती",
    "income_threshold": "आय सीमा (≤ ₹2,50,000)",
    "no_previous_scholarship": "कधीच छात्रवृत्ती मिळाली नाही",
    "required_documents_available": "आवश्यक दस्तऐवज उपलब्ध आहेत",
    "documents_available_info": "संयुक्त सरकारी प्रणालीमधील दस्तऐवज उपलब्ध आहेत. पुन्हा अपलोड करण्याची आवश्यकता nahi — MahaSetu सत्यापित अभिलेख पुर्वापयोग करतो.",
    "connecting_to": "जोडत आहे",
    "requesting_authorized_record": "अधिकृत अभिलेख मागणे",
    "record_retrieved": "अभिलेख मिळाले",
    "section_title": "विभाग शिर्षक",
    "identity": "ओळख",
    "residence": "निवास",
    "income": "आय",
    "education": "शिक्षा",
    "Approved": "मंजूर",
    "Verified": "सत्यापित",
    "Connected": "जोडले",
    "Operational": "चालू",
    "Successful": "यशस्वी",
    "Pending": "प्रतीक्षित",
    "Under Review": "तपासणी जारी आहे",
    "Verification": "सत्यापन",
    "Degraded": "कमी",
    "Rejected": "अस्वीकृत",
    "Failed": "अयशस्वी",
    "Offline": "ऑफलाइन",
    "Denied": "मना केले",
    "document_reuse_example": "दस्तऐवज पुर्वापयोग उदाहरण",
    "income_certificate_already_available": "आय प्रमाणपत्र आधीच उपलब्ध आहे",
    "source_revenue_dept_verified": "स्रोत: आय विभाग · सत्यापित ✓",
    "use_existing_document": "अस्तित्वस्थित दस्तऐवज वापरा",
    "crumb_c_overview": "नागरिक / अवलोकन",
    "crumb_c_schemes": "नागरिक / योजना",
    "crumb_c_applications": "नागरिक / अर्ज",
    "crumb_c_documents": "नागरिक / दस्तऐवज भंडार",
    "crumb_c_consent": "नागरिक / अनुमती व्यवस्थापन",
    "crumb_c_notifications": "नागरिक / सूचना",
    "crumb_c_chatbot": "नागरिक / चॅटबॉट",
    "crumb_profile": "नागरिक / प्रोफाइल",
    "crumb_privacy": "माहितीचा खाजगीपणा",
    "crumb_login": "",
    "crumb_landing": "",
    "Completed": "पूर्ण झाला",
    "In progress": "पूरNGTH आहे"
    ,
    "Revenue Department": "महसूल विभाग",
    "Education Department": "शिक्षण विभाग",
    "Social Justice & Special Assistance": "सामाजिक न्याय आणि विशेष सहाय्य",
    "Rural Development Department": "ग्रामविकास विभाग",
    "Maharashtra Identity Registry": "महाराष्ट्र ओळख नोंदणी",
    "Revenue & Residence Registry": "महसूल आणि निवास नोंदणी",
    "Income Verification System": "उत्पन्न पडताळणी प्रणाली",
    "Education Records System": "शिक्षण अभिलेख प्रणाली",
    "Benefits Registry": "लाभ नोंदणी",
    "Document Vault": "दस्तऐवज कोठार",
    "Maharashtra Student Scholarship": "महाराष्ट्र विद्यार्थी शिष्यवृत्ती",
    "Residence Certificate": "रहिवासी प्रमाणपत्र",
    "Income Certificate": "उत्पन्न प्रमाणपत्र",
    "Student ID": "विद्यार्थी ओळखपत्र",
    "Marksheet": "गुणपत्रिका",
    "Caste Certificate": "जात प्रमाणपत्र",
    "Bank Account Proof": "बँक खाते पुरावा",
    "Identity": "ओळख",
    "Residence": "निवास",
    "Income": "उत्पन्न",
    "Education records": "शिक्षण अभिलेख",
    "Previous benefit history": "मागील लाभ इतिहास",
    "Information Request": "माहिती विनंती",
    "wants to access the following": "खालील माहिती पाहू इच्छितो"
    ,
    "Applications by department": "विभागानुसार अर्ज",
    "Processing time — before vs. after MahaSetu": "प्रक्रिया वेळ — महासेतू आधी आणि नंतर",
    "Duplicate verification — before vs. after": "दुहेरी पडताळणी — आधी आणि नंतर",
    "Application status": "अर्जाची स्थिती",
    "Simulated prototype metrics": "सिम्युलेटेड प्रोटोटाइप मेट्रिक्स",
    "Education": "शिक्षण",
    "Social Justice": "सामाजिक न्याय",
    "Revenue": "महसूल",
    "Rural Dev.": "ग्रामविकास",
    "Before (avg. days)": "आधी (सरासरी दिवस)",
    "After (avg. days)": "नंतर (सरासरी दिवस)",
    "Before": "आधी",
    "After": "नंतर",
    "No audit events yet. Run the eligibility check or data exchange demo to generate a trail.": "अद्याप कोणतेही ऑडिट इव्हेंट नाहीत. ट्रेल जनरेट करण्यासाठी पात्रता तपासणी किंवा डेटा एक्सचेंज डेमो चालवा.",
    "Why:": "का:",
    "Data:": "डेटा:",
    "Consent:": "संमती:",
    "Departments": "विभाग",
    "Name": "नाव",
    "Code": "कोड",
    "Document types": "दस्तऐवज प्रकार",
    "Application statuses": "अर्जाच्या स्थिती",
    "Scenario controls": "परिदृश्य नियंत्रणे",
    "Session state": "सत्राची स्थिती",
    "Drive the hackathon demo without hunting through screens.": "स्क्रीनमध्ये न शोधता हॅकाथॉन डेमो चालवा.",
    "Run Scholarship Verification": "शिष्यवृत्ती पडताळणी चालवा",
    "Simulate API Failure (Income System)": "API बिघाड सिम्युलेट करा (उत्पन्न प्रणाली)",
    "Simulate Consent Denial": "संमती नकार सिम्युलेट करा",
    "Approve Latest Application": "नवीनतम अर्ज मंजूर करा",
    "Reset Demo": "डेमो रीसेट करा",
    "Applications this session": "या सत्रातील अर्ज",
    "Active consents": "सक्रिय संमती",
    "Audit events logged": "नोंदवलेले ऑडिट इव्हेंट",
    "API calls logged": "नोंदवलेले API कॉल्स"
    ,
    "Social Justice Department": "सामाजिक न्याय विभाग"
    ,
    "Requested residence verification via Revenue Department": "महसूल विभागामार्फत रहिवासी पडताळणीची विनंती केली",
    "Scholarship review — cross-department verification": "शिष्यवृत्ती पुनरावलोकन - आंतर-विभागीय पडताळणी",
    "Granted (existing)": "मंजूर (विद्यमान)",
    "Citizen (self-check)": "नागरिक (स्वत: तपासणी)",
    "Ran eligibility check for Maharashtra Student Scholarship": "महाराष्ट्र विद्यार्थी शिष्यवृत्तीसाठी पात्रता तपासणी चालवली",
    "Scheme eligibility discovery": "योजना पात्रता शोध",
    "Identity, Residence, Income, Education, Benefits": "ओळख, निवास, उत्पन्न, शिक्षण, लाभ",
    "N/A — self view": "लागू नाही — स्वतःचे दृश्य",
    "Requested identity verification": "ओळख पडताळणीची विनंती केली",
    "Demographic match for application": "अर्जासाठी लोकसंख्याशास्त्रीय जुळणी",
    "Denied (No active mandate)": "नाकारले (सक्रिय आदेश नाही)"
    ,
    "Rural Housing Assistance": "ग्रामीण गृहनिर्माण सहाय्य",
    "Rural residence": "ग्रामीण रहिवासी",
    "Household income below ₹1,20,000": "कौटुंबिक उत्पन्न ₹१,२०,००० पेक्षा कमी",
    "No existing pucca house": "सध्याचे पक्के घर नाही",
    "Maharashtra resident": "महाराष्ट्राचा रहिवासी",
    "Enrolled student": "नोंदणीकृत विद्यार्थी",
    "Annual family income below ₹2,50,000": "कौटुंबिक वार्षिक उत्पन्न ₹२,५०,००० पेक्षा कमी",
    "No previous scholarship received": "यापूर्वी कोणतीही शिष्यवृत्ती मिळालेली नाही",
    "Required documents available": "आवश्यक कागदपत्रे उपलब्ध"
    ,
    "Maharashtra residence": "महाराष्ट्र निवास",
    "Student status": "विद्यार्थी स्थिती",
    "Income threshold (≤ ₹2,50,000)": "उत्पन्न मर्यादा (≤ ₹२,५०,०००)",
    "No previous scholarship": "यापूर्वी कोणतीही शिष्यवृत्ती नाही",
    "Maharashtra": "महाराष्ट्र",
    "Enrolled": "नोंदणीकृत",
    "Not currently enrolled": "सध्या नोंदणीकृत नाही",
    "year": "वर्ष",
    "Previous scholarship on record": "मागील शिष्यवृत्तीची नोंद आहे",
    "No prior record found": "कोणतीही पूर्व नोंद आढळली नाही",
    "verified documents on file": "पडताळणी केलेली कागदपत्रे फाईलमध्ये आहेत"
    ,
    "Income Certificate already available": "उत्पन्न प्रमाणपत्र आधीपासूनच उपलब्ध",
    "Source: Revenue Department · Verified ✓": "स्रोत: महसूल विभाग · पडताळणी केली ✓",
    "Use Existing Document": "विद्यमान कागदपत्र वापरा",
    "Existing Income Certificate reused — no re-upload needed": "विद्यमान उत्पन्न प्रमाणपत्र वापरले - पुन्हा अपलोड करण्याची गरज नाही",
    "Scopes:": "अधिकार क्षेत्र:",
    "Granted": "मंजूर",
    "Expires": "कालबाह्य",
    "Revoke": "रद्द करा",
    "No active consents.": "सक्रिय संमती नाही.",
    "History": "इतिहास",
    "Department": "विभाग",
    "Purpose": "उद्देश",
    "Status": "स्थिती",
    "No consent history yet.": "अद्याप संमतीचा इतिहास नाही.",
    "Scholarship application data sharing": "शिष्यवृत्ती अर्ज डेटा शेअरिंग",
    "Benefits": "लाभ",
    "You're all caught up.": "तुम्ही सर्व काही अद्ययावत पाहिले आहे.",
    "Mark read": "वाचलेले खूण करा",
    "Just now": "आताच",
    "Consent revoked": "संमती रद्द केली",
    "Revoked": "रद्द केली",
    "Active": "सक्रिय"
    ,
    "Home": "मुख्यपृष्ठ",
    "You are in control of your data": "तुमचा डेटा तुमच्या नियंत्रणात आहे",
    "Your data is shared only when:": "तुमचा डेटा फक्त तेव्हाच शेअर केला जातो जेव्हा:",
    "You authorize access": "तुम्ही प्रवेश अधिकृत करता",
    "The requesting department is authorized": "विनंती करणारा विभाग अधिकृत आहे",
    "The purpose is specified": "उद्देश नमूद केलेला आहे",
    "The requested information is necessary": "विनंती केलेली माहिती आवश्यक आहे",
    "Citizen ID:": "नागरिक आयडी:",
    "Date of Birth:": "जन्म तारीख:",
    "Connected Systems": "जोडलेल्या प्रणाली",
    "Applications Processed": "प्रक्रिया केलेले अर्ज",
    "Reduction in Duplicate Verification": "दुहेरी पडताळणीमध्ये घट",
    "Faster Processing": "जलद प्रक्रिया",
    "Recent applications": "अलीकडील अर्ज",
    "Applicant": "अर्जदार",
    "Scheme": "योजना",
    "Verifications": "पडताळणी",
    "vs. pre-MahaSetu baseline": "महासेतू-पूर्व बेसलाइनच्या तुलनेत",
    "avg. turnaround improvement": "सरासरी टर्नअराउंड सुधारणा",
    "All operational": "सर्व चालू आहेत",
    "↑ 8.2% this month": "↑ ८.२% या महिन्यात",
    "complete": "पूर्ण"
    ,
    "Document": "कागदपत्र",
    "Issuing department": "जारी करणारा विभाग",
    "Issued": "जारी केले",
    "Documents": "कागदपत्रे",
    "Pune": "पुणे",
    "Savitribai Phule Pune University": "सावित्रीबाई फुले पुणे विद्यापीठ",
    "Student enrolled at {0}": "Student enrolled at {0}",
    "MahaSetu Assistant": "महासेतू असिस्टंट",
    "chatbot_welcome": "नमस्कार! मी तुमचा महासेतू असिस्टंट आहे. मी तुम्हाला सामान्य सरकारी सेवांसाठी टप्प्याटप्प्याने मार्गदर्शन करू शकेन. कृपया खालीलपैकी एक विषय निवडा:",
    "driving_license": "ड्रायव्हिंग लायसन्स नोंदणी",
    "passport_app": "पासपोर्ट अर्ज",
    "voter_id": "मतदार ओळखपत्र नोंदणी",
    "scholarship_app": "महाराष्ट्र विद्यार्थी शिष्यवृत्ती अर्ज",
    "back_to_topics": "विषयांकडे परत जा",
    "Show me guide for {0}": "Show me guide for {0}",
    "Step": "टप्पा",
    "🚗 Driving License Registration": "🚗 ड्रायव्हिंग लायसन्स नोंदणी",
    "🛂 Passport Application": "🛂 पासपोर्ट अर्ज",
    "🗳️ Voter ID Registration": "🗳️ मतदार ओळखपत्र नोंदणी",
    "🎓 Maharashtra Student Scholarship Application": "🎓 महाराष्ट्र विद्यार्थी शिष्यवृत्ती अर्ज",
    "Visit the Maharashtra Government Scholarship Portal: https://mahadbt2.maharashtra.gov.in/": "महाराष्ट्र सरकारी शिष्यवृत्ती पोर्टलला भेट द्या: https://mahadbt2.maharashtra.gov.in/",
    "Register on the portal using your Aadhaar or mobile number.": "तुमचा आधार किंवा मोबाईल नंबर वापरून पोर्टलवर नोंदणी करा.",
    "Fill in the scholarship application form with your personal and academic details.": "तुमच्या वैयक्तिक आणि शैक्षणिक तपशीलांसह शिष्यवृत्ती अर्ज भरा.",
    "Upload required documents: residence certificate, income certificate, academic marksheets, and admission proof.": "आवश्यक कागदपत्रे अपलोड करा: रहिवासी प्रमाणपत्र, उत्पन्नाचा दाखला, शैक्षणिक गुणपत्रिका आणि प्रवेशाचा पुरावा.",
    "Submit the application and note the application ID for tracking.": "अर्ज सबमिट करा आणि ट्रॅकिंगसाठी अर्ज आयडी नोंदवून ठेवा.",
    "Wait for verification and approval from the concerned department.": "संबंधित विभागाकडून पडताळणी आणि मंजुरीची प्रतीक्षा करा.",
    "Once approved, the scholarship amount will be disbursed directly to your bank account.": "मंजुरी मिळाल्यावर, शिष्यवृत्तीची रक्कम थेट तुमच्या बँक खात्यात जमा केली जाईल.",
    "Student enrolled at {0}": "विद्यार्थी {0} मध्ये नोंदणीकृत",
    "Not currently enrolled in an approved institution": "सध्या मान्यताप्राप्त संस्थेत नोंदणीकृत नाही",
    "Household income of ₹{0} (Verified via PAN/ITR)": "Household income of ₹{0} (Verified via PAN/ITR)",
    "Income exceeds scholarship threshold": "उत्पन्न शिष्यवृत्ती मर्यादेपेक्षा जास्त आहे",
    "Verified Maharashtra domicile": "सत्यापित महाराष्ट्र अधिवास",
    "Not a registered resident": "नोंदणीकृत रहिवासी नाही"
  },
  hi: {
    "Marksheet (HSC)": "मार्कशीट (HSC)",
    "Student ID": "छात्र पहचान पत्र",
    "Visit the Sarathi Parivahan portal: https://sarathi.parivahan.gov.in": "सारथी परिवहन पोर्टल पर जाएँ: https://sarathi.parivahan.gov.in",
    "Click on \"Apply for Learner's License\" or \"Apply for Driving License\".": "\"Apply for Learner's License\" या \"Apply for Driving License\" पर क्लिक करें।",
    "Fill in the application form with your personal details.": "अपने व्यक्तिगत विवरण के साथ आवेदन पत्र भरें।",
    "Upload required documents (proof of age, address, passport-sized photos).": "आवश्यक दस्तावेज़ अपलोड करें (आयु प्रमाण, पता, पासपोर्ट आकार के फोटो)।",
    "Pay the fee online.": "शुल्क का भुगतान ऑनलाइन करें।",
    "Schedule your test slot at the nearest RTO.": "अपने निकटतम आरटीओ में अपना परीक्षण स्लॉट निर्धारित करें।",
    "Appear for the test (if applicable) and collect your license.": "परीक्षण के लिए उपस्थित हों (यदि लागू हो) और अपना लाइसेंस प्राप्त करें।",
    "Register on the Passport Seva portal: https://www.passportindia.gov.in": "पासपोर्ट सेवा पोर्टल पर पंजीकरण करें: https://www.passportindia.gov.in",
    "Login and click \"Apply for Fresh Passport/Re-issue of Passport\".": "लॉगिन करें और \"Apply for Fresh Passport/Re-issue of Passport\" पर क्लिक करें।",
    "Fill in the application form with your details.": "अपने विवरण के साथ आवेदन पत्र भरें।",
    "Upload required documents (proof of date of birth, address, photos).": "आवश्यक दस्तावेज़ अपलोड करें (जन्मतिथि प्रमाण, पता, फोटो)।",
    "Schedule an appointment at the nearest Passport Seva Kendra (PSK) or Post Office Passport Seva Kendra (POPSK).": "निकटतम पासपोर्ट सेवा केंद्र (PSK) या डाकघर पासपोर्ट सेवा केंद्र (POPSK) में अपॉइंटमेंट निर्धारित करें।",
    "Visit the PSK/POPSK with original documents for verification.": "सत्यापन के लिए मूल दस्तावेजों के साथ PSK/POPSK पर जाएँ।",
    "Visit the Voter Portal of Election Commission of India: https://voters.eci.gov.in/": "भारत के चुनाव आयोग के मतदाता पोर्टल पर जाएँ: https://voters.eci.gov.in/",
    "Click on \"Fill Form 6 in New Voter panel\"": "\"New Voter panel में Form 6 भरें\" पर क्लिक करें",
    "Fill in Form 6 online with your details.": "अपने विवरण के साथ फॉर्म 6 ऑनलाइन भरें।",
    "Upload required documents (proof of age, address, photo).": "आवश्यक दस्तावेज़ अपलोड करें (आयु प्रमाण, पता, फोटो)।",
    "Submit the form and note the reference ID.": "फॉर्म जमा करें और संदर्भ आईडी नोट करें।",
    "Booth Level Officer (BLO) will visit your address for verification.": "बूथ लेवल ऑफिसर (BLO) सत्यापन के लिए आपके पते पर आएंगे।",
    "After verification, your voter ID card will be dispatched by post.": "सत्यापन के बाद, आपका मतदाता पहचान पत्र डाक द्वारा भेजा जाएगा।",
    "brand": "महासेतू",
    "how_it_works": "यह कैसे काम करता है",
    "sign_in": "साइन इन करें",
    "launch_demo": "डेमो लॉन्च करें",
    "hero_title": "एक सहमति-आधारित स्तर<br>हर विभाग से जुड़ता है।",
    "hero_subtitle": "नागरिकों को बार-बार उन्ही तथ्य साबित करने की जरूरत नहीं। विभाग अधिकृत डेटा का आदान-प्रदान करते हैं, कागजी दस्तावेजों का नहीं।",
    "footer_text": "महासेतू एक हैकathon प्रोटोटाइप (SIH26129) है। दिखाए गए सभी विभाग, प्रणाली, नागरिक और मेट्रिक्स <strong>सिमुलेटेड डेमोनस्ट्रेशन डेटा</strong> हैं। वास्तविक आधार, डिजिलॉकर, या किसी भारत सरकार डेटाबेस से कोई संबंध नहीं है।",
    "english": "अंग्रेज़ी",
    "marathi": "मराठी",
    "hindi": "हिंदी",
    "overview": "अवलोकन",
    "data_privacy": "डेटा गोपनीयता",
    "home": "घर",
    "profile": "प्रोफ़ाइल",
    "notifications": "सूचनाएँ",
    "exit": "बाहर निकलें",
    "government_schemes": "सरकारी योजनाएँ",
    "applications": "आवेदन",
    "document_vault": "दस्तावेज़ भंडार",
    "consent_management": "सहमति प्रबंधन",
    "chatbot": "चैटबॉट",
    "eligibility_check": "पात्रता जाँच करें",
    "learn_how_to_apply": "आवेदन कैसे लगाएं सीखें",
    "already_applied": "पहले ही आवेदन किया गया",
    "active": "सक्रिय",
    "coming_soon": "जल्द आ रहा है",
    "not_yet_onboarded": "अभी तक जुड़ा नहीं है",
    "verified_via": "के माध्यम से सत्यापित",
    "government_systems": "सरकारी प्रणालियों के माध्यम से",
    "welcome_back": "वापस स्वागत है",
    "welcome": "स्वागत है",
    "citizen_id": "नागरिक आईडी",
    "district": "जिला",
    "verified_information": "सत्यापित जानकारी",
    "connected_government_services": "जुड़ी हुई सरकारी सेवाएँ",
    "manage_consent": "सहमति प्रबंधन →",
    "active_applications": "सक्रिय आवेदन",
    "no_active_applications": "अभी तक कोई सक्रिय आवेदन नहीं।",
    "no_applications_yet": "कभी आवेदन नहीं किया।",
    "browse_schemes": "योजनाएँ ब्राउज़ करें →",
    "eligibility_is_checked": "पात्रता स्वचालित रूप से आपके जुड़े सरकारी रिकॉर्ड्स के खिलाफ जाँच की जाती है — आपको उन विभागों द्वारा पहले ही रखी गई जानकारी फिर से दर्ज करने की आवश्यकता नहीं होती।",
    "checking_eligibility": "पात्रता जाँच की जा रही है",
    "result": "परिणाम",
    "you_are_eligible": "आप पात्र हैं",
    "not_currently_eligible": "आप वर्तमान में पात्र नहीं हैं",
    "confidence_verified": "विश्वास: 5 जुड़ी सरकारी प्रणालियों से सत्यापित",
    "maharashtra_residence": "महाराष्ट्र का निवासी",
    "student_status": "छात्र status",
    "income_threshold": "आय सीमा (≤ ₹2,50,000)",
    "no_previous_scholarship": "कभी कोई छात्रवृत्ति नहीं मिली",
    "required_documents_available": "आवश्यक दस्तावेज़ उपलब्ध हैं",
    "documents_available_info": "संयुक्त सरकारी प्रणालियों के माध्यम से दस्तावेज़ उपलब्ध हैं। आपको फिर से अपलोड करने की आवश्यकता नहीं — MahaSetu सत्यापित रिकॉर्ड का पुनः उपयोग करता है।",
    "connecting_to": "जोड़ रहा है",
    "requesting_authorized_record": "अधिकृत रिकॉर्ड मांग रहा है",
    "record_retrieved": "रिकॉर्ड प्राप्त हुआ",
    "section_title": "खंड शीर्षक",
    "identity": "पहचान",
    "residence": "निवास",
    "income": "आय",
    "education": "शिक्षा",
    "Approved": "मंजूर",
    "Verified": "सत्यापित",
    "Connected": "जुड़ा हुआ",
    "Operational": "चालू",
    "Successful": "सफल",
    "Pending": "लंबित",
    "Under Review": "समीक्षा जारी है",
    "Verification": "सत्यापन",
    "Degraded": "कम हुआ",
    "Rejected": "अस्वीकृत",
    "Failed": "असफल",
    "Offline": "ऑफलाइन",
    "Denied": "अस्वीकृत",
    "submitted": "जमा किया गया",
    "Completed": "पूर्ण",
    "In progress": "प्रगति पर",
    "document_reuse_example": "दस्तावेज़ पुन: उपयोग उदाहरण",
    "income_certificate_already_available": "आय प्रमाणपत्र पहले से उपलब्ध है",
    "source_revenue_dept_verified": "स्रोत: राजस्व विभाग · सत्यापित ✓",
    "use_existing_document": "मौजूदा दस्तावेज़ का उपयोग करें",
    "crumb_c_overview": "नागरिक / अवलोकन",
    "crumb_c_schemes": "नागरिक / योजना",
    "crumb_c_applications": "नागरिक / आवेदन",
    "crumb_c_documents": "नागरिक / दस्तावेज़ भंडार",
    "crumb_c_consent": "नागरिक / सहमति प्रबंधन",
    "crumb_c_notifications": "नागरिक / सूचनाएँ",
    "crumb_c_chatbot": "नागरिक / चैटबॉट",
    "crumb_profile": "नागरिक / प्रोफ़ाइल",
    "crumb_privacy": "डेटा गोपनीयता",
    "crumb_login": "",
    "crumb_landing": ""
    ,
    "Revenue Department": "राजस्व विभाग",
    "Education Department": "शिक्षा विभाग",
    "Social Justice & Special Assistance": "सामाजिक न्याय और विशेष सहायता",
    "Rural Development Department": "ग्रामीण विकास विभाग",
    "Maharashtra Identity Registry": "महाराष्ट्र पहचान रजिस्ट्री",
    "Revenue & Residence Registry": "राजस्व और निवास रजिस्ट्री",
    "Income Verification System": "आय सत्यापन प्रणाली",
    "Education Records System": "शिक्षा रिकॉर्ड प्रणाली",
    "Benefits Registry": "लाभ रजिस्ट्री",
    "Document Vault": "दस्तावेज़ तिजोरी",
    "Maharashtra Student Scholarship": "महाराष्ट्र छात्र छात्रवृत्ति",
    "Residence Certificate": "निवास प्रमाण पत्र",
    "Income Certificate": "आय प्रमाण पत्र",
    "Student ID": "छात्र आईडी",
    "Marksheet": "मार्कशीट",
    "Caste Certificate": "जाति प्रमाण पत्र",
    "Bank Account Proof": "बैंक खाता प्रमाण",
    "Identity": "पहचान",
    "Residence": "निवास",
    "Income": "आय",
    "Education records": "शिक्षा रिकॉर्ड",
    "Previous benefit history": "पिछला लाभ इतिहास",
    "Information Request": "सूचना अनुरोध",
    "wants to access the following": "निम्नलिखित तक पहुंच चाहता है"
    ,
    "Applications by department": "विभाग द्वारा आवेदन",
    "Processing time — before vs. after MahaSetu": "प्रसंस्करण समय — महासेतु के पहले और बाद में",
    "Duplicate verification — before vs. after": "डुप्लिकेट सत्यापन — पहले और बाद में",
    "Application status": "आवेदन की स्थिति",
    "Simulated prototype metrics": "सिम्युलेटेड प्रोटोटाइप मेट्रिक्स",
    "Education": "शिक्षा",
    "Social Justice": "सामाजिक न्याय",
    "Revenue": "राजस्व",
    "Rural Dev.": "ग्रामीण विकास",
    "Before (avg. days)": "पहले (औसत दिन)",
    "After (avg. days)": "बाद में (औसत दिन)",
    "Before": "पहले",
    "After": "बाद में",
    "No audit events yet. Run the eligibility check or data exchange demo to generate a trail.": "अभी तक कोई ऑडिट ईवेंट नहीं है। ट्रेल उत्पन्न करने के लिए पात्रता जांच या डेटा एक्सचेंज डेमो चलाएं।",
    "Why:": "क्यों:",
    "Data:": "डेटा:",
    "Consent:": "सहमति:",
    "Departments": "विभाग",
    "Name": "नाम",
    "Code": "कोड",
    "Document types": "दस्तावेज़ प्रकार",
    "Application statuses": "आवेदन की स्थिति",
    "Scenario controls": "परिदृश्य नियंत्रण",
    "Session state": "सत्र की स्थिति",
    "Drive the hackathon demo without hunting through screens.": "स्क्रीन के माध्यम से शिकार किए बिना हैकाथॉन डेमो चलाएं।",
    "Run Scholarship Verification": "छात्रवृत्ति सत्यापन चलाएं",
    "Simulate API Failure (Income System)": "API विफलता का अनुकरण करें (आय प्रणाली)",
    "Simulate Consent Denial": "सहमति से इनकार का अनुकरण करें",
    "Approve Latest Application": "नवीनतम आवेदन स्वीकृत करें",
    "Reset Demo": "डेमो रीसेट करें",
    "Applications this session": "इस सत्र के आवेदन",
    "Active consents": "सक्रिय सहमति",
    "Audit events logged": "लॉग किए गए ऑडिट ईवेंट",
    "API calls logged": "लॉग किए गए API कॉल"
    ,
    "Social Justice Department": "सामाजिक न्याय विभाग"
    ,
    "Requested residence verification via Revenue Department": "राजस्व विभाग के माध्यम से निवास सत्यापन का अनुरोध किया",
    "Scholarship review — cross-department verification": "छात्रवृत्ति समीक्षा — अंतर-विभागीय सत्यापन",
    "Granted (existing)": "स्वीकृत (मौजूदा)",
    "Citizen (self-check)": "नागरिक (स्वयं जांच)",
    "Ran eligibility check for Maharashtra Student Scholarship": "महाराष्ट्र छात्र छात्रवृत्ति के लिए पात्रता जांच चलाई",
    "Scheme eligibility discovery": "योजना पात्रता खोज",
    "Identity, Residence, Income, Education, Benefits": "पहचान, निवास, आय, शिक्षा, लाभ",
    "N/A — self view": "लागू नहीं — स्वयं दृश्य",
    "Requested identity verification": "पहचान सत्यापन का अनुरोध किया",
    "Demographic match for application": "आवेदन के लिए जनसांख्यिकीय मिलान",
    "Denied (No active mandate)": "अस्वीकृत (कोई सक्रिय जनादेश नहीं)"
    ,
    "Rural Housing Assistance": "ग्रामीण आवास सहायता",
    "Rural residence": "ग्रामीण निवासी",
    "Household income below ₹1,20,000": "पारिवारिक आय ₹1,20,000 से कम",
    "No existing pucca house": "कोई मौजूदा पक्का घर नहीं",
    "Maharashtra resident": "महाराष्ट्र के निवासी",
    "Enrolled student": "नामांकित छात्र",
    "Annual family income below ₹2,50,000": "पारिवारिक वार्षिक आय ₹2,50,000 से कम",
    "No previous scholarship received": "कोई पिछली छात्रवृत्ति प्राप्त नहीं हुई",
    "Required documents available": "आवश्यक दस्तावेज उपलब्ध हैं"
    ,
    "Maharashtra residence": "महाराष्ट्र निवास",
    "Student status": "छात्र की स्थिति",
    "Income threshold (≤ ₹2,50,000)": "आय सीमा (≤ ₹2,50,000)",
    "No previous scholarship": "कोई पिछली छात्रवृत्ति नहीं",
    "Maharashtra": "महाराष्ट्र",
    "Enrolled": "नामांकित",
    "Not currently enrolled": "वर्तमान में नामांकित नहीं",
    "year": "वर्ष",
    "Previous scholarship on record": "पिछली छात्रवृत्ति रिकॉर्ड में है",
    "No prior record found": "कोई पूर्व रिकॉर्ड नहीं मिला",
    "verified documents on file": "सत्यापित दस्तावेज़ फ़ाइल में हैं"
    ,
    "Income Certificate already available": "आय प्रमाण पत्र पहले से ही उपलब्ध है",
    "Source: Revenue Department · Verified ✓": "स्रोत: राजस्व विभाग · सत्यापित ✓",
    "Use Existing Document": "मौजूदा दस्तावेज़ का उपयोग करें",
    "Existing Income Certificate reused — no re-upload needed": "मौजूदा आय प्रमाण पत्र का पुन: उपयोग किया गया — पुनः अपलोड की आवश्यकता नहीं है",
    "Scopes:": "दायरा:",
    "Granted": "मंजूर",
    "Expires": "समाप्त",
    "Revoke": "रद्द करें",
    "No active consents.": "कोई सक्रिय सहमति नहीं।",
    "History": "इतिहास",
    "Department": "विभाग",
    "Purpose": "उद्देश्य",
    "Status": "स्थिति",
    "No consent history yet.": "अभी तक कोई सहमति इतिहास नहीं।",
    "Scholarship application data sharing": "छात्रवृत्ति आवेदन डेटा साझाकरण",
    "Benefits": "लाभ",
    "You're all caught up.": "आपने सब कुछ देख लिया है।",
    "Mark read": "पढ़ा हुआ चिह्नित करें",
    "Just now": "अभी-अभी",
    "Consent revoked": "सहमति रद्द कर दी गई",
    "Revoked": "रद्द कर दी गई",
    "Active": "सक्रिय"
    ,
    "Home": "होम",
    "You are in control of your data": "आपका डेटा आपके नियंत्रण में है",
    "Your data is shared only when:": "आपका डेटा केवल तभी साझा किया जाता है जब:",
    "You authorize access": "आप पहुंच को अधिकृत करते हैं",
    "The requesting department is authorized": "अनुरोध करने वाला विभाग अधिकृत है",
    "The purpose is specified": "उद्देश्य निर्दिष्ट है",
    "The requested information is necessary": "अनुरोध की गई जानकारी आवश्यक है",
    "Citizen ID:": "नागरिक आईडी:",
    "Date of Birth:": "जन्म तिथि:",
    "Connected Systems": "जुड़े हुए सिस्टम",
    "Applications Processed": "संसाधित आवेदन",
    "Reduction in Duplicate Verification": "डुप्लिकेट सत्यापन में कमी",
    "Faster Processing": "तेज प्रसंस्करण",
    "Recent applications": "हाल के आवेदन",
    "Applicant": "आवेदक",
    "Scheme": "योजना",
    "Verifications": "सत्यापन",
    "vs. pre-MahaSetu baseline": "प्री-महासेतु बेसलाइन की तुलना में",
    "avg. turnaround improvement": "औसत टर्नअराउंड सुधार",
    "All operational": "सभी चालू हैं",
    "↑ 8.2% this month": "↑ 8.2% इस महीने",
    "complete": "पूर्ण"
    ,
    "Document": "दस्तावेज़",
    "Issuing department": "जारी करने वाला विभाग",
    "Issued": "जारी किया गया",
    "Documents": "दस्तावेज़",
    "Pune": "पुणे",
    "Savitribai Phule Pune University": "सावित्रीबाई फुले पुणे विश्वविद्यालय",
    "Student enrolled at {0}": "Student enrolled at {0}",
    "MahaSetu Assistant": "महासेतु सहायक",
    "chatbot_welcome": "नमस्ते! मैं आपका महासेतु सहायक हूँ। मैं आपको सामान्य सरकारी सेवाओं के लिए चरण-दर-चरण मार्गदर्शन कर सकता हूँ। कृपया नीचे एक विषय चुनें:",
    "driving_license": "ड्राइविंग लाइसेंस पंजीकरण",
    "passport_app": "पासपोर्ट आवेदन",
    "voter_id": "मतदाता पहचान पत्र पंजीकरण",
    "scholarship_app": "महाराष्ट्र छात्र छात्रवृत्ति आवेदन",
    "back_to_topics": "विषयों पर वापस जाएँ",
    "Show me guide for {0}": "Show me guide for {0}",
    "Step": "चरण",
    "🚗 Driving License Registration": "🚗 ड्राइविंग लाइसेंस पंजीकरण",
    "🛂 Passport Application": "🛂 पासपोर्ट आवेदन",
    "🗳️ Voter ID Registration": "🗳️ मतदाता पहचान पत्र पंजीकरण",
    "🎓 Maharashtra Student Scholarship Application": "🎓 महाराष्ट्र छात्र छात्रवृत्ति आवेदन",
    "Visit the Maharashtra Government Scholarship Portal: https://mahadbt2.maharashtra.gov.in/": "महाराष्ट्र सरकार छात्रवृत्ति पोर्टल पर जाएँ: https://mahadbt2.maharashtra.gov.in/",
    "Register on the portal using your Aadhaar or mobile number.": "अपने आधार या मोबाइल नंबर का उपयोग करके पोर्टल पर पंजीकरण करें।",
    "Fill in the scholarship application form with your personal and academic details.": "अपने व्यक्तिगत और शैक्षणिक विवरण के साथ छात्रवृत्ति आवेदन पत्र भरें।",
    "Upload required documents: residence certificate, income certificate, academic marksheets, and admission proof.": "आवश्यक दस्तावेज़ अपलोड करें: निवास प्रमाण पत्र, आय प्रमाण पत्र, शैक्षणिक मार्कशीट और प्रवेश प्रमाण।",
    "Submit the application and note the application ID for tracking.": "आवेदन जमा करें और ट्रैकिंग के लिए आवेदन आईडी नोट करें।",
    "Wait for verification and approval from the concerned department.": "संबंधित विभाग से सत्यापन और अनुमोदन की प्रतीक्षा करें।",
    "Once approved, the scholarship amount will be disbursed directly to your bank account.": "अनुमोदित होने के बाद, छात्रवृत्ति राशि सीधे आपके बैंक खाते में वितरित की जाएगी।",
    "Student enrolled at {0}": "{0} में नामांकित छात्र",
    "Not currently enrolled in an approved institution": "वर्तमान में किसी अनुमोदित संस्थान में नामांकित नहीं है",
    "Household income of ₹{0} (Verified via PAN/ITR)": "Household income of ₹{0} (Verified via PAN/ITR)",
    "Income exceeds scholarship threshold": "आय छात्रवृत्ति सीमा से अधिक है",
    "Verified Maharashtra domicile": "सत्यापित महाराष्ट्र अधिवास",
    "Not a registered resident": "पंजीकृत निवासी नहीं"
  }
};
// Translation function
function __(key, params) {
  // Get the translation for the current language
  let translation = translations[currentLang] && translations[currentLang][key];

  // Fallback to English if translation not found
  if (!translation) {
    translation = translations.en && translations.en[key];
  }

  // Fallback to the key itself if still not found
  if (!translation) {
    translation = key;
  }

  // Replace parameters if provided
  if (params) {
    Object.keys(params).forEach(paramKey => {
      const regex = new RegExp(`\\{${paramKey}\\}`, 'g');
      translation = translation.replace(regex, params[paramKey]);
    });
  }

  return translation;
}

// Set language and update translations
function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('mahasetu-lang', lang);
  updateTranslations();
  if (typeof S !== 'undefined') {
    switchRole(S.role); // Re-render the sidebar to apply translations
    if (S.currentView && S.currentView !== 'landing') {
      nav(S.currentView); // Re-render the main view
    }
  }
}

// Update all translatable elements
function updateTranslations() {
  document.querySelectorAll('[data-translate]').forEach(element => {
    const key = element.getAttribute('data-translate');
    element.textContent = __(key);
  });

  // Also update elements that use innerHTML for translations (like titles with HTML)
  document.querySelectorAll('[data-translate-html]').forEach(element => {
    const key = element.getAttribute('data-translate-html');
    element.innerHTML = __(key);
  });

  // Update language selector options
  const englishOption = document.querySelector('#language-select option[value="en"], #language-select-top option[value="en"]');
  const marathiOption = document.querySelector('#language-select option[value="mr"], #language-select-top option[value="mr"]');
  const hindiOption = document.querySelector('#language-select option[value="hi"], #language-select-top option[value="hi"]');

  if (englishOption) englishOption.textContent = __('english');
  if (marathiOption) marathiOption.textContent = __('marathi');
  if (hindiOption) hindiOption.textContent = __('hindi');
}

// Initialize translation on page load - always default to English
function initTranslation() {
  // Always default to English, ignoring user's last selection
  currentLang = 'en';
  localStorage.setItem('mahasetu-lang', 'en'); // Also save this preference
  updateTranslations();

  // Set the language selector dropdowns to current language
  const languageSelectors = document.querySelectorAll('#language-select, #language-select-top');
  languageSelectors.forEach(selector => {
    selector.value = currentLang;
  });
}

/* canonical normalization — different source field names -> one shape */
function normalize(raw) {
  return {
    fullName: raw.identity.full_name,
    dateOfBirth: raw.identity.dob,
    gender: raw.identity.gender,
    district: raw.residence.residentialDistrict,
    state: raw.residence.state,
    annualIncome: raw.income.annual_income,
    institution: raw.education.institution,
    studentStatus: raw.education.status === 'Enrolled',
    previousScholarship: raw.benefits.previous_scholarship,
    documentCount: raw.documents.length,
  };
}

function evaluateEligibility(canonical) {
  const checks = [
    { name: 'Maharashtra residence', pass: canonical.state === 'Maharashtra', detail: __(canonical.district) + ', ' + __(canonical.state) },
    { name: 'Student status', pass: canonical.studentStatus, detail: canonical.studentStatus ? __('Student enrolled at {0}', [__(canonical.institution)]) : __('Not currently enrolled in an approved institution') },
    { name: 'Income threshold (≤ ₹2,50,000)', pass: canonical.annualIncome <= 250000, detail: canonical.annualIncome <= 250000 ? __('Household income of ₹{0} (Verified via PAN/ITR)', [canonical.annualIncome.toLocaleString('en-IN')]) : __('Income exceeds scholarship threshold') },
    { name: 'No previous scholarship', pass: !canonical.previousScholarship, detail: canonical.previousScholarship ? __('Previous scholarship on record') : __('No prior record found') },
    { name: 'Required documents available', pass: canonical.documentCount >= 2, detail: canonical.documentCount + ' ' + __('verified documents on file') },
  ];
  return { eligible: checks.every(c => c.pass), checks };
}

/* ---------------------------- STATE ---------------------------- */

const S = {
  eligibilityChecked: false,
  citizenId: null, // Signed out state
  role: null, // No role when signed out
  currentView: 'landing', // Default to landing page when signed out
  consents: [], // {dept, purpose, scopes, granted, expires}
  applications: [], // {id, scheme, status, timeline:[], checks, createdAt}
  auditLog: [],
  notifications: [], // No notifications when signed out
  apiCallLog: [],
  simulateFailure: false,
  systemHealth: Object.fromEntries(SYSTEMS.map(s => [s.id, 'operational'])),
};

let auditSeq = 1;
let appSeq = 1;

function citizen() {
  return S.citizenId ? CITIZENS[S.citizenId] : null;
}

function pushAudit(entry) {
  S.auditLog.unshift({ id: auditSeq++, when: nowStr(), ...entry });
}
function nowStr() {
  const d = new Date();
  return d.toLocaleTimeString('en-IN', { hour12: false });
}
function logApiCall(system, endpoint, status, latency) {
  S.apiCallLog.unshift({
    id: S.apiCallLog.length + 1, ts: nowStr(), system, endpoint,
    method: 'GET', status, latency, reqId: 'REQ-' + Math.floor(90000 + Math.random() * 9000),
  });
}

/* ---------------------------- TOASTS ---------------------------- */

function toast(msg) {
  const box = document.getElementById('toasts');
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<span class="ic">●</span><span>${msg}</span>`;
  box.appendChild(el);
  requestAnimationFrame(() => el.classList.add('on'));
  setTimeout(() => { el.classList.remove('on'); setTimeout(() => el.remove(), 300); }, 3400);
}

/* ---------------------------- MODAL ---------------------------- */

function openModal(html) {
  document.getElementById('modal-box').innerHTML = html;
  document.getElementById('overlay').classList.add('on');
}
function closeModal() {
  document.getElementById('overlay').classList.remove('on');
}
document.getElementById('overlay').addEventListener('click', (e) => {
  if (e.target.id === 'overlay') closeModal();
});

/* ---------------------------- NAV / SHELL ---------------------------- */

function launchDemo() {
  // Set demo citizen as signed in
  S.citizenId = 'MH-CIT-99999';
  S.role = 'citizen';
  toast('Demo citizen loaded — Takshil Sangle, MH-CIT-99999');
  openApp('citizen', 'c-overview');
}

function openApp(role, view) {
  document.getElementById('film-track').style.display = 'none';
  document.getElementById('landing').style.display = 'none';
  document.getElementById('app').classList.add('on');

  if (role) {
    // Signing in as a specific role
    switchRole(role);
    // Navigate to the requested view
    nav(view);
  } else {
    // Just showing the app (internal navigation)
    nav(view);
  }
}

function backToLanding() {
  // Reset to signed out state when going back to landing
  S.citizenId = null;
  S.role = null;
  S.currentView = 'landing';
  S.consents = []; S.applications = []; S.auditLog = []; S.apiCallLog = [];
  S.notifications = []; // No notifications in reset state
  Object.keys(S.systemHealth).forEach(k => S.systemHealth[k] = 'operational');

  // Update sidebar to reflect signed out state
  switchRole(S.role);

  // Update notification badges since we reset notifications
  updateNotifBadges();

  document.getElementById('app').classList.remove('on');
  document.getElementById('film-track').style.display = 'block';
  document.getElementById('landing').style.display = 'block';
  window.scrollTo(0, 0);
}

function switchRole(role) {
  S.role = role;

  // Update sidebar user info
  if (role && S.citizenId) {
    // Signed in state
    const c = citizen();
    // Only show avatar in footer; name and role are shown in profile view
    document.getElementById('sb-who').textContent = '';
    document.getElementById('sb-role').textContent = '';
    document.getElementById('sb-avatar').textContent = c.name.split(' ')[0][0];

    // Populate sidebar navigation with citizen items
    const citizenNav = buildCitizenNav();
    const staticItems = `
      <div class="sb-item" onclick="nav('privacy')" data-translate="data_privacy"><span class="ic">◐</span>${__('data_privacy')}</div>
      <div class="sb-item" onclick="backToLanding()" data-translate="home"><span class="ic">←</span>${__('home')}</div>
    `;
    document.querySelector('.sb-group').innerHTML = citizenNav + staticItems;
  } else {
    // Signed out state
    document.getElementById('sb-who').textContent = '';
    document.getElementById('sb-role').textContent = '';
    document.getElementById('sb-avatar').textContent = '';

    // Reset sidebar to signed out state (only static items)
    const staticItems = `
      <div class="sb-item" onclick="nav('privacy')" data-translate="data_privacy"><span class="ic">◐</span>${__('data_privacy')}</div>
      <div class="sb-item" onclick="backToLanding()" data-translate="home"><span class="ic">←</span>${__('home')}</div>
    `;
    document.querySelector('.sb-group').innerHTML = staticItems;
  }

  // Stay on current view (don't automatically navigate here - let caller handle it)
}

const TITLES = {
  'c-overview': ['overview', 'crumb_c_overview'],
  'c-schemes': ['government_schemes', 'crumb_c_schemes'],
  'c-applications': ['applications', 'crumb_c_applications'],
  'c-documents': ['document_vault', 'crumb_c_documents'],
  'c-consent': ['consent_management', 'crumb_c_consent'],
  'c-notifications': ['notifications', 'crumb_c_notifications'],
  'c-chatbot': ['chatbot', 'crumb_c_chatbot'],
  'profile': ['profile', 'crumb_profile'],
  'privacy': ['data_privacy', 'crumb_privacy'],
  'login': ['sign_in', 'crumb_login'],
  'landing': ['brand', 'crumb_landing'],
};

function nav(view) {
  // If trying to access protected citizen views and not signed out, redirect to login
  const isProtectedView = view.startsWith('c-');
  if (isProtectedView && !S.citizenId) {
    view = 'login';
    S.currentView = view;
  } else {
    S.currentView = view;
  }

  document.querySelectorAll('.sb-item').forEach(el => el.classList.toggle('active', el.dataset.view === view));
  const t = TITLES[view] || ['MahaSetu', ''];
  document.getElementById('topbar-title').dataset.translate = t[0];
  document.getElementById('topbar-crumb').dataset.translate = 'crumb_' + view;
  updateTranslations(); // Update translations immediately after changing attributes
  document.getElementById('view-root').innerHTML = RENDER[view] ? RENDER[view]() : `<div class="empty">Not built yet.</div>`;
  updateNotifBadges();
  document.getElementById('view-root').scrollTop = 0;
  document.querySelector('.main').scrollTop = 0;
}

// Initialize the app to show landing page when first loaded
document.addEventListener('DOMContentLoaded', () => {
  // Ensure we start in landing page/signed out state
  if (!S.citizenId) {
    backToLanding();
  }
});

function updateNotifBadges() {
  const unread = S.notifications.filter(n => !n.read).length;
  const notifCountEl = document.getElementById('notif-count');
  const topbarBubbleEl = document.getElementById('topbar-bubble');

  if (notifCountEl) {
    notifCountEl.textContent = unread;
    notifCountEl.style.display = unread > 0 ? '' : 'none';
  }

  if (topbarBubbleEl) {
    topbarBubbleEl.textContent = unread;
    topbarBubbleEl.style.display = unread > 0 ? '' : 'none';
  }
}

/* ---------------------------- helpers ---------------------------- */

function statusBadge(statusKey) {
  const map = {
    Approved: 'ok', Verified: 'ok', Connected: 'ok', Operational: 'ok', Successful: 'ok',
    Pending: 'warn', 'Under Review': 'warn', Verification: 'warn', Degraded: 'warn',
    Rejected: 'err', Failed: 'err', Offline: 'err', Denied: 'err',
  };
  const statusText = __(statusKey);
  const statusClass = map[statusKey] || 'neutral';
  return `<span class="badge ${statusClass}"><span class="dot ${statusClass}"></span>${statusText}</span>`;
}

function buildCitizenNav() {
  const navItems = [
    { id: 'c-overview', labelKey: 'overview', icon: '◈' },
    { id: 'c-schemes', labelKey: 'government_schemes', icon: '📋' },
    { id: 'c-applications', labelKey: 'applications', icon: '📁' },
    { id: 'c-documents', labelKey: 'document_vault', icon: '📎' },
    { id: 'c-consent', labelKey: 'consent_management', icon: '🔐' },
    { id: 'c-notifications', labelKey: 'notifications', icon: '🔔' },
    { id: 'profile', labelKey: 'profile', icon: '👤' }
  ];

  return navItems.map(item => `
    <div class="sb-item" data-view="${item.id}" onclick="nav('${item.id}')" data-translate="${item.labelKey}">
      <span class="ic">${item.icon}</span>
    </div>
  `).join('');
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function formatDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr; // fallback
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

/* =========================================================================
   VIEW RENDERERS
   ========================================================================= */

const RENDER = {};

/* ---------- CITIZEN: OVERVIEW ---------- */
RENDER['c-overview'] = () => {
  const c = citizen();
  const activeApp = S.applications[0];
  return `
  <div class="section-title" style="margin-top:0">${__('welcome_back')}</div>
  <h1 style="font-size:26px;margin-bottom:4px">${__('welcome')}, ${c.name.split(' ')[0]}</h1>
  <p style="color:var(--text-dim);font-size:13.5px;margin-top:4px">${__('citizen_id')}: <span class="mono">${c.citizenId}</span> · ${c.residence.residentialDistrict} ${__('district')}</p>

  <div class="section-title">${__('verified_information')}</div>
  <div class="grid g4">
    ${['identity', 'residence', 'income', 'education'].map(key => `
      <div class="card stat-card">
        <div class="l">${__(key)}</div>
        <div style="margin-top:10px" class="badge ok"><span class="dot ok"></span>${__('Verified')}</div>
      </div>`).join('')}
  </div>

  <div class="section-title">${__('connected_government_services')}<span class="a" onclick="nav('c-consent')">${__('manage_consent')}</span></div>
  <div class="card" style="padding:6px 20px">
    ${DEPARTMENTS.map(d => `
      <div class="svc-row"><span class="svc-name">${__(d.name)}</span>${statusBadge('Connected')}</div>
    `).join('')}
  </div>

  <div class="section-title">${__('active_applications')}</div>
  ${activeApp ? `
    <div class="card" style="padding:20px 22px;cursor:pointer" onclick="nav('c-applications')">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-weight:700;font-size:15px">${activeApp.scheme}</div>
          <div style="color:var(--text-faint);font-size:12.5px;margin-top:3px">${__('submitted')} ${formatDate(activeApp.createdAt)}</div>
        </div>
        ${statusBadge(activeApp.status)}
      </div>
    </div>
  ` : `<div class="card empty"><div class="ic">▥</div>${__('no_active_applications')} <span style="color:var(--blue);cursor:pointer" onclick="nav('c-schemes')">${__('browse_schemes')}</span></div>`}
  `;
};

/* ---------- CITIZEN: SCHEMES ---------- */
RENDER['c-schemes'] = () => {
  // Check if user has already applied for this scheme
  const alreadyApplied = S.applications.some(app => app.scheme === SCHEME.name);

  return `
  <p style="color:var(--text-dim);font-size:14px;margin-bottom:20px;max-width:600px">${__('eligibility_is_checked')}</p>
  <div class="grid g2">
    <div class="card scheme-card">
      <div class="top">
        <div><h4>${__(SCHEME.name)}</h4><div class="dept">${__(SCHEME.dept)}</div></div>
        <span class="pill">${alreadyApplied ? __('already_applied') : __('active')}</span>
      </div>
      <ul class="elig">${SCHEME.eligibility.map(e => `<li>${__(e)}</li>`).join('')}</ul>
      <div class="foot">
        <span style="font-size:12px;color:var(--text-faint)">${__('verified_via')} ${__('government_systems')}</span>
        ${alreadyApplied ?
      `<span style="color:var(--ok);font-weight:600;">${__('already_applied')}</span>` :
      `<button class="btn btn-primary btn-sm" onclick="runEligibility()">${__('eligibility_check')}</button>`
    }
      </div>
    </div>
    <div class="card scheme-card" style="opacity:.55">
      <div class="top">
        <div><h4>${__('Rural Housing Assistance')}</h4><div class="dept">${__("Rural Development Department")}</div></div>
        <span class="pill">${__('coming_soon')}</span>
      </div>
      <ul class="elig"><li>${__('Rural residence')}</li><li>${__('Household income below ₹1,20,000')}</li><li>${__('No existing pucca house')}</li></ul>
      <div class="foot"><span style="font-size:12px;color:var(--text-faint)">${__('not_yet_onboarded')}</span><button class="btn btn-outline btn-sm" disabled>${__('eligibility_check')}</button></div>
    </div>
  </div>
  <div id="eligibility-panel">${S.eligibilityChecked ? renderEligibilityResult() : ''}</div>
  `;
};


function renderEligibilityResult() {
  const canonical = normalize(citizen());
  const result = evaluateEligibility(canonical);
  return `
    <div class="section-title">${__('result')}</div>
    <div class="card" style="padding:26px">
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:18px">
        <div style="width:44px;height:44px;border-radius:50%;background:${result.eligible ? 'var(--ok-bg)' : 'var(--err-bg)'};color:${result.eligible ? 'var(--ok)' : 'var(--err)'};display:flex;align-items:center;justify-content:center;font-size:20px">${result.eligible ? '✓' : '✕'}</div>
        <div>
          <div class="serif" style="font-size:20px;color:var(--navy)">${result.eligible ? __('you_are_eligible') : __('not_currently_eligible')}</div>
          <div style="font-size:12.5px;color:var(--text-faint)">${__('confidence_verified')}</div>
        </div>
      </div>
      <div class="check-list">
        ${result.checks.map(c => `
          <div class="check-row">
            <div class="ic" style="background:${c.pass ? 'var(--ok-bg)' : 'var(--err-bg)'};color:${c.pass ? 'var(--ok)' : 'var(--err)'}">${c.pass ? '✓' : '✕'}</div>
            <div class="txt"><div class="t1">${__(c.name)}</div><div class="t2">${c.detail}</div></div>
          </div>`).join('')}
      </div>
      <div style="margin-top:20px;text-align:right">
        ${result.eligible ? `<button class="btn btn-primary" onclick="nav('c-chatbot'); showChatbotGuide('scholarship')">${__('learn_how_to_apply')}</button>` : `<button class="btn btn-outline" disabled>${__('learn_how_to_apply')}</button>`}
      </div>
    </div>`;
}

async function runEligibility() {
  const panel = document.getElementById('eligibility-panel');
  panel.innerHTML = `
    <div class="section-title">${__('checking_eligibility')}</div>
    <div class="card" style="padding:24px 26px">
      <div class="check-list" id="elig-checklist"></div>
    </div>`;
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  const list = document.getElementById('elig-checklist');
  const steps = [
    ['identity', 'Identity Registry'], ['residence', 'Revenue & Residence Registry'],
    ['income', 'Income Verification System'], ['education', 'Education Records System'],
    ['benefits', 'Benefits Registry'], ['documents', 'Document Vault'],
  ];
  for (const [key, label] of steps) {
    const row = document.createElement('div');
    row.className = 'check-row';
    row.innerHTML = `<div class="ic" style="background:var(--blue-dim);color:var(--blue)">◌</div><div class="txt"><div class="t1">${__('connecting_to')} ${__(label)}…</div><div class="t2">${__('requesting_authorized_record')}</div></div>`;
    list.appendChild(row);
    const sys = SYSTEMS.find(s => s.id === key);
    await sleep(380 + Math.random() * 260);
    logApiCall(sys.name, `/mock/${key}/${citizen().citizenId}`, 200, sys.latency + Math.floor(Math.random() * 20));
    row.querySelector('.ic').style.background = 'var(--ok-bg)'; row.querySelector('.ic').style.color = 'var(--ok)'; row.querySelector('.ic').textContent = '✓';
    row.querySelector('.t1').textContent = `${__(label)} ${__('Verified')}`;
    row.querySelector('.t2').textContent = `${__('record_retrieved')} · ${sys.latency}ms`;
  }
  await sleep(300);
  pushAudit({ who: 'Citizen (self-check)', what: 'Ran eligibility check for ' + SCHEME.name, why: 'Scheme eligibility discovery', data: 'Identity, Residence, Income, Education, Benefits', consent: 'N/A — self view', result: 'Successful' });
  S.eligibilityChecked = true;
  panel.innerHTML += renderEligibilityResult();
  toast('Eligibility check completed');
}

/* ---------- CONSENT MODAL + FLOW ---------- */
function openConsentModal() {
  openModal(`
    <div class="modal-head"><h3>${__("Information Request")}</h3><div class="x-btn" onclick="closeModal()">✕</div></div>
    <div class="modal-body">
      <p style="font-size:13.5px;color:var(--text-dim);margin-bottom:16px"><strong style="color:var(--text)">${__("Education Department")}</strong> ${__("wants to access the following")}, verified from connected systems, to process your scholarship application:</p>
      <div class="consent-item">✓ ${__("Identity")}</div>
      <div class="consent-item">✓ ${__("Residence")}</div>
      <div class="consent-item">✓ ${__("Income")}</div>
      <div class="consent-item">✓ ${__("Education records")}</div>
      <div class="consent-item">✓ ${__("Previous benefit history")}</div>
      <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--line);font-size:13px;color:var(--text-dim);line-height:1.8">
        <strong style="color:var(--text)">Purpose:</strong> Scholarship eligibility verification<br>
        <strong style="color:var(--text)">Requested by:</strong> Education Department<br>
        <strong style="color:var(--text)">Access duration:</strong> 30 days
      </div>
    </div>
    <div class="modal-foot">
      <button class="btn btn-ghost" onclick="denyConsent()">Deny</button>
      <button class="btn btn-primary" onclick="grantConsent()">Allow Access</button>
    </div>
  `);
}

function denyConsent() {
  closeModal();
  pushAudit({ who: 'Education Department', what: 'Requested scholarship verification access', why: 'Scholarship eligibility verification', data: 'Identity, Residence, Income, Education, Benefits', consent: 'Denied', result: 'Blocked' });
  toast('Access denied — no data was shared');
}

function grantConsent() {
  closeModal();
  const today = new Date().toISOString().split('T')[0];
  const expiresDate = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
  const consent = { dept: 'Education Department', purpose: 'Scholarship eligibility verification', scopes: ['Identity', 'Residence', 'Income', 'Education', 'Benefits'], granted: formatDate(today), expires: formatDate(expiresDate), status: 'Active' };
  S.consents.unshift(consent);
  pushAudit({ who: 'Education Department', what: 'Requested scholarship verification access', why: consent.purpose, data: consent.scopes.join(', '), consent: 'Granted', result: 'Successful' });
  toast('Consent granted to Education Department');
  runWorkflow();
}

/* ---------- APPLICATION WORKFLOW (live event stream) ---------- */
async function runWorkflow() {
  const appId = 'APP-' + String(1000 + appSeq++);
  const application = {
    id: appId, scheme: SCHEME.name, status: 'Verification',
    createdAt: 'Just now',
    timeline: [
      { label: 'Application Submitted', state: 'done' },
      { label: 'Identity Verification', state: 'active' },
      { label: 'Residence Verification', state: 'pending' },
      { label: 'Income Verification', state: 'pending' },
      { label: 'Education Verification', state: 'pending' },
      { label: 'Previous Benefit Check', state: 'pending' },
      { label: 'Document Verification', state: 'pending' },
      { label: 'Eligibility Evaluation', state: 'pending' },
      { label: 'Department Review', state: 'pending' },
    ],
  };
  S.applications.unshift(application);

  openModal(`
    <div class="modal-head"><h3>Processing your application</h3><div class="x-btn" onclick="closeModal()">✕</div></div>
    <div class="modal-body">
      <div class="stream" id="live-stream"></div>
      <div style="margin-top:16px"><div class="progress-bar"><i id="wf-progress" style="width:0%"></i></div></div>
    </div>
  `);
  const stream = document.getElementById('live-stream');
  const progressBar = document.getElementById('wf-progress');
  const modalBody = document.querySelector('.modal-body');

  const addEvent = (txt) => {
    if (!stream) return;
    const row = document.createElement('div');
    row.className = 'ev';
    row.innerHTML = `<span class="ts">${nowStr()}</span>${txt}`;
    stream.appendChild(row);
  };

  const events = [
    ['Identity request initiated', 8],
    ['Identity verified', 22],
    ['Consent validated', 32],
    ['Residence request initiated', 40],
    ['Residence verified', 48],
    ['Income API called', 56],
    ['Income received', 64],
    ['Data normalized to canonical model', 70],
    ['Education record verified', 80],
    ['Previous benefit check — none found', 87],
    ['Document Vault checked — 4 documents available', 93],
    ['Eligibility calculated', 97],
    ['Application routed to Education Department', 100],
  ];
  const stageMap = [1, 1, null, 2, 2, 3, 3, null, 4, 5, 6, 7, 8];

  for (let i = 0; i < events.length; i++) {
    await sleep(260 + Math.random() * 180);
    addEvent(events[i][0]);
    if (progressBar) {
      progressBar.style.width = events[i][1] + '%';
    }
    const stageIdx = stageMap[i];
    if (stageIdx != null) {
      application.timeline[stageIdx].state = 'done';
      if (application.timeline[stageIdx + 1]) application.timeline[stageIdx + 1].state = 'active';
    }
  }
  application.status = 'Approved';
  pushAudit({ who: 'MahaSetu Workflow Engine', what: 'Completed automated verification for ' + appId, why: 'Scholarship eligibility verification', data: 'Identity, Residence, Income, Education, Benefits, Documents', consent: 'Granted (Education Dept.)', result: 'Successful' });
  S.notifications.unshift({ id: Date.now(), text: __("Your {0} application ({1}) was approved.", [__(SCHEME.name), appId]), read: false, when: 'Just now' });
  updateNotifBadges();

  await sleep(400);
  if (modalBody) {
    modalBody.innerHTML += `
      <div style="margin-top:18px;padding:16px;border-radius:10px;background:var(--ok-bg);color:var(--ok);font-weight:700;text-align:center">✓ Application ${appId} approved</div>
      <div style="margin-top:14px;text-align:right"><button class="btn btn-primary" onclick="closeModal();nav('c-applications')">View Application</button></div>
    `;
  }
  toast('Application approved — ' + appId);
}

/* ---------- CITIZEN: APPLICATIONS ---------- */
RENDER['c-applications'] = () => {
  if (!S.applications.length) return `<div class="card empty"><div class="ic">▥</div>${__('no_applications_yet')}<br><span style="color:var(--blue);cursor:pointer" onclick="nav('c-schemes')">${__('browse_schemes')} →</span></div>`;
  return S.applications.map(app => `
    <div class="card" style="padding:24px 26px;margin-bottom:18px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px">
        <div><div style="font-weight:700;font-size:16px">${app.scheme}</div><div style="font-size:12px;color:var(--text-faint);margin-top:3px">${app.id} · ${__('submitted')} ${formatDate(app.createdAt)}</div></div>
        ${statusBadge(app.status)}
      </div>
      <div class="tl">
        ${app.timeline.map(t => `
          <div class="tl-item">
            <div class="tl-dot ${t.state}">${t.state === 'done' ? '✓' : t.state === 'active' ? '⟳' : ''}</div>
            <div class="tl-body"><div class="t1">${t.label}</div><div class="t2">${t.state === 'done' ? __('Completed') : t.state === 'active' ? __('In progress') : __('Pending')}</div></div>
          </div>`).join('')}
      </div>
    </div>
  `).join('');
};

/* ---------- CITIZEN: DOCUMENTS ---------- */
RENDER['c-documents'] = () => {
  const docs = citizen().documents;
  return `
  <p style="color:var(--text-dim);font-size:14px;margin-bottom:18px;max-width:600px">${__('documents_available_info')}</p>
  <table class="data-table card" style="border-radius:14px;overflow:hidden">
    <thead><tr><th>${__("Document")}</th><th>${__("Issuing department")}</th><th>${__("Issued")}</th><th>${__("Expires")}</th><th>${__("Status")}</th></tr></thead>
    <tbody>
      ${docs.map(d => `<tr><td style="font-weight:600">${__(d.type)}</td><td>${__(d.issuer)}</td><td>${formatDate(d.issued)}</td><td>${d.expires ? formatDate(d.expires) : '—'}</td><td>${statusBadge(d.verified ? 'Verified' : 'Pending')}</td></tr>`).join('')}
    </tbody>
  </table>
  <div class="section-title">${__('document_reuse_example')}</div>
  <div class="card" style="padding:20px 22px;display:flex;justify-content:space-between;align-items:center">
    <div>
      <div style="font-weight:600;font-size:14px">${__("Income Certificate already available")}</div>
      <div style="font-size:12.5px;color:var(--text-faint);margin-top:4px">${__("Source: Revenue Department · Verified ✓")}</div>
    </div>
    <button class="btn btn-outline btn-sm" onclick="toast(__('Existing Income Certificate reused — no re-upload needed'))">${__("Use Existing Document")}</button>
  </div>
  `;
};

/* ---------- CITIZEN: CONSENT ---------- */
RENDER['c-consent'] = () => {
  return `
  <div class="section-title" style="margin-top:0">${__(__("Active consents"))}</div>
  ${S.consents.filter(c => c.status === 'Active').length ? S.consents.filter(c => c.status === 'Active').map((c, idx) => `
    <div class="card" style="padding:20px 22px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center">
      <div>
        <div style="font-weight:700;font-size:14.5px">${__(c.dept)}</div>
        <div style="font-size:12.5px;color:var(--text-faint);margin-top:4px">${__(c.purpose)} · ${__("Scopes:")} ${c.scopes.map(s => __(s)).join(', ')}</div>
        <div style="font-size:12px;color:var(--text-faint);margin-top:4px">${__("Granted")} ${formatDate(c.granted)} · ${__("Expires")} ${formatDate(c.expires)}</div>
      </div>
      <button class="btn btn-danger btn-sm" onclick="revokeConsent(${S.consents.indexOf(c)})">${__("Revoke")}</button>
    </div>
  `).join('') : `<div class="card empty"><div class="ic">✓</div>${__("No active consents.")}</div>`}

  <div class="section-title">${__("History")}</div>
  ${S.consents.length ? `<table class="data-table card" style="border-radius:14px;overflow:hidden">
    <thead><tr><th>${__("Department")}</th><th>${__("Purpose")}</th><th>${__("Status")}</th><th>${__("Granted")}</th></tr></thead>
    <tbody>${S.consents.map(c => `<tr><td style="font-weight:600">${__(c.dept)}</td><td>${__(c.purpose)}</td><td>${statusBadge(c.status)}</td><td>${formatDate(c.granted)}</td></tr>`).join('')}</tbody>
  </table>` : `<div class="card empty">${__("No consent history yet.")}</div>`}
  `;
};
function revokeConsent(idx) {
  S.consents[idx].status = 'Revoked';
  pushAudit({ who: 'Citizen', what: `Revoked consent for ${S.consents[idx].dept}`, why: 'Citizen-initiated revocation', data: S.consents[idx].scopes.join(', '), consent: 'Revoked', result: 'Successful' });
  toast(__('Consent revoked'));
  nav('c-consent');
}

/* ---------- CITIZEN: NOTIFICATIONS ---------- */
RENDER['c-notifications'] = () => {
  if (!S.notifications.length) return `<div class="card empty"><div class="ic">◈</div>${__("You're all caught up.")}</div>`;
  return S.notifications.map((n) => `
    <div class="card" style="padding:16px 20px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;${n.read ? 'opacity:.55' : ''}">
      <div style="display:flex;gap:12px;align-items:center">
        ${!n.read ? '<span class="dot ok" style="flex-shrink:0"></span>' : '<span style="width:7px"></span>'}
        <div><div style="font-size:13.5px">${__(n.text)}</div><div style="font-size:11.5px;color:var(--text-faint);margin-top:3px">${__(n.when)}</div></div>
      </div>
      ${!n.read ? `<button class="btn btn-ghost btn-sm" onclick="markRead('${n.id}')">${__("Mark read")}</button>` : ''}
    </div>
  `).join('');
};
function markRead(id) {
  const notificationId = Number(id);
  const notification = S.notifications.find(n => n.id === notificationId);
  if (notification) {
    notification.read = true;
  }
  updateNotifBadges();
  nav('c-notifications');
}

/* ---------- CITIZEN: LOGIN ---------- */
RENDER['login'] = () => {
  return `
    <div class="section-title" style="margin-top:0">Sign in to MahaSetu</div>
    <div class="card" style="padding:40px;max-width:400px;margin:0 auto">
      <div style="text-align:center;margin-bottom:30px">
        <h2 style="font-size:24px;margin-bottom:10px;color:var(--navy)">Welcome Back</h2>
        <p style="color:var(--text-dim);font-size:14px">Sign in to access your government services and benefits</p>
      </div>
      <form id="login-form" onsubmit="handleLogin(event)">
        <div style="margin-bottom:20px">
          <label style="display:block;margin-bottom:8px;font-size:14px;font-weight:600;color:var(--text)">Email or Citizen ID</label>
          <input type="text" id="login-email" required style="width:100%;padding:12px;border:1px solid var(--line-2);border-radius:var(--radius);font-size:14px">
        </div>
        <div style="margin-bottom:20px">
          <label style="display:block;margin-bottom:8px;font-size:14px;font-weight:600;color:var(--text)">Password</label>
          <input type="password" id="login-password" required style="width:100%;padding:12px;border:1px solid var(--line-2);border-radius:var(--radius);font-size:14px">
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:25px;font-size:13px">
          <div>
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
              <input type="checkbox" id="remember-me" style="width:16px;height:16px">
              <span>Remember me</span>
            </label>
          </div>
          <a href="#" style="color:var(--blue);text-decoration:none" onclick="forgotPassword(event)">Forgot password?</a>
        </div>
        <button type="submit" class="btn btn-primary w-100" style="padding:14px;font-size:15px">Sign in</button>
      </form>
      <div style="margin-top:20px;text-align:center;font-size:13px;color:var(--text-faint)">
        Don't have an account? <a href="#" style="color:var(--blue);text-decoration:none" onclick="showRegister(event)">Create account</a>
      </div>
    </div>
  `;
};

function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  if (!email || !password) {
    toast('Please fill in all fields');
    return;
  }

  // Simulate API call delay
  toast('Signing in...');

  setTimeout(() => {
    // Expected credentials
    const expectedEmail = 'takshils2007@gmail.com';
    const expectedPassword = 'taksh@2107';

    if (email === expectedEmail && password === expectedPassword) {
      // Set citizen to Takshil Sangle
      S.citizenId = 'MH-CIT-99999';
      S.role = 'citizen';

      // Update sidebar to reflect signed in state
      switchRole(S.role);

      // Log the login
      pushAudit({
        who: 'Citizen',
        what: 'User signed in',
        why: 'Authentication',
        data: 'Email: ' + email,
        consent: 'N/A',
        result: 'Successful'
      });

      // Navigate to overview
      nav('c-overview');

      toast('Signed in successfully');
    } else {
      toast('Invalid email or password');
    }
  }, 1500);
}

function forgotPassword(event) {
  event.preventDefault();
  toast('Password reset link sent to your email');
}

function showRegister(event) {
  event.preventDefault();
  toast('Registration feature coming soon');
}

/* ---------- PRIVACY ---------- */
RENDER['privacy'] = () => `
  <div class="card" style="padding:32px;max-width:640px">
    <h3 style="font-size:20px;margin-bottom:16px">${__("You are in control of your data")}</h3>
    <p style="color:var(--text-dim);font-size:14px;line-height:1.8">${__("Your data is shared only when:")}</p>
    <div style="margin-top:14px" class="check-list">
      ${['You authorize access', 'The requesting department is authorized', 'The purpose is specified', 'The requested information is necessary'].map(t => `
      <div class="check-row"><div class="ic" style="background:var(--ok-bg);color:var(--ok)">✓</div><div class="txt"><div class="t1">${__(t)}</div></div></div>`).join('')}
    </div>
  </div>`;

/* ---------- CITIZEN: PROFILE ---------- */
RENDER['profile'] = () => {
  const c = citizen();
  return `
    <div class="section-title" style="margin-top:0">${__("profile")}</div>
    <div class="card" style="padding:40px;max-width:500px;margin:0 auto">
      <div style="text-align:center;margin-bottom:30px">
        <div style="width:80px;height:80px;border-radius:50%;background:var(--saffron);color:#fff;display:flex;align-items:center;justify-content:center;font-size:40px;font-weight:bold;margin:0 auto">
          ${c.name.split(' ')[0][0]}
        </div>
        <h2 style="font-size:24px;margin-bottom:10px;color:var(--navy)">${c.name}</h2>
        <p style="color:var(--text-dim);font-size:14px">${c.email}</p>
        <p style="color:var(--text-dim);font-size:14px">${__("Citizen ID:")} <span class="mono">${c.citizenId}</span></p>
        <p style="color:var(--text-dim);font-size:14px">${__("Date of Birth:")} <span class="mono">${formatDate(c.identity.dob)}</span></p>
      </div>
      <div class="section-title">${__("Connected Systems")}</div>
      <div class="grid g3">
        ${['Identity', 'Residence', 'Income', 'Education', 'Benefits', 'Documents'].map(sys => `
          <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <div>${__(sys)}</div>
              <div style="font-size:12px;color:var(--ok)">${__("Connected")}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
};

/* ---------- OFFICER: DASHBOARD ---------- */
RENDER['o-dashboard'] = () => `
  <div class="grid g4">
    <div class="card stat-card"><div class="l">${__("Applications Processed")}</div><div class="n">12,483</div><div class="d up">${__("↑ 8.2% this month")}</div></div>
    <div class="card stat-card"><div class="l">${__("Reduction in Duplicate Verification")}</div><div class="n">34%</div><div class="d up">${__("vs. pre-MahaSetu baseline")}</div></div>
    <div class="card stat-card"><div class="l">${__("Faster Processing")}</div><div class="n">41%</div><div class="d up">${__("avg. turnaround improvement")}</div></div>
    <div class="card stat-card"><div class="l">${__("Connected Systems")}</div><div class="n">6</div><div class="d up">${__("All operational")}</div></div>
  </div>
  <div style="margin-top:6px"><span class="sim-tag">${__(__("Simulated prototype metrics"))}</span></div>

  <div class="section-title">${__("Recent applications")}</div>
  <table class="data-table card" style="border-radius:14px;overflow:hidden">
    <thead><tr><th>${__("Applicant")}</th><th>${__("Scheme")}</th><th>${__("Verifications")}</th><th>${__("Status")}</th></tr></thead>
    <tbody>
      ${S.applications.length ? S.applications.map(a => `<tr onclick="nav('o-applications')"><td style="font-weight:600">${citizen().name}</td><td>${a.scheme}</td><td>5 / 5 ${__("complete")}</td><td>${statusBadge(a.status)}</td></tr>`).join('') : ''}
      <tr onclick="nav('o-applications')"><td style="font-weight:600">Sneha Kulkarni</td><td>Maharashtra Student Scholarship</td><td>5 / 5 ${__("complete")}</td><td>${statusBadge('Rejected')}</td></tr>
      <tr onclick="nav('o-applications')"><td style="font-weight:600">Aarav Shinde</td><td>Maharashtra Student Scholarship</td><td>3 / 5 ${__("complete")}</td><td>${statusBadge('Pending')}</td></tr>
    </tbody>
  </table>
`;

/* ---------- OFFICER: APPLICATIONS ---------- */
RENDER['o-applications'] = () => {
  const rows = [
    ...S.applications.map(a => ({ name: citizen().name, id: a.id, status: a.status, canonical: normalize(citizen()) })),
    { name: 'Sneha Kulkarni', id: 'APP-1000', status: 'Rejected', canonical: normalize(CITIZENS['MH-CIT-20917']) },
    { name: 'Aarav Shinde', id: 'APP-0998', status: 'Pending', canonical: null },
  ];
  return `
  <table class="data-table card" style="border-radius:14px;overflow:hidden">
    <thead><tr><th>Applicant</th><th>Application</th><th>Status</th><th></th></tr></thead>
    <tbody>
      ${rows.map((r, i) => `<tr onclick="openApplicationDetail(${i})"><td style="font-weight:600">${r.name}</td><td>${r.id}</td><td>${statusBadge(r.status)}</td><td style="color:var(--blue);font-weight:600;text-align:right">Review →</td></tr>`).join('')}
    </tbody>
  </table>`;
};
function openApplicationDetail(i) {
  const rows = [
    ...S.applications.map(a => ({ name: citizen().name, id: a.id, status: a.status, canonical: normalize(citizen()), scheme: a.scheme })),
    { name: 'Sneha Kulkarni', id: 'APP-1000', status: 'Rejected', canonical: normalize(CITIZENS['MH-CIT-20917']), scheme: SCHEME.name },
    { name: 'Aarav Shinde', id: 'APP-0998', status: 'Pending', canonical: null, scheme: SCHEME.name },
  ];
  const r = rows[i];
  if (!r.canonical) { openModal(`<div class="modal-head"><h3>${r.id}</h3><div class="x-btn" onclick="closeModal()">✕</div></div><div class="modal-body">Verification still in progress for this applicant.</div>`); return; }
  const result = evaluateEligibility(r.canonical);
  openModal(`
    <div class="modal-head"><h3>${r.id} — ${r.name}</h3><div class="x-btn" onclick="closeModal()">✕</div></div>
    <div class="modal-body">
      <p style="font-size:13px;color:var(--text-faint);margin-bottom:14px">${__(r.scheme)}</p>
      <div class="check-list">
        ${result.checks.map(c => `<div class="check-row"><div class="ic" style="background:${c.pass ? 'var(--ok-bg)' : 'var(--err-bg)'};color:${c.pass ? 'var(--ok)' : 'var(--err)'}">${c.pass ? '✓' : '✕'}</div><div class="txt"><div class="t1">${c.name}</div><div class="t2">${c.detail}</div></div></div>`).join('')}
      </div>
    </div>
    <div class="modal-foot">
      <button class="btn btn-danger" onclick="closeModal();toast('Application marked rejected')">Reject</button>
      <button class="btn btn-primary" onclick="closeModal();toast('Application approved')">Approve</button>
    </div>
  `);
}

/* ---------- OFFICER: DATA EXCHANGE MONITOR ---------- */
RENDER['o-exchange'] = () => `
  <p style="color:var(--text-dim);font-size:14px;max-width:600px;margin-bottom:10px">A live simulated cross-department data request: Education Department needs residence verification for a scholarship review, sourced from Revenue Department without asking the citizen to resubmit a certificate.</p>
  <button class="btn btn-primary" onclick="runExchangeDemo()" style="margin-bottom:20px">▶ Run Data Exchange</button>
  <div class="card" style="padding:30px" id="exchange-box">
    <div class="exchange-flow" id="exchange-flow">
      <div class="ex-node" data-n="0">Education Department</div>
      <div class="ex-line" data-l="0"></div>
      <div class="ex-node" data-n="1">MahaSetu Integration Layer</div>
      <div class="ex-line" data-l="1"></div>
      <div class="ex-node" data-n="2">Consent Check</div>
      <div class="ex-line" data-l="2"></div>
      <div class="ex-node" data-n="3">Revenue Department</div>
      <div class="ex-line" data-l="3"></div>
      <div class="ex-node" data-n="4">Residence Data Retrieved</div>
      <div class="ex-line" data-l="4"></div>
      <div class="ex-node" data-n="5">Normalization</div>
      <div class="ex-line" data-l="5"></div>
      <div class="ex-node" data-n="6">Education Department (result delivered)</div>
    </div>
  </div>
`;
async function runExchangeDemo() {
  const nodes = document.querySelectorAll('#exchange-flow .ex-node');
  const lines = document.querySelectorAll('#exchange-flow .ex-line');
  nodes.forEach(n => n.className = 'ex-node');
  lines.forEach(l => l.className = 'ex-line');
  for (let i = 0; i < nodes.length; i++) {
    nodes[i].classList.add('active');
    await sleep(420);
    nodes[i].classList.remove('active'); nodes[i].classList.add('done');
    if (lines[i]) { lines[i].classList.add('active'); await sleep(160); }
  }
  pushAudit({ who: 'Education Department', what: 'Requested residence verification via Revenue Department', why: 'Scholarship review — cross-department verification', data: 'Residence', consent: 'Granted (existing)', result: 'Successful' });
  logApiCall('Revenue & Residence Registry', '/mock/residence/MH-CIT-10482', 200, 106);
  toast('Data exchange completed — residence verified without a resubmitted certificate');
}

/* ---------- OFFICER: ANALYTICS ---------- */
RENDER['o-analytics'] = () => `
  <div class="grid g2">
    <div class="card" style="padding:24px">
      <h4 style="font-family:Inter;font-size:14px;font-weight:700;margin-bottom:16px">${__(__("Applications by department"))}</h4>
      ${barChart([[__('Education'), 412], [__('Social Justice'), 268], [__('Revenue'), 190], [__('Rural Dev.'), 97]])}
    </div>
    <div class="card" style="padding:24px">
      <h4 style="font-family:Inter;font-size:14px;font-weight:700;margin-bottom:16px">${__(__("Processing time — before vs. after MahaSetu"))}</h4>
      ${barChart([[__('Before (avg. days)'), 14], [__('After (avg. days)'), 8.2]], true)}
    </div>
    <div class="card" style="padding:24px">
      <h4 style="font-family:Inter;font-size:14px;font-weight:700;margin-bottom:16px">${__(__("Duplicate verification — before vs. after"))}</h4>
      ${barChart([[__('Before'), 100], [__('After'), 66]], true)}
    </div>
    <div class="card" style="padding:24px">
      <h4 style="font-family:Inter;font-size:14px;font-weight:700;margin-bottom:16px">${__(__("Application status"))}</h4>
      <div style="display:flex;flex-direction:column;gap:10px;margin-top:8px">
        ${donutRow('Approved', 68, 'ok')}
        ${donutRow('Under Review', 19, 'warn')}
        ${donutRow('Pending', 9, 'neutral')}
        ${donutRow('Rejected', 4, 'err')}
      </div>
    </div>
  </div>
  <div style="margin-top:16px"><span class="sim-tag">${__(__("Simulated prototype metrics"))}</span></div>
`;
function barChart(pairs, compare) {
  const max = Math.max(...pairs.map(p => p[1]));
  return `<div style="display:flex;flex-direction:column;gap:12px">${pairs.map(([label, val]) => `
    <div>
      <div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:5px"><span style="color:var(--text-dim)">${__(label)}</span><span style="font-weight:700">${val}</span></div>
      <div class="progress-bar" style="height:9px"><i style="width:${(val / max * 100).toFixed(0)}%;background:${compare ? 'var(--saffron)' : 'var(--blue)'}"></i></div>
    </div>`).join('')}</div>`;
}
function donutRow(label, pct, cls) {
  return `<div style="display:flex;align-items:center;gap:10px">
    <span class="dot ${cls}" style="width:10px;height:10px"></span>
    <span style="font-size:13px;flex:1">${__(label)}</span>
    <span style="font-weight:700;font-size:13px">${pct}%</span>
  </div>`;
}

/* ---------- OFFICER: AUDIT LOG ---------- */
RENDER['o-audit'] = () => {
  if (!S.auditLog.length) return `<div class="card empty"><div class="ic">▣</div>${__(__("No audit events yet. Run the eligibility check or data exchange demo to generate a trail."))}</div>`;
  return `
  <div class="card">
    ${S.auditLog.map(e => `
      <div style="padding:18px 22px;border-bottom:1px solid var(--line)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <span style="font-weight:700;font-size:13.5px">${__(e.who)}</span>
          <span style="font-size:11.5px;color:var(--text-faint)" class="mono">${e.when}</span>
        </div>
        <div style="font-size:13px;color:var(--text-dim);margin-bottom:8px">${__(e.what)}</div>
        <div style="display:flex;gap:18px;flex-wrap:wrap;font-size:11.5px;color:var(--text-faint)">
          <span><strong style="color:var(--text-dim)">${__(__("Why:"))}</strong> ${__(e.why)}</span>
          <span><strong style="color:var(--text-dim)">${__(__("Data:"))}</strong> ${__(e.data)}</span>
          <span><strong style="color:var(--text-dim)">${__(__("Consent:"))}</strong> ${__(e.consent)}</span>
          <span>${statusBadge(e.result)}</span>
        </div>
      </div>`).join('')}
  </div>`;
};

/* ---------- ADMIN: INTEGRATIONS / ARCHITECTURE ---------- */
RENDER['a-systems'] = () => `
  <div class="grid g3">
    ${SYSTEMS.map(s => `
      <div class="card" style="padding:20px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div>
            <div style="font-weight:700;font-size:14px">${__(s.name)}</div>
            <div style="font-size:11.5px;color:var(--text-faint);margin-top:3px">${DEPARTMENTS.find(d => d.id === s.dept).name}</div>
          </div>
          ${statusBadge(S.systemHealth[s.id] === 'operational' ? 'Operational' : 'Offline')}
        </div>
        <div style="margin-top:14px;font-size:12px;color:var(--text-faint)">API latency: <span class="mono" style="color:var(--text)">${s.latency}ms</span></div>
        <div style="margin-top:12px;display:flex;gap:8px">
          <button class="btn btn-outline btn-sm" onclick="toggleSystemHealth('${s.id}')">${S.systemHealth[s.id] === 'operational' ? 'Simulate outage' : 'Restore'}</button>
        </div>
      </div>
    `).join('')}
  </div>
  <div class="section-title">Total API calls</div>
  <div class="grid g4">
    <div class="card stat-card"><div class="l">Total Calls</div><div class="n">24,842</div></div>
    <div class="card stat-card"><div class="l">Successful</div><div class="n" style="color:var(--ok)">24,601</div></div>
    <div class="card stat-card"><div class="l">Failed</div><div class="n" style="color:var(--err)">241</div></div>
    <div class="card stat-card"><div class="l">Success Rate</div><div class="n">99.03%</div></div>
  </div>
`;
function toggleSystemHealth(id) {
  S.systemHealth[id] = S.systemHealth[id] === 'operational' ? 'offline' : 'operational';
  toast((S.systemHealth[id] === 'operational' ? 'Restored: ' : 'Outage simulated: ') + SYSTEMS.find(s => s.id === id).name);
  nav('a-systems');
}

/* ---------- ADMIN: API MONITORING ---------- */
RENDER['a-monitoring'] = () => {
  if (!S.apiCallLog.length) return `<div class="card empty"><div class="ic">◷</div>No API calls logged yet this session. Run "Check My Eligibility" as a citizen to generate traffic.</div>`;
  return `
  <table class="data-table card" style="border-radius:14px;overflow:hidden">
    <thead><tr><th>Timestamp</th><th>System</th><th>Endpoint</th><th>Method</th><th>Status</th><th>Latency</th><th>Request ID</th></tr></thead>
    <tbody>
      ${S.apiCallLog.map(c => `<tr onclick="openApiCallDetail(${c.id})"><td class="mono">${c.ts}</td><td style="font-weight:600">${c.system}</td><td class="mono" style="font-size:12px">${c.endpoint}</td><td>${c.method}</td><td>${statusBadge(c.status === 200 ? 'Successful' : 'Failed')}</td><td class="mono">${c.latency}ms</td><td class="mono" style="font-size:12px">${c.reqId}</td></tr>`).join('')}
    </tbody>
  </table>`;
};
function openApiCallDetail(id) {
  const c = S.apiCallLog.find(x => x.id === id);
  openModal(`
    <div class="modal-head"><h3>${c.reqId}</h3><div class="x-btn" onclick="closeModal()">✕</div></div>
    <div class="modal-body">
      <div class="check-list">
        <div class="check-row"><div class="txt"><div class="t1">Request</div><div class="t2 mono">${c.method} ${c.endpoint}</div></div></div>
        <div class="check-row"><div class="txt"><div class="t1">Response</div><div class="t2">${statusBadge(c.status === 200 ? 'Successful' : 'Failed')} · ${c.latency}ms</div></div></div>
        <div class="check-row"><div class="txt"><div class="t1">Authorization status</div><div class="t2">Authorized — role-scoped token valid</div></div></div>
        <div class="check-row"><div class="txt"><div class="t1">Consent status</div><div class="t2">Verified prior to request</div></div></div>
        <div class="check-row"><div class="txt"><div class="t1">Transformation status</div><div class="t2">Normalized to canonical schema</div></div></div>
      </div>
    </div>`);
}

/* ---------- ADMIN: MASTER DATA ---------- */
RENDER['a-masterdata'] = () => `
  <div class="grid g2">
    <div class="card" style="padding:22px">
      <h4 style="font-family:Inter;font-size:14px;font-weight:700;margin-bottom:14px">Districts (standardized)</h4>
      <table class="data-table"><thead><tr><th>Canonical name</th><th>${__(__("Code"))}</th><th>Source variants folded in</th></tr></thead>
      <tbody>
        <tr><td style="font-weight:600">Pune</td><td class="mono">MH-PN</td><td style="color:var(--text-faint)">Pune, Poona, PUNE, Pune District</td></tr>
        <tr><td style="font-weight:600">Nashik</td><td class="mono">MH-NK</td><td style="color:var(--text-faint)">Nashik, Nasik, NASHIK</td></tr>
        <tr><td style="font-weight:600">Mumbai</td><td class="mono">MH-MB</td><td style="color:var(--text-faint)">Mumbai, Bombay, MUMBAI</td></tr>
      </tbody></table>
    </div>
    <div class="card" style="padding:22px">
      <h4 style="font-family:Inter;font-size:14px;font-weight:700;margin-bottom:14px">${__(__("Departments"))}</h4>
      <table class="data-table"><thead><tr><th>${__(__("Name"))}</th><th>${__(__("Code"))}</th></tr></thead>
      <tbody>${DEPARTMENTS.map(d => `<tr><td style="font-weight:600">${__(d.name)}</td><td class="mono">${d.code}</td></tr>`).join('')}</tbody></table>
    </div>
    <div class="card" style="padding:22px">
      <h4 style="font-family:Inter;font-size:14px;font-weight:700;margin-bottom:14px">${__(__("Document types"))}</h4>
      <table class="data-table"><tbody>
        ${['Residence Certificate', 'Income Certificate', 'Student ID', 'Marksheet', 'Caste Certificate', 'Bank Account Proof'].map(t => `<tr><td>${t}</td></tr>`).join('')}
      </tbody></table>
    </div>
    <div class="card" style="padding:22px">
      <h4 style="font-family:Inter;font-size:14px;font-weight:700;margin-bottom:14px">${__(__("Application statuses"))}</h4>
      <table class="data-table"><tbody>
        ${['Submitted', 'Verification', 'Under Review', 'Approved', 'Rejected'].map(t => `<tr><td>${statusBadge(t)}</td></tr>`).join('')}
      </tbody></table>
    </div>
  </div>
`;

/* ---------- ADMIN: DEMO CONTROL PANEL ---------- */
RENDER['a-demo'] = () => `
  <p style="color:var(--text-dim);font-size:14px;max-width:600px;margin-bottom:20px">${__(__("Drive the hackathon demo without hunting through screens."))}</p>
  <div class="grid g2">
    <div class="card" style="padding:22px">
      <h4 style="font-family:Inter;font-size:14px;font-weight:700;margin-bottom:14px">${__(__("Scenario controls"))}</h4>
      <div style="display:flex;flex-direction:column;gap:10px">
        <button class="btn btn-primary" onclick="switchRole('citizen');nav('c-schemes')">${__(__("Run Scholarship Verification"))}</button>
        <button class="btn btn-outline" onclick="toggleSystemHealth('income');nav('a-demo')">${__(__("Simulate API Failure (Income System)"))}</button>
        <button class="btn btn-outline" onclick="switchRole('citizen');nav('c-schemes');toast('Consent will be denied on the next request')">${__(__("Simulate Consent Denial"))}</button>
        <button class="btn btn-outline" onclick="approveLatest()">${__(__("Approve Latest Application"))}</button>
        <button class="btn btn-danger" onclick="resetDemo()">${__(__("Reset Demo"))}</button>
      </div>
    </div>
    <div class="card" style="padding:22px">
      <h4 style="font-family:Inter;font-size:14px;font-weight:700;margin-bottom:14px">${__(__("Session state"))}</h4>
      <div class="check-list">
        <div class="check-row"><div class="txt"><div class="t1">${__(__("Applications this session"))}</div><div class="t2">${S.applications.length}</div></div></div>
        <div class="check-row"><div class="txt"><div class="t1">${__(__("Active consents"))}</div><div class="t2">${S.consents.filter(c => c.status === 'Active').length}</div></div></div>
        <div class="check-row"><div class="txt"><div class="t1">${__(__("Audit events logged"))}</div><div class="t2">${S.auditLog.length}</div></div></div>
        <div class="check-row"><div class="txt"><div class="t1">${__(__("API calls logged"))}</div><div class="t2">${S.apiCallLog.length}</div></div></div>
      </div>
    </div>
  </div>
`;
function approveLatest() {
  if (!S.applications.length) { toast('No applications yet — run the scholarship scenario first'); return; }
  S.applications[0].status = 'Approved';
  toast('Latest application marked approved');
  nav('a-demo');
}
function resetDemo() {
  S.eligibilityChecked = false;
  // Reset to signed out state with demo citizen available
  S.citizenId = null;
  S.role = null;
  S.currentView = 'landing';
  S.consents = []; S.applications = []; S.auditLog = []; S.apiCallLog = [];
  S.notifications = []; // No notifications in reset state
  Object.keys(S.systemHealth).forEach(k => S.systemHealth[k] = 'operational');

  // Update sidebar to reflect signed out state
  switchRole(S.role);

  // Reset the demo citizen to Takshil Sangle (already set in CITIZENS)
  // No need to modify CITIZENS as it's already set to Takshil Sangle

  toast('Demo state reset - Signed out. Use Launch Demo to sign in as Takshil Sangle.');
  nav('landing');
}

RENDER['c-guide'] = () => {
  return `
    <div class="section-title" style="margin-top:0">Guide</div>
    <div class="card" style="padding:20px;max-width:600px;margin:0 auto">
      <div class="section-title">Step-by-step Government Guides</div>
      <div class="guide">
        <h3>🚗 Driving License Registration</h3>
        <ol>
          <li><strong>Step 1:</strong> Visit the Sarathi Parivahan portal: <a href="https://sarathi.parivahan.gov.in" target="_blank" rel="noopener">https://sarathi.parivahan.gov.in</a></li>
          <li><strong>Step 2:</strong> Click on "Apply for Driving License".</li>
          <li><strong>Step 3:</strong> Fill in the application form with your personal details.</li>
          <li><strong>Step 4:</strong> Upload required documents (proof of age, address, passport-sized photos).</li>
          <li><strong>Step 5:</strong> Pay the fee online.</li>
          <li><strong>Step 6:</strong> Schedule your test slot at the nearest RTO.</li>
          <li><strong>Step 7:</strong> Appear for the test (if applicable) and collect your license.</li>
        </ol>
        <hr>
        <h3>🛂 Passport Application</h3>
        <ol>
          <li><strong>Step 1:</strong> Register on the Passport Seva portal: <a href="https://www.passportindia.gov.in" target="_blank" rel="noopener">https://www.passportindia.gov.in</a></li>
          <li><strong>Step 2:</strong> Login and click "Apply for Fresh Passport/Re-issue of Passport".</li>
          <li><strong>Step 3:</strong> Fill in the application form with your details.</li>
          <li><strong>Step 4:</strong> Upload required documents (proof of date of birth, address, photos).</li>
          <li><strong>Step 5:</strong> Pay the fee online.</li>
          <li><strong>Step 6:</strong> Schedule an appointment at the nearest Passport Seva Kendra (PSK) or Post Office Passport Seva Kendra (POPSK).</li>
          <li><strong>Step 7:</strong> Visit the PSK/POPSK with original documents for verification.</li>
        </ol>
        <hr>
        <h3>🗳️ Voter ID Registration</h3>
        <ol>
          <li><strong>Step 1:</strong> Visit the Voter Portal of Election Commission of India: <a href="https://voterportal.eci.gov.in" target="_blank" rel="noopener">https://voterportal.eci.gov.in</a></li>
          <li><strong>Step 2:</strong> Click on "Fill Form 6 in New voter Registration panel.".</li>
          <li><strong>Step 3:</strong> Fill in Form 6 online with your details.</li>
          <li><strong>Step 4:</strong> Upload required documents (proof of age, address, photo).</li>
          <li><strong>Step 5:</strong> Submit the form and note the reference ID.</li>
          <li><strong>Step 6:</strong> Booth Level Officer (BLO) will visit your address for verification.</li>
          <li><strong>Step 7:</strong> After verification, your voter ID card will be dispatched by post.</li>
        </ol>
      </div>
      <div style="margin-top:15px;font-size:13px;color:var(--text-faint)">
        <em>Note: Links open in new tab. Ensure you have all documents ready before starting.</em>
      </div>
    </div>
  `;
};

RENDER['c-chatbot'] = () => {
  return `
    <div class="section-title" style="margin-top:0">${__("MahaSetu Assistant")}</div>
    <div class="card" style="padding:24px;max-width:500px;margin:0 auto">
      <div id="chatbot-messages">
        <div class="chatbot-message bot">
          ${__("chatbot_welcome")}
        </div>
        <div class="chatbot-options">
          <button class="btn btn-outline" onclick="showChatbotGuide('driving-license')">🚗 ${__("driving_license")}</button>
          <button class="btn btn-outline" onclick="showChatbotGuide('passport')">🛂 ${__("passport_app")}</button>
          <button class="btn btn-outline" onclick="showChatbotGuide('voter-id')">🗳️ ${__("voter_id")}</button>
          <button class="btn btn-outline" onclick="showChatbotGuide('scholarship')">🎓 ${__("scholarship_app")}</button>
        </div>
      </div>
      <div id="chatbot-guide" style="margin-top:20px;"></div>
    </div>
  `;
};

function showChatbotGuide(type) {
  const guide = GOVERNMENT_GUIDES[type];
  const container = document.getElementById('chatbot-guide');
  container.innerHTML = `
    <div class="chatbot-message bot">
      <strong>${__(guide.title)}</strong>
    </div>
    <div class="chatbot-message bot">
      <ol>
        ${guide.steps.map(step => {
    if (step.link) {
      return `<li><strong>${__("Step")} ${guide.steps.indexOf(step) + 1}:</strong> ${__(step.text)} <a href="${step.link}" target="_blank" rel="noopener">${step.link}</a></li>`;
    } else {
      return `<li><strong>${__("Step")} ${guide.steps.indexOf(step) + 1}:</strong> ${__(step.text)}</li>`;
    }
  }).join('')}
      </ol>
    </div>
    <div class="chatbot-message bot" style="text-align:center;margin-top:16px;">
      <button class="btn btn-outline" onclick="resetChatbot()">← ${__("back_to_topics")}</button>
    </div>
  `;
  // Reset chatbot messages to initial state and add current user message
  const messagesContainer = document.getElementById('chatbot-messages');
  messagesContainer.innerHTML = `
    <div class="chatbot-message bot">
      ${__("chatbot_welcome")}
    </div>
    <div class="chatbot-options">
      <button class="btn btn-outline" onclick="showChatbotGuide('driving-license')">🚗 ${__("driving_license")}</button>
      <button class="btn btn-outline" onclick="showChatbotGuide('passport')">🛂 ${__("passport_app")}</button>
      <button class="btn btn-outline" onclick="showChatbotGuide('voter-id')">🗳️ ${__("voter_id")}</button>
      <button class="btn btn-outline" onclick="showChatbotGuide('scholarship')">🎓 ${__("scholarship_app")}</button>
    </div>
  `;
  const userMsg = document.createElement('div');
  userMsg.className = 'chatbot-message user';
  userMsg.textContent = __("Show me guide for {0}", [__(guide.title)]);
  messagesContainer.appendChild(userMsg);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function resetChatbot() {
  const messagesContainer = document.getElementById('chatbot-messages');
  const guideContainer = document.getElementById('chatbot-guide');
  // Clear guide
  guideContainer.innerHTML = '';
  // Add back the initial bot message if not already present (we'll just reset to initial state)
  messagesContainer.innerHTML = `
    <div class="chatbot-message bot">
      ${__("chatbot_welcome")}
    </div>
    <div class="chatbot-options">
      <button class="btn btn-outline" onclick="showChatbotGuide('driving-license')">🚗 ${__("driving_license")}</button>
      <button class="btn btn-outline" onclick="showChatbotGuide('passport')">🛂 ${__("passport_app")}</button>
      <button class="btn btn-outline" onclick="showChatbotGuide('voter-id')">🗳️ ${__("voter_id")}</button>
      <button class="btn btn-outline" onclick="showChatbotGuide('scholarship')">🎓 ${__("scholarship_app")}</button>
    </div>
  `;
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Floating Chatbot Functionality
function initFloatingChatbot() {
  const floatingChatbot = document.getElementById('floating-chatbot');
  if (floatingChatbot) {
    floatingChatbot.addEventListener('click', () => {
      nav('c-chatbot');
    });
  }
}

/* ---------- init ---------- */
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
document.addEventListener('DOMContentLoaded', () => {
  initFloatingChatbot();
  initTranslation();
});
