import { Word, CustomWordBook } from '../types';

const STORAGE_KEY = 'lexiverse_custom_wordbooks';

/**
 * 获取所有自建/导入的词库
 */
export function getCustomWordBooks(): CustomWordBook[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CustomWordBook[];
  } catch (e) {
    console.error('Failed to parse custom wordbooks', e);
    return [];
  }
}

/**
 * 保存或更新一个自建词库
 */
export function saveCustomWordBook(book: CustomWordBook): void {
  const books = getCustomWordBooks();
  const index = books.findIndex((b) => b.id === book.id);
  if (index >= 0) {
    books[index] = book;
  } else {
    books.push(book);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  window.dispatchEvent(new Event('lexiverse_custom_books_updated'));
}

/**
 * 删除指定自建词库
 */
export function deleteCustomWordBook(bookId: string): void {
  const books = getCustomWordBooks().filter((b) => b.id !== bookId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  window.dispatchEvent(new Event('lexiverse_custom_books_updated'));
}

/**
 * 从 JSON 文本解析导入为自建词库
 */
export function importCustomWordBookFromJSON(name: string, jsonString: string, description?: string): CustomWordBook {
  const parsed = JSON.parse(jsonString);
  if (!Array.isArray(parsed)) {
    throw new Error('导入数据必须是 JSON 数组');
  }

  const words: Word[] = parsed.map((item: any, idx: number) => {
    if (!item.word || !item.translation) {
      throw new Error(`第 ${idx + 1} 个单词格式不完整，必须包含 word 和 translation`);
    }
    return {
      id: item.id || `custom-${Date.now()}-${idx}`,
      word: String(item.word).trim(),
      phonetic: item.phonetic ? String(item.phonetic).trim() : '',
      definition: item.definition ? String(item.definition).trim() : item.translation,
      translation: String(item.translation).trim(),
      example: item.example ? String(item.example).trim() : '',
      exampleTranslation: item.exampleTranslation ? String(item.exampleTranslation).trim() : '',
      tags: Array.isArray(item.tags) ? item.tags : [name],
      difficulty: item.difficulty || 1,
    };
  });

  const newBook: CustomWordBook = {
    id: `custom_${Date.now()}`,
    name: name.trim() || '自定义导入词库',
    description: description || `导入于 ${new Date().toLocaleDateString()}`,
    icon: '📚',
    createdAt: new Date().toISOString(),
    words,
  };

  saveCustomWordBook(newBook);
  return newBook;
}
