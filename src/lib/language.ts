type Language = 'en' | 'pt-BR';

export function getLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  return (localStorage.getItem('language') as Language) || 'en';
}

export function setLanguage(language: Language) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('language', language);
  document.documentElement.lang = language === 'pt-BR' ? 'pt-BR' : 'en';
  try {
    window.dispatchEvent(new CustomEvent('app:language-changed', { detail: { language } }))
  } catch (e) {
    // ignore
  }
}