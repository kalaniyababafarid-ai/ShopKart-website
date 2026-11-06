import fs from 'fs';
import path from 'path';
import { Product } from '../types';
import { CATEGORIES, SUB_CATEGORIES } from './categories';
import { BRANDS } from './brands';
import { auditProductCatalog } from './duplicateDetector';

// Helper to create slug
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

console.log('Building 528+ unique professional catalog items...');
