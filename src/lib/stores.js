import { writable } from 'svelte/store';

// 모바일 메뉴 상태를 전역으로 관리합니다.
export const isMenuOpen = writable(false);
