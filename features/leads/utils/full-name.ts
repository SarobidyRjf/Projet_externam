interface ParsedFullName {
  firstName: string;
  lastName: string;
}

export const isBlank = (value: unknown): boolean => {
  if (typeof value === 'string') {
    return value.trim().length === 0;
  }
  return value === undefined || value === null;
};

export const parseFullName = (fullName: unknown): ParsedFullName | null => {
  if (typeof fullName !== 'string') {
    return null;
  }

  const parts = fullName
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return null;
  }

  const lastName = parts.length > 1 ? parts.pop() ?? '' : parts[0];
  const firstName = parts.join(' ');

  return {
    firstName,
    lastName,
  };
};

interface ApplyFullNameDefaultsOptions {
  fullName: unknown;
  currentFirstName: unknown;
  currentLastName: unknown;
  onFirstNameUpdate: (value: string) => void;
  onLastNameUpdate: (value: string) => void;
}

export const applyFullNameDefaults = ({
  fullName,
  currentFirstName,
  currentLastName,
  onFirstNameUpdate,
  onLastNameUpdate,
}: ApplyFullNameDefaultsOptions): void => {
  const parsed = parseFullName(fullName);

  if (!parsed) {
    return;
  }

  const { firstName, lastName } = parsed;

  if (isBlank(currentFirstName)) {
    onFirstNameUpdate(firstName || lastName);
  }

  if (isBlank(currentLastName)) {
    onLastNameUpdate(lastName);
  }
};
