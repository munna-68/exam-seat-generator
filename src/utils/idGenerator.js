const BATCH_DIGITS = {
  "13th": "0",
  "14th": "1",
  "15th": "2",
  "16th": "3",
  "17th": "4",
};

export const MAX_STUDENTS = 65;

export function getBatchDigit(batch) {
  return BATCH_DIGITS[batch] ?? "0";
}

export function generateStudentId(batch, studentNumber) {
  return `12${getBatchDigit(batch)}220${String(studentNumber).padStart(2, "0")}`;
}

export function generateStudentIds(batch, count) {
  const total = Math.max(0, Math.min(MAX_STUDENTS, Number(count) || 0));

  return Array.from({ length: total }, (_, index) =>
    generateStudentId(batch, index + 1),
  );
}

export function isValidStudentId(studentId, batch) {
  const value = String(studentId ?? "").trim();
  const expectedPrefix = `12${getBatchDigit(batch)}220`;

  return (
    value.length === 8 &&
    /^\d{8}$/.test(value) &&
    value.startsWith(expectedPrefix)
  );
}

function extractStudentNumber(studentId) {
  const value = String(studentId ?? "").trim();

  if (!/^\d{8}$/.test(value)) {
    return null;
  }

  return Number(value.slice(-2));
}

export function getNextAvailableStudentId(batch, studentIds) {
  const usedNumbers = new Set(
    studentIds
      .map(extractStudentNumber)
      .filter((value) => Number.isInteger(value)),
  );

  for (
    let studentNumber = 1;
    studentNumber <= MAX_STUDENTS;
    studentNumber += 1
  ) {
    if (!usedNumbers.has(studentNumber)) {
      return generateStudentId(batch, studentNumber);
    }
  }

  return null;
}

export { BATCH_DIGITS };
