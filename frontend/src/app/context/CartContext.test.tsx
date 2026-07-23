/**
 * Tests for CartContext — cart management functionality.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from './CartContext';
import type { Medicine } from './MedicinesContext';

// Mock medicine data for testing
const mockMedicine: Medicine = {
  id: 1,
  name: 'Paracetamol',
  category: 'Penghilang Nyeri',
  price: 15000,
  stock: 100,
  image: '💊',
  photo: 'https://example.com/paracetamol.jpg',
  description: 'Obat pereda nyeri',
  indication: 'Demam dan sakit kepala',
  dosage: '1-2 tablet setiap 4-6 jam',
  ingredients: ['Paracetamol 500mg'],
  benefits: ['Meredakan demam', 'Menghilangkan nyeri ringan'],
};

// Wrapper for renderHook
const wrapper = ({ children }: { children?: React.ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // Test 1: Cart initialized as empty by default
  it('should initialize with empty cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.cart).toEqual([]);
    expect(result.current.getTotalItems()).toBe(0);
    expect(result.current.getTotalPrice()).toBe(0);
  });

  // Test 2: Add single item to cart
  it('should add medicine to cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    
    act(() => {
      result.current.addToCart(mockMedicine);
    });
    
    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0]).toEqual({
      ...mockMedicine,
      quantity: 1,
    });
    expect(result.current.getTotalItems()).toBe(1);
    expect(result.current.getTotalPrice()).toBe(15000);
  });

  // Test 3: Add same medicine again should increase quantity
  it('should increase quantity when adding same medicine', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    
    act(() => {
      result.current.addToCart(mockMedicine);
      result.current.addToCart(mockMedicine);
    });
    
    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0].quantity).toBe(2);
    expect(result.current.getTotalItems()).toBe(2);
    expect(result.current.getTotalPrice()).toBe(30000);
  });

  // Test 4: Add multiple different medicines
  it('should handle multiple different medicines', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    
    const ibuprofen: Medicine = {
      ...mockMedicine,
      id: 2,
      name: 'Ibuprofen',
      price: 20000,
    };
    
    act(() => {
      result.current.addToCart(mockMedicine);
      result.current.addToCart(ibuprofen);
    });
    
    expect(result.current.cart).toHaveLength(2);
    expect(result.current.getTotalItems()).toBe(2);
    expect(result.current.getTotalPrice()).toBe(35000);
  });

  // Test 5: Remove item from cart
  it('should remove medicine from cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    
    act(() => {
      result.current.addToCart(mockMedicine);
      result.current.removeFromCart(1);
    });
    
    expect(result.current.cart).toHaveLength(0);
    expect(result.current.getTotalItems()).toBe(0);
  });

  // Test 6: Update quantity
  it('should update medicine quantity', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    
    act(() => {
      result.current.addToCart(mockMedicine);
    });
    
    act(() => {
      result.current.updateQuantity(1, 5);
    });
    
    expect(result.current.cart[0].quantity).toBe(5);
    expect(result.current.getTotalItems()).toBe(5);
    expect(result.current.getTotalPrice()).toBe(75000);
  });

  // Test 7: Update quantity to 0 should remove item
  it('should remove item when quantity updated to 0', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    
    act(() => {
      result.current.addToCart(mockMedicine);
      result.current.updateQuantity(1, 0);
    });
    
    expect(result.current.cart).toHaveLength(0);
  });

  // Test 8: Clear cart
  it('should clear all items from cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    
    const ibuprofen: Medicine = {
      ...mockMedicine,
      id: 2,
      name: 'Ibuprofen',
      price: 20000,
    };
    
    act(() => {
      result.current.addToCart(mockMedicine);
      result.current.addToCart(ibuprofen);
    });
    
    act(() => {
      result.current.clearCart();
    });
    
    expect(result.current.cart).toHaveLength(0);
    expect(result.current.getTotalItems()).toBe(0);
    expect(result.current.getTotalPrice()).toBe(0);
  });

  // Test 9: localStorage persistence
  it('should persist cart to localStorage', () => {
    // Clear localStorage first
    localStorage.clear();
    
    const { result } = renderHook(() => useCart(), { wrapper });
    
    act(() => {
      result.current.addToCart(mockMedicine);
    });
    
    // Check localStorage was updated
    const stored = localStorage.getItem('apotek_cart');
    expect(stored).toBeDefined();
    const parsed = JSON.parse(stored!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].id).toBe(1);
  });

  // Test 10: Load cart from localStorage on init
  it('should load cart from localStorage on initialization', () => {
    // Pre-populate localStorage
    localStorage.clear();
    const savedCart = JSON.stringify([
      { ...mockMedicine, quantity: 3 },
    ]);
    localStorage.setItem('apotek_cart', savedCart);
    
    const { result } = renderHook(() => useCart(), { wrapper });
    
    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0].quantity).toBe(3);
  });
});
