import { atom } from "recoil";

const localStorageEffect = key => ({ setSelf, onSet }) => {
    const savedValue = localStorage.getItem(key)
    if (savedValue != null) {
        setSelf(JSON.parse(savedValue));
    }

    onSet((newValue, _, isReset) => {
        isReset
            ? localStorage.removeItem(key)
            : localStorage.setItem(key, JSON.stringify(newValue));
    });
};

export const authStateAtom = atom({
    key: "authStateAtom",
    default: {
        email: null,
        firstName: null,
        lastName: null,
        role: null,
        authenticated: false
    },
    effects: [localStorageEffect('authentication_info')]
})