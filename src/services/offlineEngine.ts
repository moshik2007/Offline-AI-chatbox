import { KnowledgeRule, ResponseCategory } from '../types';

export const DEFAULT_RULES: KnowledgeRule[] = [
  // User's Core Identity & Greetings
  {
    id: 'greeting',
    triggers: ['hi', 'hello', 'hey', 'vanakkam', 'namaste', 'greetings', 'good morning', 'good afternoon', 'good evening', 'yo', 'sup'],
    response: 'Hello! 😊 Welcome to AI Offline Chatbot. I run 100% locally on your device without needing any internet connection!\n\nHow can I help you today? You can ask about AI, programming, college exams, math, or type "help".',
    category: 'greeting',
    isRegex: true,
    regexPattern: '\\b(hi|hello|hey|vanakkam|namaste|greetings)\\b',
    exampleQuery: 'Hello',
  },
  {
    id: 'name',
    triggers: ['your name', 'who are you', 'what is your name', 'whats your name', 'tell me your name', 'who created you', 'about you'],
    response: 'I am AI Offline Chatbot, your standalone virtual assistant! I operate entirely inside your browser using client-side algorithms, so I never send your data across the internet.',
    category: 'identity',
    exampleQuery: 'What is your name?',
  },
  {
    id: 'how_are_you',
    triggers: ['how are you', 'how do you do', 'how are u', 'how r u', 'are you okay', 'how is it going'],
    response: 'I am running smoothly and 100% offline! 😊 Ready to answer questions on programming, computer science, exams, or solve calculations for you.',
    category: 'greeting',
    exampleQuery: 'How are you?',
  },
  {
    id: 'what_is_ai',
    triggers: ['what is ai', 'define ai', 'explain ai', 'meaning of ai', 'artificial intelligence', 'concept of ai'],
    response: 'Artificial Intelligence (AI) is a branch of computer science dedicated to building machines and algorithms capable of performing tasks that typically require human cognition.\n\nKey Subfields:\n• Machine Learning (ML): Systems that learn from data patterns.\n• Deep Learning: Multi-layered artificial neural networks.\n• Natural Language Processing (NLP): Understanding human languages.\n• Computer Vision: Image & video analysis and scene recognition.',
    category: 'ai',
    exampleQuery: 'What is AI?',
  },
  {
    id: 'offline_definition',
    triggers: ['offline', 'what is offline', 'offline mode', 'why offline', 'how does offline work', 'work offline', 'no internet'],
    response: 'Offline means working without an internet connection. This chatbot uses locally cached code, an embedded knowledge base, and client-side natural language matching.\n\nBenefits:\n🔒 100% Private: Zero packets sent to external servers.\n⚡ Instant: Zero network latency (< 5ms response time).\n✈️ Works anywhere: On flights, trains, remote areas, and power outages.',
    category: 'identity',
    exampleQuery: 'How does offline work?',
  },

  // Programming Core
  {
    id: 'html',
    triggers: ['html', 'what is html', 'define html', 'html basic', 'html code', 'html5'],
    response: 'HTML (HyperText Markup Language) is the standard markup language used to structure documents and elements on the World Wide Web.',
    category: 'web',
    codeLang: 'html',
    codeSnippet: '<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8">\n    <title>Offline Web App</title>\n  </head>\n  <body>\n    <h1>Hello World</h1>\n    <p>Rendered with pure HTML.</p>\n  </body>\n</html>',
    exampleQuery: 'What is HTML?',
  },
  {
    id: 'python',
    triggers: ['python', 'what is python', 'python code', 'explain python', 'learn python', 'python syntax'],
    response: 'Python is a high-level, interpreted programming language renowned for its elegant syntax and readability. It is the dominant language in AI, Machine Learning, Data Science, and Scripting.',
    category: 'programming',
    codeLang: 'python',
    codeSnippet: '# Python: Fibonacci Generator\ndef fibonacci(n):\n    a, b = 0, 1\n    for _ in range(n):\n        yield a\n        a, b = b, a + b\n\nprint(list(fibonacci(7)))  # [0, 1, 1, 2, 3, 5, 8]',
    exampleQuery: 'Explain Python',
  },
  {
    id: 'java',
    triggers: ['java', 'what is java', 'java code', 'explain java', 'oop in java', 'java basics'],
    response: 'Java is an object-oriented, class-based programming language built on the principle of "Write Once, Run Anywhere" (WORA) via the Java Virtual Machine (JVM).',
    category: 'programming',
    codeLang: 'java',
    codeSnippet: 'public class Student {\n    private String name;\n    public Student(String name) { this.name = name; }\n    public void study() {\n        System.out.println(name + " is preparing for exams!");\n    }\n}',
    exampleQuery: 'What is Java?',
  },
  {
    id: 'c_cpp',
    triggers: ['c language', 'c++', 'cpp', 'what is c', 'what is c++', 'pointers', 'c programming'],
    response: 'C is a foundational procedural language known for low-level memory control and speed. C++ extends C with Object-Oriented Programming (classes, inheritance, polymorphism, templates) and is widely used in game engines, operating systems, and high-performance computing.',
    category: 'programming',
    codeLang: 'cpp',
    codeSnippet: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "High performance C++ executable!" << endl;\n    return 0;\n}',
    exampleQuery: 'What is C++?',
  },
  {
    id: 'javascript',
    triggers: ['javascript', 'js', 'what is javascript', 'es6', 'ecmascript', 'js basics'],
    response: 'JavaScript is the ubiquitous scripting language that powers interactive behavior on web browsers and backends (via Node.js). It supports event-driven, functional, and prototype-based programming.',
    category: 'web',
    codeLang: 'javascript',
    codeSnippet: '// Modern JavaScript Async/Await\nasync function loadLocalData() {\n  const data = localStorage.getItem("userData");\n  return JSON.parse(data || "{}");\n}',
    exampleQuery: 'What is JavaScript?',
  },
  {
    id: 'react',
    triggers: ['react', 'reactjs', 'what is react', 'hooks', 'virtual dom', 'components in react'],
    response: 'React is a popular UI library developed by Meta for building modular, declarative user interfaces using reusable components, state hooks, and an efficient Virtual DOM.',
    category: 'web',
    codeLang: 'typescript',
    codeSnippet: 'import { useState } from "react";\n\nexport function Counter() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>;\n}',
    exampleQuery: 'What is React?',
  },
  {
    id: 'css',
    triggers: ['css', 'what is css', 'flexbox', 'grid', 'tailwind', 'styling'],
    response: 'CSS (Cascading Style Sheets) designs the visual presentation, responsive layout, animations, and typography of HTML elements across different screen resolutions.',
    category: 'web',
    codeLang: 'css',
    codeSnippet: '.chat-card {\n  display: flex;\n  flex-direction: column;\n  border-radius: 1rem;\n  background: #141e30;\n  box-shadow: 0 10px 25px rgba(0,0,0,0.4);\n}',
    exampleQuery: 'What is CSS?',
  },
  {
    id: 'sql',
    triggers: ['sql', 'database', 'rdbms', 'what is sql', 'mysql', 'postgres', 'queries'],
    response: 'SQL (Structured Query Language) is the standard query language for storing, manipulating, and retrieving data from relational database management systems (RDBMS).',
    category: 'programming',
    codeLang: 'sql',
    codeSnippet: '-- Query top performing students\nSELECT id, name, gpa\nFROM students\nWHERE gpa >= 8.5\nORDER BY gpa DESC LIMIT 5;',
    exampleQuery: 'What is SQL?',
  },
  {
    id: 'git',
    triggers: ['git', 'github', 'version control', 'git commands', 'git push', 'git commit'],
    response: 'Git is a distributed version control system that tracks modifications in source code during development, allowing teams to collaborate, branch, merge, and rollback code safely.',
    category: 'programming',
    codeLang: 'bash',
    codeSnippet: 'git status\ngit add .\ngit commit -m "feat: complete offline brain integration"\ngit push origin main',
    exampleQuery: 'What is Git?',
  },
  {
    id: 'dsa',
    triggers: ['dsa', 'data structures', 'algorithms', 'array', 'linked list', 'stack', 'queue', 'binary search', 'big o'],
    response: 'Data Structures & Algorithms (DSA) form the foundation of computer science:\n\n• Arrays: Contiguous memory, O(1) random access.\n• Stacks: LIFO (Last In First Out) used in undo/redo and recursion.\n• Queues: FIFO (First In First Out) used in task scheduling.\n• Hash Maps: Key-value store with average O(1) lookups.\n• Binary Search: O(log n) lookup on sorted datasets.\n• Big-O: Measures how time/memory complexity scales with input size.',
    category: 'programming',
    exampleQuery: 'Explain Data Structures',
  },

  // College & Exams
  {
    id: 'college',
    triggers: ['college', 'exam', 'exam preparation', 'study tips', 'marks', 'how to study', 'semester', 'cgpa', 'pass exam'],
    response: 'Study regularly, practise programs daily, and revise important questions to prepare for your exams!\n\n💡 Pro Tips for College Success:\n1. Solve previous 5 years question papers (PYQs).\n2. Master 16-mark and 8-mark conceptual questions with neat architecture diagrams.\n3. Write and run programs on your computer rather than just reading code.\n4. Use the Pomodoro Technique: 25 minutes focused study, 5-minute break.\n5. Keep your handwritten notes concise for fast last-minute revision.',
    category: 'college',
    exampleQuery: 'College study tips',
  },
  {
    id: 'project_ideas',
    triggers: ['project ideas', 'final year project', 'mini project', 'college project', 'cs project', 'ideas for project'],
    response: '🚀 Top Project Ideas for Engineering Students:\n1. Offline Intelligent PWA Assistant (Local IndexedDB + NLP engine)\n2. Campus Placement & Mock Technical Interview Simulator\n3. Smart Attendance & Hall Ticket QR Verifier\n4. IoT Smart Energy Consumption & Fault Monitor\n5. AI Resume Parser & Skill Gap Analyzer\n6. Blockchain-based Tamper-proof Degree Verification',
    category: 'college',
    exampleQuery: 'College project ideas',
  },
  {
    id: 'interview_tips',
    triggers: ['interview', 'interview questions', 'hr interview', 'technical interview', 'campus placement', 'placement tips'],
    response: '🎯 Campus Placement Interview Preparation:\n\n1. Technical Round:\n• Core CS: OOPs, DBMS, OS, Computer Networks.\n• Coding: Arrays, Strings, Two Pointers, Hash Maps.\n• Explain your thought process out loud to the interviewer.\n\n2. HR Round:\n• "Tell me about yourself": Elevator pitch highlighting your skills and projects.\n• Have 2 clear examples of teamwork and solving a technical bug.\n• Always prepare 1-2 questions to ask the interviewer at the end!',
    category: 'college',
    exampleQuery: 'Interview preparation tips',
  },

  // Tamil & Tanglish Knowledge
  {
    id: 'tanglish_ai',
    triggers: ['tamil', 'tanglish', 'ai tamil', 'tamil ai', 'explain in tamil', 'tanglish explanation', 'tamil language'],
    response: 'AI na Artificial Intelligence (செயற்கை நுண்ணறிவு). Idhu computer-ku human madhiri yosikka, learn panna, matrum problem solve panna help pannum technology.\n\nUdaharanathukku: Siri, Google Maps, Auto-correct, matrum Self-driving cars ellam AI moolama dhaan operate aagudhu!',
    category: 'tanglish',
    exampleQuery: 'Explain AI in Tanglish',
  },
  {
    id: 'tanglish_python',
    triggers: ['python tamil', 'python in tamil', 'tamil python', 'tanglish python'],
    response: 'Python oru romba easy-aana programming language! English madhiri simple syntax irukkum, adhanaala beginners-ku learn panna romba best.\n\nAI, Machine Learning, Data Science, Web Development (Django/Flask), automation ellathulayum Python dhaan number one choice!',
    category: 'tanglish',
    exampleQuery: 'Python in Tamil',
  },
  {
    id: 'tanglish_exam',
    triggers: ['exam tips tamil', 'college tamil', 'study tips tamil', 'tanglish exam'],
    response: 'College exams-ku bayapada thevai illa! Daily 1-2 hours programs run panni paarunga. Important 16-mark & 8-mark questions-oda concepts-ah purinjukittu architecture diagram ezhudhina nalla CGPA kandippa edukkalaam. All the best! 👍',
    category: 'tanglish',
    exampleQuery: 'College tips in Tanglish',
  },

  // General Science & Tech
  {
    id: 'machine_learning',
    triggers: ['machine learning', 'what is ml', 'ml', 'types of ml', 'supervised learning', 'unsupervised'],
    response: 'Machine Learning (ML) is a subset of AI where computers learn rules and patterns directly from training data without being explicitly hardcoded.\n\n3 Main Types:\n1. Supervised Learning: Learning with labeled inputs (e.g., spam detection, price prediction).\n2. Unsupervised Learning: Finding hidden patterns in unlabeled data (e.g., customer clustering).\n3. Reinforcement Learning: Learning through trial, error, rewards, and penalties (e.g., game bots, autonomous vehicles).',
    category: 'ai',
    exampleQuery: 'What is Machine Learning?',
  },
  {
    id: 'deep_learning',
    triggers: ['deep learning', 'neural network', 'ann', 'cnn', 'rnn', 'what is deep learning'],
    response: 'Deep Learning is an advanced subset of Machine Learning powered by Artificial Neural Networks with multiple hidden layers. Inspired by the human brain, deep learning handles unstructured data like images (CNNs), audio, and natural language (Transformers/LLMs).',
    category: 'ai',
    exampleQuery: 'What is Deep Learning?',
  },
  {
    id: 'cloud_computing',
    triggers: ['cloud', 'cloud computing', 'aws', 'azure', 'gcp', 'what is cloud'],
    response: 'Cloud Computing is the on-demand delivery of IT resources (computing power, database storage, networking, applications) over the internet with pay-as-you-go pricing, replacing on-premise servers.',
    category: 'web',
    exampleQuery: 'What is Cloud Computing?',
  },
  {
    id: 'cybersecurity',
    triggers: ['cybersecurity', 'hacking', 'security', 'firewall', 'encryption', 'ssl', 'https'],
    response: 'Cybersecurity involves protecting computer networks, servers, mobile devices, electronic systems, and data from malicious digital attacks, unauthorized access, or disruption.',
    category: 'programming',
    exampleQuery: 'What is Cybersecurity?',
  },
  {
    id: 'operating_system',
    triggers: ['operating system', 'os', 'linux', 'windows', 'kernel', 'process', 'thread'],
    response: 'An Operating System (OS) is system software that manages computer hardware, memory resources, file systems, and provides common services for computer programs (e.g., Linux, Windows, macOS).',
    category: 'programming',
    exampleQuery: 'What is an Operating System?',
  },

  // Casual & Utility
  {
    id: 'jokes',
    triggers: ['joke', 'tell me a joke', 'make me laugh', 'funny', 'tell joke', 'jokes'],
    response: '😄 Here is a programming joke for you:\n\nWhy do programmers prefer dark mode?\nBecause light attracts bugs! 🐛\n\n(Ask me again for another joke!)',
    category: 'general',
    exampleQuery: 'Tell me a joke',
  },
  {
    id: 'quotes',
    triggers: ['quote', 'motivate me', 'motivation', 'motivational quote', 'inspiring', 'inspirational quote'],
    response: '🌟 Motivational thought for today:\n\n"The only way to do great work is to love what you do. If you haven\'t found it yet, keep looking. Don\'t settle."\n— Steve Jobs\n\nKeep writing code and building every day!',
    category: 'general',
    exampleQuery: 'Motivate me',
  },
  {
    id: 'thank_you',
    triggers: ['thank', 'thanks', 'thank you', 'nandri', 'thx', 'appreciate it'],
    response: "You're welcome! 😊 Happy to help anytime. Keep learning and practicing!",
    category: 'greeting',
    exampleQuery: 'Thank you!',
  },
  {
    id: 'farewell',
    triggers: ['bye', 'goodbye', 'see you', 'tata', 'catch you later', 'exit'],
    response: 'Goodbye! 👋 Have a wonderful day, keep coding, and stay curious!',
    category: 'greeting',
    isRegex: true,
    regexPattern: '\\b(bye|goodbye|tata)\\b',
    exampleQuery: 'Goodbye',
  },
  {
    id: 'help',
    triggers: ['help', 'what can you do', 'commands', 'menu', 'options', 'features'],
    response: '🤖 AI Offline Chatbot Capabilities (100% Offline):\n\n📚 Topics you can ask me:\n• Artificial Intelligence & Machine Learning\n• HTML, CSS, JavaScript, React, Web Dev\n• Python, Java, C++, SQL Programming\n• Data Structures, Algorithms & Big-O\n• College Exam Tips, CGPA & Study Advice\n• Tamil & Tanglish Explanations\n• Placement & Interview Guidance\n\n🧮 Offline Tools:\n• Math Solver (e.g. "calc 45 * 12", "sqrt(144)")\n• Unit Converter (e.g. "100 km to miles", "35 c to f")\n• System Clock (e.g. "current time", "what date is today")\n• Casual: "tell me a joke", "motivate me"\n\n💡 Tip: You can train custom rules anytime by clicking "Brain Rules" in the top bar!',
    category: 'help',
    exampleQuery: 'help',
  },
];

// Offline Local Storage Keys
const CUSTOM_RULES_KEY = 'ai_offline_chatbot_custom_rules_v1';

export function getCustomRules(): KnowledgeRule[] {
  try {
    const raw = localStorage.getItem(CUSTOM_RULES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load custom rules from localStorage', e);
    return [];
  }
}

export function saveCustomRules(rules: KnowledgeRule[]) {
  try {
    localStorage.setItem(CUSTOM_RULES_KEY, JSON.stringify(rules));
  } catch (e) {
    console.error('Failed to save custom rules', e);
  }
}

export function addCustomRule(rule: Omit<KnowledgeRule, 'id' | 'isCustom'>): KnowledgeRule {
  const customRules = getCustomRules();
  const newRule: KnowledgeRule = {
    ...rule,
    id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    isCustom: true,
  };
  customRules.push(newRule);
  saveCustomRules(customRules);
  return newRule;
}

export function deleteCustomRule(ruleId: string): boolean {
  const customRules = getCustomRules();
  const filtered = customRules.filter((r) => r.id !== ruleId);
  saveCustomRules(filtered);
  return filtered.length !== customRules.length;
}

export function getAllRules(): KnowledgeRule[] {
  const custom = getCustomRules();
  return [...custom, ...DEFAULT_RULES];
}

// Offline Safe Math & Unit Evaluation
export function tryEvaluateOfflineMath(input: string): { result: string; isMath: boolean } | null {
  const clean = input.trim().toLowerCase();

  // Handle explicit time request with live offline system clock
  if (/\b(time|what time|current time|what is the time|clock|what day|today date|current date)\b/.test(clean)) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const dateStr = now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    return {
      result: `🕒 Current Offline System Time:\n• Time: ${timeStr}\n• Date: ${dateStr}\n\n(Computed directly from your local hardware clock without any network requests!)`,
      isMath: true,
    };
  }

  // Unit conversions: e.g. "convert 100 km to miles"
  const kmToMiles = clean.match(/(?:convert\s+)?([\d.]+)\s*(?:km|kilometers?)\s+(?:to|in)\s+miles?/i);
  if (kmToMiles) {
    const val = parseFloat(kmToMiles[1]);
    const miles = (val * 0.621371).toFixed(3);
    return { result: `📏 Conversion: ${val} km = ${miles} miles`, isMath: true };
  }

  const milesToKm = clean.match(/(?:convert\s+)?([\d.]+)\s*miles?\s+(?:to|in)\s*(?:km|kilometers?)/i);
  if (milesToKm) {
    const val = parseFloat(milesToKm[1]);
    const km = (val * 1.60934).toFixed(3);
    return { result: `📏 Conversion: ${val} miles = ${km} kilometers`, isMath: true };
  }

  const cToF = clean.match(/(?:convert\s+)?(-?[\d.]+)\s*(?:c|celsius)\s+(?:to|in)\s*(?:f|fahrenheit)/i);
  if (cToF) {
    const c = parseFloat(cToF[1]);
    const f = ((c * 9) / 5 + 32).toFixed(1);
    return { result: `🌡️ Temperature: ${c}°C = ${f}°F`, isMath: true };
  }

  const fToC = clean.match(/(?:convert\s+)?(-?[\d.]+)\s*(?:f|fahrenheit)\s+(?:to|in)\s*(?:c|celsius)/i);
  if (fToC) {
    const f = parseFloat(fToC[1]);
    const c = (((f - 32) * 5) / 9).toFixed(1);
    return { result: `🌡️ Temperature: ${f}°F = ${c}°C`, isMath: true };
  }

  // Percentage: e.g. "15% of 800"
  const percentMatch = clean.match(/(?:what is\s+)?([\d.]+)%\s+(?:of|\*)\s+([\d.]+)/i);
  if (percentMatch) {
    const p = parseFloat(percentMatch[1]);
    const total = parseFloat(percentMatch[2]);
    const res = ((p / 100) * total).toFixed(2);
    return { result: `🧮 ${p}% of ${total} = ${res}`, isMath: true };
  }

  // Math expression: "calc 25 * 4", "sqrt(144)", "25 + 34 * 2"
  let mathStr = clean;
  if (mathStr.startsWith('calc') || mathStr.startsWith('calculate') || mathStr.startsWith('eval') || mathStr.startsWith('what is ')) {
    mathStr = mathStr.replace(/^(calc|calculate|eval|what is)\s*:?/i, '').trim();
  }

  const isCandidateMath = /^[\d\s+\-*/().^%]+$/.test(mathStr) && /[\d]/.test(mathStr) && /[+\-*/^%]/.test(mathStr);
  const isSqrt = /^sqrt\(\s*[\d.]+\s*\)$/i.test(mathStr);

  if (isCandidateMath || isSqrt) {
    try {
      const sanitized = mathStr.replace(/\^/g, '**');
      if (isSqrt) {
        const val = mathStr.match(/sqrt\(\s*([\d.]+)\s*\)/i)?.[1];
        if (val) {
          const num = parseFloat(val);
          return { result: `🧮 √${num} = ${Math.sqrt(num)}`, isMath: true };
        }
      }
      if (/^[0-9\s+\-*/().*]+$/.test(sanitized)) {
        // eslint-disable-next-line no-new-func
        const evalResult = new Function(`return (${sanitized})`)();
        if (typeof evalResult === 'number' && !Number.isNaN(evalResult) && Number.isFinite(evalResult)) {
          return {
            result: `🧮 Offline Math Result: ${mathStr} = ${Number(evalResult.toFixed(6))}`,
            isMath: true,
          };
        }
      }
    } catch {
      // ignore
    }
  }

  return null;
}

// Tokenizer & Jaccard string similarity
function calculateSimilarity(str1: string, str2: string): number {
  const cleanStr = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 1);

  const words1 = cleanStr(str1);
  const words2 = cleanStr(str2);
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  let intersection = 0;
  for (const w of set1) {
    if (set2.has(w)) intersection++;
  }
  const union = new Set([...words1, ...words2]).size;
  return union === 0 ? 0 : intersection / union;
}

export interface MatchResult {
  reply: string;
  category: ResponseCategory;
  codeSnippet?: string;
  codeLang?: string;
  ruleId?: string;
  isCustom?: boolean;
  isOfflineMatch: boolean;
  score: number;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function matchesTrigger(text: string, trigger: string): boolean {
  const t = trigger.toLowerCase().trim();
  if (!t) return false;
  if (text === t) return true;
  // Use word boundaries so short triggers like 'os', 'ml', 'js', 'ai' don't match inside unrelated words like 'photosynthesis' or 'explain'
  const pattern = new RegExp(`(?:^|\\b|\\s)${escapeRegExp(t)}(?:$|\\b|\\s)`, 'i');
  return pattern.test(text);
}

// Intelligent Offline Knowledge Synthesizer
// When a query does not match an exact trigger, this reasoning engine parses concepts and generates a thoughtful response
function synthesizeOfflineKnowledge(rawQuery: string): MatchResult {
  const q = rawQuery.toLowerCase();

  // Concept dictionary for intelligent offline synthesis
  const concepts: { [key: string]: { topic: string; reply: string; code?: string; lang?: string } } = {
    loop: {
      topic: 'Programming Loops',
      reply: 'A loop repeatedly executes a block of code while a specified condition holds true. Common types are `for` loops (count-controlled) and `while` loops (condition-controlled).',
      code: '// JavaScript Loop Example\nfor (let i = 1; i <= 5; i++) {\n  console.log(`Iteration: ${i}`);\n}',
      lang: 'javascript',
    },
    variable: {
      topic: 'Variables & Memory',
      reply: 'A variable is an identified storage location in computer memory that holds data or a reference to an object. In modern languages, variables are declared with scope qualifiers (e.g. `let`, `const`, or typed specifiers).',
      code: '# Python variable assignment\nuser_name = "Lakshman"\nstudent_gpa = 9.2',
      lang: 'python',
    },
    function: {
      topic: 'Functions & Methods',
      reply: 'A function is a self-contained, reusable block of code designed to perform a specific task, take inputs (parameters), and return an output value.',
      code: 'function add(a, b) {\n  return a + b;\n}\nconsole.log(add(10, 25)); // 35',
      lang: 'javascript',
    },
    array: {
      topic: 'Arrays',
      reply: 'An Array is a sequential data structure storing elements of similar type in contiguous memory locations with zero-indexed indexing for O(1) direct access.',
      code: 'const numbers = [10, 20, 30, 40, 50];\nconsole.log(numbers[0]); // 10',
      lang: 'javascript',
    },
    database: {
      topic: 'Databases',
      reply: 'A database is an organized collection of structured data stored electronically. Relational databases (SQL) organize data into tables, while NoSQL databases use documents, key-values, or graphs.',
    },
    compiler: {
      topic: 'Compilers vs Interpreters',
      reply: 'A Compiler translates entire source code into machine code before execution (e.g., C, C++, Rust). An Interpreter translates and executes code line-by-line at runtime (e.g., Python, Ruby).',
    },
    internet: {
      topic: 'Internet & Networking',
      reply: 'The Internet is a global system of interconnected computer networks that communicate via standard protocols like TCP/IP, HTTP/HTTPS, and DNS.',
    },
    cpu: {
      topic: 'CPU (Central Processing Unit)',
      reply: 'The CPU is the primary brain of the computer that fetches, decodes, and executes instructions through an arithmetic logic unit (ALU), control unit, and registers.',
    },
    memory: {
      topic: 'RAM vs Storage',
      reply: 'RAM (Random Access Memory) is high-speed volatile working memory wiped on power-off. SSDs and Hard Drives are non-volatile storage preserving files permanently.',
    },
    pomodoro: {
      topic: 'Pomodoro Technique',
      reply: 'The Pomodoro Technique breaks study sessions into 25 minutes of hyper-focused study followed by a 5-minute break. After 4 cycles, take a longer 20-minute break.',
    },
    cgpa: {
      topic: 'CGPA & Grades',
      reply: 'To improve your CGPA:\n1. Maintain steady attendance (internal marks).\n2. Score maximum marks on lab practicals and assignments.\n3. Prepare diagrams and neat structured points for 16-mark semester questions.',
    },
  };

  // Check if any known concept word exists in query
  for (const [key, val] of Object.entries(concepts)) {
    if (q.includes(key)) {
      return {
        reply: `💡 [Offline Knowledge: ${val.topic}]\n\n${val.reply}\n\n(Ask me for more details or code examples!)`,
        category: 'programming',
        codeSnippet: val.code,
        codeLang: val.lang,
        isOfflineMatch: true,
        score: 0.75,
      };
    }
  }

  // Contextual conversational analysis
  if (q.includes('who') && (q.includes('invent') || q.includes('father') || q.includes('created computer'))) {
    return {
      reply: 'Charles Babbage is considered the "Father of the Computer" for conceptualizing the Analytical Engine. Ada Lovelace is celebrated as the world\'s first computer programmer, and Alan Turing laid the theoretical foundation of modern computer science and AI.',
      category: 'general',
      isOfflineMatch: true,
      score: 0.8,
    };
  }

  if (q.includes('difference') || q.includes(' vs ') || q.includes('versus')) {
    if (q.includes('python') && q.includes('java')) {
      return {
        reply: '⚖️ Python vs Java:\n\n• Syntax: Python is concise and dynamically typed; Java is verbose and statically typed.\n• Execution: Python is interpreted/bytecode; Java compiles to JVM bytecode (faster in large systems).\n• Use Cases: Python dominates AI, Data Science, and rapid prototyping; Java powers enterprise backends and Android.',
        category: 'programming',
        isOfflineMatch: true,
        score: 0.9,
      };
    }
    if (q.includes('sql') && q.includes('nosql')) {
      return {
        reply: '⚖️ SQL vs NoSQL:\n\n• SQL: Relational, structured tables, strict schemas, ACID compliance (PostgreSQL, MySQL).\n• NoSQL: Non-relational, flexible document/key-value schemas, high horizontal scalability (MongoDB, Redis).',
        category: 'programming',
        isOfflineMatch: true,
        score: 0.9,
      };
    }
  }

  // Friendly, helpful offline intelligence fallback
  return {
    reply: `🤖 Offline Brain Analysis:\n\nI processed your query locally on your device. While I don't have a pre-memorized rule for "${rawQuery}", I am ready to help you with:\n\n• Technical topics: AI, Python, Java, HTML, CSS, JavaScript, SQL, C++, Data Structures, OS.\n• College & Exams: Exam study techniques, project ideas, placement tips.\n• Instant calculations: Try "calc 45 * 12", "sqrt(144)", or "time".\n• Custom rules: Click "Brain Rules" above to teach me this exact question!`,
    category: 'general',
    isOfflineMatch: true,
    score: 0.3,
  };
}

export function getOfflineReply(message: string): MatchResult {
  const text = message.toLowerCase().trim();

  // 1. Check offline math & utilities first
  const mathEval = tryEvaluateOfflineMath(text);
  if (mathEval) {
    return {
      reply: mathEval.result,
      category: 'math',
      isOfflineMatch: true,
      score: 1.0,
      ruleId: 'math_eval',
    };
  }

  const allRules = getAllRules();

  // 2. Direct regex or exact inclusion check
  for (const rule of allRules) {
    if (rule.isRegex && rule.regexPattern) {
      const reg = new RegExp(rule.regexPattern, 'i');
      if (reg.test(text)) {
        return {
          reply: rule.response,
          category: rule.category,
          codeSnippet: rule.codeSnippet,
          codeLang: rule.codeLang,
          ruleId: rule.id,
          isOfflineMatch: true,
          score: 1.0,
        };
      }
    }

    for (const trigger of rule.triggers) {
      if (matchesTrigger(text, trigger)) {
        return {
          reply: rule.response,
          category: rule.category,
          codeSnippet: rule.codeSnippet,
          codeLang: rule.codeLang,
          ruleId: rule.id,
          isCustom: Boolean(rule.isCustom),
          isOfflineMatch: true,
          score: 0.95,
        };
      }
    }
  }

  // 3. Fuzzy match across triggers
  let bestScore = 0;
  let bestRule: KnowledgeRule | null = null;

  for (const rule of allRules) {
    for (const trigger of rule.triggers) {
      const score = calculateSimilarity(text, trigger);
      if (score > bestScore) {
        bestScore = score;
        bestRule = rule;
      }
    }
  }

  if (bestRule && bestScore >= 0.35) {
    return {
      reply: bestRule.response,
      category: bestRule.category,
      codeSnippet: bestRule.codeSnippet,
      codeLang: bestRule.codeLang,
      ruleId: bestRule.id,
      isOfflineMatch: true,
      score: bestScore,
    };
  }

  // 4. Offline Knowledge Synthesizer
  return synthesizeOfflineKnowledge(message);
}
