
import { db } from './firebase';
import { collection, doc, getDocs, writeBatch, runTransaction, onSnapshot, setDoc, deleteDoc, updateDoc, query, where, getDoc } from 'firebase/firestore';
import type { QuizState, Question, User, LastResult } from './types';

let state: QuizState = {
  status: 'not-started',
  users: [],
  questions: [],
  userAssignments: {},
  lastResult: null,
};

const listeners = new Set<() => void>();

const notify = () => {
  listeners.forEach(listener => listener());
};

const generateQuizId = () => {
    // Generate two random strings and concatenate them to ensure a good length and uniqueness
    const part1 = Math.random().toString(36).substring(2, 9);
    const part2 = Date.now().toString(36).substring(4);
    return `${part1}${part2}`;
}


const parseCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"' && (i === 0 || line[i-1] === ',')) {
            inQuotes = true;
            continue; // Skip the opening quote
        }

        if (char === '"' && (i === line.length - 1 || line[i+1] === ',')) {
            inQuotes = false;
            continue; // Skip the closing quote
        }
        
        if (char === '"' && inQuotes && line[i+1] === '"') {
             // Handle escaped double quote ""
            currentField += '"';
            i++; // Skip next quote
            continue;
        }

        if (char === ',' && !inQuotes) {
            result.push(currentField);
            currentField = '';
        } else {
            currentField += char;
        }
    }
    result.push(currentField);
    return result.map(field => field.trim());
};


const processQuestionsCsv = (csvContent: string): Question[] => {
    const lines = csvContent.trim().split('\n');
    const headerLine = lines.shift()?.trim();
    if (!headerLine) return [];
    
    const header = headerLine.split(',').map(h => h.trim());
    const questions: Question[] = [];

    const idIndex = header.indexOf('id');
    const textIndex = header.indexOf('text');
    const correctAnswerTextIndex = header.indexOf('correctAnswer');
    const researchPaperIdIndex = header.indexOf('researchPaperId');
    const optionIndices = header.map((h, i) => h.startsWith('option') ? i : -1).filter(i => i !== -1);

    if (idIndex === -1 || textIndex === -1 || correctAnswerTextIndex === -1 || researchPaperIdIndex === -1 || optionIndices.length === 0) {
        console.error("CSV header is missing one of id, text, correctAnswer, researchPaperId or options columns.");
        return [];
    }
    
    lines.forEach(line => {
        const data = parseCsvLine(line);
        if (data.length >= header.length) {
            try {
                const options = optionIndices.map(index => data[index]).filter(Boolean);
                const correctAnswerText = data[correctAnswerTextIndex];
                const correctAnswerIndex = options.indexOf(correctAnswerText);

                if (correctAnswerIndex === -1) {
                    console.error(`Correct answer "${correctAnswerText}" not found in options for question ID ${data[idIndex]}`);
                    return;
                }

                questions.push({
                    id: parseInt(data[idIndex], 10),
                    text: data[textIndex],
                    options: options,
                    correctAnswer: correctAnswerIndex,
                    researchPaperId: data[researchPaperIdIndex]
                });
             } catch (e) {
                console.error(`Skipping malformed CSV line: ${line}`, e);
             }
        } else {
             console.error(`Skipping malformed CSV line (incorrect column count): ${line}`);
        }
    });

    return questions;
};

const processUsersCsv = (csvContent: string): { users: Omit<User, 'quizUrl' | 'score' | 'completed' | 'totalQuestions' | 'quizId'>[] } => {
    const lines = csvContent.trim().split('\n');
    const headerLine = lines.shift()?.trim();
    if (!headerLine) return { users: [] };
    
    const header = headerLine.split(',').map(h => h.trim());
    const users: Omit<User, 'quizUrl' | 'score' | 'completed' | 'totalQuestions' | 'quizId'>[] = [];

    const userIdIndex = header.indexOf('userId');
    const userNameIndex = header.indexOf('userName');
    const researchPaperIdIndex = header.indexOf('researchPaperId');
    
    if (userIdIndex === -1 || userNameIndex === -1 || researchPaperIdIndex === -1) {
      console.error("User CSV header is missing one of userId, userName, or researchPaperId columns.");
      return { users: [] };
    }

    lines.forEach(line => {
         const data = parseCsvLine(line);
         if (data.length >= header.length) {
            const userId = data[userIdIndex].trim();
            const userName = data[userNameIndex].trim();
            const researchPaperId = data[researchPaperIdIndex].trim();

            users.push({
                id: userId,
                name: userName,
                researchPaperId: researchPaperId,
            });
        }
    });
    return { users };
};


export const store = {
  getState: () => state,
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    
    const unsubscribes = [
      onSnapshot(doc(db, 'quiz', 'status'), (doc) => {
        state = { ...state, status: doc.data()?.status || 'not-started' };
        notify();
      }),
      onSnapshot(collection(db, 'users'), (snapshot) => {
        const users = snapshot.docs.map(doc => {
            const data = doc.data() as Omit<User, 'id'>;
            return {
                ...data,
                id: doc.id,
                quizUrl: `/quiz/${data.quizId}`
            }
        }).sort((a, b) => a.name.localeCompare(b.name)) as User[];
        state = { ...state, users };
        notify();
      }),
      onSnapshot(collection(db, 'questions'), (snapshot) => {
        const questions = snapshot.docs.map(doc => doc.data()).sort((a, b) => a.id - b.id) as Question[];
        state = { ...state, questions };
        notify();
      }),
       onSnapshot(collection(db, 'userAssignments'), (snapshot) => {
        const userAssignments: Record<string, number[]> = {};
        snapshot.docs.forEach(doc => {
            userAssignments[doc.id] = doc.data().questionIds;
        });
        state = { ...state, userAssignments };
        notify();
      }),
    ];

    return () => {
        listeners.delete(listener);
        unsubscribes.forEach(unsub => unsub());
    };
  },
  addQuestion: async (question: Question) => {
    const docRef = doc(db, 'questions', question.id.toString());
    await setDoc(docRef, question);
  },
  addUser: async (user: Omit<User, 'quizUrl' | 'score' | 'completed' | 'totalQuestions' | 'quizId'>) => {
    const batch = writeBatch(db);
    const userDocRef = doc(db, 'users', user.id);
    const quizId = generateQuizId();

    const questionsQuery = query(collection(db, 'questions'), where('researchPaperId', '==', user.researchPaperId));
    const questionsSnapshot = await getDocs(questionsQuery);
    const questionIds = questionsSnapshot.docs.map(doc => doc.data().id);

    batch.set(userDocRef, { 
        name: user.name, 
        researchPaperId: user.researchPaperId, 
        id: user.id,
        quizId: quizId,
    });

    const assignmentDocRef = doc(db, 'userAssignments', user.id);
    batch.set(assignmentDocRef, { questionIds });

    await batch.commit();
  },
  loadQuestionsFromCsv: async (csvContent: string) => {
    const questions = processQuestionsCsv(csvContent);
    if(questions.length > 0) {
      const batch = writeBatch(db);
      questions.forEach(q => {
        const docRef = doc(db, 'questions', q.id.toString());
        batch.set(docRef, q);
      });
      await batch.commit();
    }
  },
  loadUsersFromCsv: async (csvContent: string) => {
    const { users } = processUsersCsv(csvContent);
     if(users.length > 0) {
      const batch = writeBatch(db);

      // We need to fetch all questions to do the mapping locally.
      // This is less efficient than querying per user, but simpler for a batch operation.
      const allQuestionsSnapshot = await getDocs(collection(db, 'questions'));
      const allQuestions = allQuestionsSnapshot.docs.map(d => d.data() as Question);

      users.forEach(user => {
        const userDocRef = doc(db, 'users', user.id);
        const quizId = generateQuizId();
        batch.set(userDocRef, { 
            name: user.name, 
            researchPaperId: user.researchPaperId, 
            id: user.id,
            quizId: quizId,
        });

        const questionIds = allQuestions
            .filter(q => q.researchPaperId === user.researchPaperId)
            .map(q => q.id);
        
        const assignmentDocRef = doc(db, 'userAssignments', user.id);
        batch.set(assignmentDocRef, { questionIds });
      });

      await batch.commit();
    }
  },
  startQuiz: async () => {
    await setDoc(doc(db, 'quiz', 'status'), { status: 'active' });
  },
  endQuiz: async () => {
    await setDoc(doc(db, 'quiz', 'status'), { status: 'finished' });
  },
  resetQuiz: async () => {
    await runTransaction(db, async (transaction) => {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      usersSnapshot.forEach(userDoc => {
        transaction.update(userDoc.ref, {
          score: null,
          completed: false,
          totalQuestions: null
        });
      });
      transaction.set(doc(db, 'quiz', 'status'), { status: 'not-started' });
    });
  },
  submitScore: async (userId: string, score: number, total: number) => {
     try {
      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, { 
        score: score, 
        totalQuestions: total, 
        completed: true 
      });
    } catch (e) {
      console.error("Error submitting score: ", e);
    }
  },
  setLastResult: (result: LastResult) => {
    state = { ...state, lastResult: result };
    notify();
  },
  deleteQuestion: async (questionId: number) => {
    await deleteDoc(doc(db, 'questions', questionId.toString()));
  },
  clearAllQuestions: async () => {
    const questionsSnapshot = await getDocs(collection(db, 'questions'));
    const batch = writeBatch(db);
    questionsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  },
  deleteUser: async (userId: string) => {
    const batch = writeBatch(db);
    batch.delete(doc(db, 'users', userId));
    batch.delete(doc(db, 'userAssignments', userId));
    await batch.commit();
  },
  clearAllUsers: async () => {
    const batch = writeBatch(db);
    const usersSnapshot = await getDocs(collection(db, 'users'));
    usersSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    const assignmentsSnapshot = await getDocs(collection(db, 'userAssignments'));
    assignmentsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  }
};
