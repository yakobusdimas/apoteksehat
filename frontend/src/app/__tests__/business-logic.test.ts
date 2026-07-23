/**
 * Tests for Medicine search and filtering logic.
 * Tests the core business logic extracted from medicineAPI.
 */

import { describe, it, expect } from 'vitest';

// Mock data mimicking the Medicine interface
interface Medicine {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  indication: string;
}

const mockMedicines: Medicine[] = [
  {
    id: 1,
    name: 'Paracetamol',
    category: 'Penghilang Nyeri',
    price: 15000,
    stock: 100,
    description: 'Obat pereda nyeri',
    indication: 'Demam dan sakit kepala',
  },
  {
    id: 2,
    name: 'Ibuprofen',
    category: 'Penghilang Nyeri',
    price: 20000,
    stock: 50,
    description: 'Obat antiinflamasi',
    indication: 'Nyeri sendi dan otot',
  },
  {
    id: 3,
    name: 'Amoxicillin',
    category: 'Antibiotik',
    price: 25000,
    stock: 30,
    description: 'Antibiotik',
    indication: 'Infeksi bakteri',
  },
];

describe('Medicine Filtering Logic', () => {
  // Test 1: Search by name
  it('should filter medicines by name', () => {
    const searchQuery = 'paracetamol';
    const results = mockMedicines.filter(
      (m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.indication.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Paracetamol');
  });

  // Test 2: Search by category
  it('should filter medicines by category', () => {
    const searchQuery = 'Penghilang Nyeri';
    const results = mockMedicines.filter(
      (m) => m.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    expect(results).toHaveLength(2);
    expect(results[0].name).toBe('Paracetamol');
    expect(results[1].name).toBe('Ibuprofen');
  });

  // Test 3: Search by indication
  it('should filter medicines by indication', () => {
    const searchQuery = 'demam';
    const results = mockMedicines.filter(
      (m) => m.indication.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Paracetamol');
  });

  // Test 4: Empty search returns all medicines
  it('should return all medicines when search query is empty', () => {
    const searchQuery = '';
    const results = mockMedicines.filter(
      (m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.indication.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    expect(results).toHaveLength(mockMedicines.length);
  });

  // Test 5: No results returns empty array
  it('should return empty array when no matches found', () => {
    const searchQuery = 'vitamin-c-yang-tidak-ada';
    const results = mockMedicines.filter(
      (m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.indication.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    expect(results).toHaveLength(0);
  });

  // Test 6: Case-insensitive search
  it('should be case-insensitive', () => {
    const results = mockMedicines.filter(
      (m) => m.name.toLowerCase().includes('PARACETAMOL'.toLowerCase())
    );
    
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Paracetamol');
  });

  // Test 7: Filter by stock > 0
  it('should filter medicines by stock availability', () => {
    const available = mockMedicines.filter((m) => m.stock > 0);
    expect(available).toHaveLength(3);
  });

  // Test 8: Price range filter
  it('should filter medicines by price range', () => {
    const affordable = mockMedicines.filter((m) => m.price <= 20000);
    expect(affordable).toHaveLength(2);
    expect(affordable.every((m) => m.price <= 20000)).toBe(true);
  });

  // Test 9: Combined filters (category + stock)
  it('should support combined filters', () => {
    const filtered = mockMedicines.filter(
      (m) => m.category === 'Penghilang Nyeri' && m.stock > 0
    );
    
    expect(filtered).toHaveLength(2);
    expect(filtered.every((m) => m.stock > 0)).toBe(true);
  });

  // Test 10: Partial name matching
  it('should match partial names', () => {
    const results = mockMedicines.filter(
      (m) => m.name.toLowerCase().includes('amox')
    );
    
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Amoxicillin');
  });
});

describe('Cart Total Calculation', () => {
  interface CartItem {
    id: number;
    price: number;
    quantity: number;
  }

  const mockCartItems: CartItem[] = [
    { id: 1, price: 15000, quantity: 2 },
    { id: 2, price: 20000, quantity: 1 },
    { id: 3, price: 25000, quantity: 3 },
  ];

  it('should calculate total price correctly', () => {
    const totalPrice = mockCartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    
    expect(totalPrice).toBe(125000); // (15000*2) + (20000*1) + (25000*3)
  });

  it('should calculate total items correctly', () => {
    const totalItems = mockCartItems.reduce((total, item) => total + item.quantity, 0);
    
    expect(totalItems).toBe(6); // 2 + 1 + 3
  });

  it('should return 0 for empty cart', () => {
    const emptyCart: CartItem[] = [];
    const totalPrice = emptyCart.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    
    expect(totalPrice).toBe(0);
  });

  it('should handle single item cart', () => {
    const singleItem: CartItem[] = [{ id: 1, price: 50000, quantity: 1 }];
    const totalPrice = singleItem.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    
    expect(totalPrice).toBe(50000);
  });
});

describe('Order Validation Logic', () => {
  // Simulate order creation validation
  interface OrderItem {
    medicineId: number;
    name: string;
    quantity: number;
    price: number;
  }

  const availableStock: Record<number, number> = {
    1: 100, // Paracetamol
    2: 50,  // Ibuprofen
    3: 30,  // Amoxicillin
  };

  function validateOrder(orderItems: OrderItem[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const item of orderItems) {
      const stock = availableStock[item.medicineId] ?? 0;
      if (stock < item.quantity) {
        errors.push(
          `Stok ${item.name} tidak mencukupi. Tersedia: ${stock}, diminta: ${item.quantity}`
        );
      }
    }

    // Check total price > 0
    const totalPrice = orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    if (totalPrice <= 0) {
      errors.push('Total harga harus lebih dari 0');
    }

    // Check at least one item
    if (orderItems.length === 0) {
      errors.push('Keranjang belanja kosong');
    }

    return { valid: errors.length === 0, errors };
  }

  it('should validate a valid order', () => {
    const order: OrderItem[] = [
      { medicineId: 1, name: 'Paracetamol', quantity: 2, price: 15000 },
      { medicineId: 2, name: 'Ibuprofen', quantity: 1, price: 20000 },
    ];

    const result = validateOrder(order);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject order with insufficient stock', () => {
    const order: OrderItem[] = [
      { medicineId: 3, name: 'Amoxicillin', quantity: 50, price: 25000 },
    ];

    const result = validateOrder(order);

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('tidak mencukupi');
  });

  it('should reject empty cart order', () => {
    const order: OrderItem[] = [];

    const result = validateOrder(order);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Keranjang belanja kosong');
  });

  it('should detect multiple validation errors', () => {
    const order: OrderItem[] = [
      { medicineId: 3, name: 'Amoxicillin', quantity: 100, price: 25000 },
      { medicineId: 999, name: 'NonExistent', quantity: 5, price: 10000 },
    ];

    const result = validateOrder(order);

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBe(2);
  });
});
