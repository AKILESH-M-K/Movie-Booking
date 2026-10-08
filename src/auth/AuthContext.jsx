import { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  normalizeEmail,
  sanitizeName,
  sanitizePhone,
} from "../utils/validation";

const AuthContext = createContext(null);

// Placeholder record used to keep login timing consistent for unknown emails.
const DUMMY_RECORD = {
  salt: "AAAAAAAAAAAAAAAAAAAAAA==",
  hash: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  algorithm: "PBKDF2-SHA-256",
  iterations: 100000,
};

const ACCOUNT_KEY = "cinebookAccounts";
const SESSION_KEY = "cinebookSession";

function readJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function getAccounts() {
  return readJSON(ACCOUNT_KEY, []);
}

function getSessionUser() {
  try {
    const value = sessionStorage.getItem(SESSION_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

function bytesToBase64(bytes) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function hashPassword(password, salt) {
  if (!window.crypto?.subtle) {
    throw new Error("Secure password hashing is not available in this browser.");
  }

  const encoder = new TextEncoder();
  const key = await window.crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const bits = await window.crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    key,
    256,
  );

  return new Uint8Array(bits);
}

async function createPasswordRecord(password) {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const hash = await hashPassword(password, salt);

  return {
    salt: bytesToBase64(salt),
    hash: bytesToBase64(hash),
    algorithm: "PBKDF2-SHA-256",
    iterations: 100000,
  };
}

async function verifyPassword(password, record) {
  try {
    if (
      !record?.salt ||
      !record?.hash ||
      record.algorithm !== "PBKDF2-SHA-256" ||
      record.iterations !== 100000
    ) {
      return false;
    }

    const salt = base64ToBytes(record.salt);
    const expected = base64ToBytes(record.hash);
    const actual = await hashPassword(password, salt);

    if (actual.length !== expected.length) return false;

    let difference = 0;
    for (let i = 0; i < actual.length; i += 1) {
      difference |= actual[i] ^ expected[i];
    }

    return difference === 0;
  } catch {
    return false;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getSessionUser);

  const login = useCallback(async (userData) => {
    const email = normalizeEmail(userData.email);
    const accounts = getAccounts();
    const account = accounts.find((item) => item.email === email);

    // Run the same work whether or not the account exists, so response time
    // and message do not reveal which emails are registered.
    const passwordMatches = account
      ? await verifyPassword(userData.password, account.password)
      : await verifyPassword(userData.password, DUMMY_RECORD);

    if (!account) {
      return {
        success: false,
        field: "password",
        error: "Incorrect email or password. Please try again.",
      };
    }

    // One-time migration for accounts created by the older project version,
    // which stored passwords as plaintext. Successful legacy login upgrades it
    // to a salted PBKDF2 hash immediately.
    let verified = passwordMatches;
    if (!verified && typeof account.password === "string") {
      verified = account.password === userData.password;

      if (verified) {
        account.password = await createPasswordRecord(userData.password);
        const migratedAccounts = accounts.map((item) =>
          item.email === email ? account : item,
        );
        localStorage.setItem(ACCOUNT_KEY, JSON.stringify(migratedAccounts));
      }
    }

    if (!verified) {
      return {
        success: false,
        field: "password",
        error: "Incorrect email or password. Please try again.",
      };
    }

    const loggedInUser = {
      name: account.name,
      email: account.email,
      phone: account.phone || "",
    };

    sessionStorage.setItem(SESSION_KEY, JSON.stringify(loggedInUser));
    setUser(loggedInUser);

    return { success: true };
  }, []);

  const signup = useCallback(async (userData) => {
    const accounts = getAccounts();
    const email = normalizeEmail(userData.email);

    if (accounts.some((item) => item.email === email)) {
      return {
        success: false,
        error: "An account with this email already exists.",
      };
    }

    try {
      const password = await createPasswordRecord(userData.password);

      const account = {
        name: sanitizeName(userData.name),
        email,
        phone: sanitizePhone(userData.phone),
        password,
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem(ACCOUNT_KEY, JSON.stringify([...accounts, account]));

      return { success: true };
    } catch {
      return {
        success: false,
        error: "Unable to create the account securely in this browser.",
      };
    }
  }, []);

  const updateProfile = useCallback(
    (profileData) => {
      if (!user) {
        return { success: false, error: "You must be logged in." };
      }

      const accounts = getAccounts();
      const updatedAccount = accounts.find((item) => item.email === user.email);

      if (!updatedAccount) {
        return { success: false, error: "Account could not be found." };
      }

      const updatedUser = {
        name: sanitizeName(profileData.name),
        email: user.email,
        phone: sanitizePhone(profileData.phone),
      };

      const updatedAccounts = accounts.map((item) =>
        item.email === user.email
          ? { ...updatedAccount, ...updatedUser }
          : item,
      );

      localStorage.setItem(ACCOUNT_KEY, JSON.stringify(updatedAccounts));
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);

      return { success: true };
    },
    [user],
  );

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem(SESSION_KEY);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      signup,
      updateProfile,
      logout,
    }),
    [user, login, signup, updateProfile, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
