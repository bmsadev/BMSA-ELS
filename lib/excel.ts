import * as XLSX from 'xlsx';
import { Member } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export interface ParseResult {
  members: Member[];
  errors: string[];
  totalRows: number;
}

export function parseExcelBuffer(buffer: Buffer): ParseResult {
  const errors: string[] = [];
  const members: Member[] = [];

  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      return { members: [], errors: ['No sheets found in the Excel file'], totalRows: 0 };
    }

    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

    if (jsonData.length === 0) {
      return { members: [], errors: ['The Excel file is empty'], totalRows: 0 };
    }

    // Validate headers — only name and email are required
    const firstRow = jsonData[0];
    const headers = Object.keys(firstRow).map(h => h.toLowerCase().trim());
    const requiredHeaders = ['name', 'email'];
    const optionalHeaders = ['committee', 'role', 'status'];
    const allHeaders = [...requiredHeaders, ...optionalHeaders];
    const missingRequired = requiredHeaders.filter(h => !headers.includes(h));

    if (missingRequired.length > 0) {
      return {
        members: [],
        errors: [`Missing required columns: ${missingRequired.join(', ')}. Expected at minimum: Name, Email`],
        totalRows: jsonData.length,
      };
    }

    // Map column names (case-insensitive)
    const columnMap: Record<string, string> = {};
    Object.keys(firstRow).forEach(key => {
      const lower = key.toLowerCase().trim();
      if (allHeaders.includes(lower)) {
        columnMap[lower] = key;
      }
    });

    jsonData.forEach((row, index) => {
      const name = String(row[columnMap['name']] || '').trim();
      const email = String(row[columnMap['email']] || '').trim();
      const committee = columnMap['committee'] ? String(row[columnMap['committee']] || '').trim() : '';
      const role = columnMap['role'] ? String(row[columnMap['role']] || '').trim() : '';
      const status = columnMap['status'] ? String(row[columnMap['status']] || '').trim() : 'Active';

      if (!name || !email) {
        errors.push(`Row ${index + 2}: Missing name or email`);
        return;
      }

      // Basic email validation
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push(`Row ${index + 2}: Invalid email "${email}"`);
        return;
      }

      const normalizedStatus = status.toLowerCase() === 'inactive' ? 'Inactive' : 'Active';

      members.push({
        id: uuidv4(),
        name,
        email: email.toLowerCase(),
        committee: committee.toUpperCase(),
        role,
        status: normalizedStatus as 'Active' | 'Inactive',
      });
    });

    return { members, errors, totalRows: jsonData.length };
  } catch (error: any) {
    return {
      members: [],
      errors: [`Failed to parse Excel file: ${error.message}`],
      totalRows: 0,
    };
  }
}
