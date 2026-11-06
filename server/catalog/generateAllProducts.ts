import fs from 'fs';
import path from 'path';
import { Product } from '../types';
import { CATEGORIES, SUB_CATEGORIES } from './categories';
import { BRANDS } from './brands';
import { auditProductCatalog } from './duplicateDetector';

// Realistic brands mapped to categories
const CATEGORY_BRAND_MAP: Record<string, string[]> = {
  'cat-electronics': ['brand-sony', 'brand-bose', 'brand-jbl', 'brand-boat', 'brand-apple', 'brand-oneplus'],
  'cat-mobiles': ['brand-apple', 'brand-samsung', 'brand-oneplus', 'brand-nothing', 'brand-xiaomi', 'brand-realme'],
  'cat-computers': ['brand-apple', 'brand-dell', 'brand-hp', 'brand-lenovo', 'brand-asus', 'brand-acer'],
  'cat-computer-acc': ['brand-logitech', 'brand-asus', 'brand-dell', 'brand-anker', 'brand-tp-link'],
  'cat-smart-acc': ['brand-apple', 'brand-samsung', 'brand-amazfit', 'brand-boat', 'brand-fastrack'],
  'cat-mens-fashion': ['brand-levis', 'brand-nike', 'brand-adidas', 'brand-puma'],
  'cat-womens-fashion': ['brand-puma', 'brand-nike', 'brand-adidas', 'brand-levis'],
  'cat-kids-fashion': ['brand-adidas', 'brand-nike', 'brand-puma', 'brand-levis'],
  'cat-footwear': ['brand-nike', 'brand-adidas', 'brand-puma'],
  'cat-home-living': ['brand-philips', 'brand-panasonic', 'brand-dyson'],
  'cat-home-appliances': ['brand-dyson', 'brand-philips', 'brand-panasonic'],
  'cat-kitchen': ['brand-breville', 'brand-philips', 'brand-prestige', 'brand-panasonic'],
  'cat-furniture-decor': ['brand-philips', 'brand-panasonic'],
  'cat-beauty': ['brand-loreal', 'brand-nivea', 'brand-philips', 'brand-dyson'],
  'cat-sports': ['brand-nike', 'brand-adidas', 'brand-puma'],
  'cat-health': ['brand-philips', 'brand-panasonic', 'brand-amazfit'],
  'cat-grocery': ['brand-breville', 'brand-prestige'],
  'cat-toys': ['brand-sony', 'brand-logitech', 'brand-panasonic'],
  'cat-books': ['brand-canon', 'brand-logitech'],
  'cat-automotive': ['brand-anker', 'brand-tp-link', 'brand-philips'],
  'cat-travel': ['brand-american-tourister', 'brand-safari', 'brand-nike', 'brand-puma'],
  'cat-jewelry': ['brand-fossil', 'brand-casio', 'brand-titan', 'brand-fastrack'],
  'cat-pets': ['brand-philips', 'brand-panasonic'],
  'cat-gaming': ['brand-sony', 'brand-asus', 'brand-acer', 'brand-logitech'],
};

// Generates slug from title
function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

console.log('Category brand map initialized with', Object.keys(CATEGORY_BRAND_MAP).length, 'categories');
