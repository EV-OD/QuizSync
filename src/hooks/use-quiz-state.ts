"use client";

import { useSyncExternalStore } from 'react';
import { store } from '@/lib/quiz-store';

export const useQuizState = () => {
    const state = useSyncExternalStore(store.subscribe, store.getState, store.getState);
    return state;
};
