'use client';

import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X, Loader2, Users } from 'lucide-react';
import * as XLSX from 'xlsx';
import { cn } from '@/lib/utils/cn';

interface UserRow {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface PreviewUser {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  valid: boolean;
  error?: string;
}

export function BulkInviteForm() {
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const t = useTranslations('BulkInvite');

  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewUser[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [results, setResults] = useState<{ created: number; failed: number; errors: string[] } | null>(null);

  const validateRow = (row: UserRow, index: number): PreviewUser => {
    const errors: string[] = [];

    if (!row.firstName?.trim()) errors.push('Missing firstName');
    if (!row.lastName?.trim()) errors.push('Missing lastName');
    if (!row.email?.trim()) errors.push('Missing email');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) errors.push('Invalid email');

    const validRoles = [
      'president', 'admin_general', 'chef_pole', 'mentor_senior',
      'mentor', 'chef_equipe', 'membre_equipe', 'membre'
    ];
    if (!validRoles.includes(row.role?.toLowerCase())) {
      errors.push(`Invalid role: ${row.role}`);
    }

    return {
      firstName: row.firstName || '',
      lastName: row.lastName || '',
      email: row.email || '',
      role: row.role?.toLowerCase() || '',
      valid: errors.length === 0,
      error: errors.length > 0 ? errors.join(', ') : undefined,
    };
  };

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setFile(file);
    setPreview([]);
    setResults(null);
    setSuccess(false);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<UserRow>(worksheet);

      if (jsonData.length === 0) {
        setError('The file is empty');
        return;
      }

      if (jsonData.length > 100) {
        setError('Maximum 100 users per file');
        return;
      }

      const validated = jsonData.map((row, i) => validateRow(row, i));
      setPreview(validated);
    } catch (err) {
      setError('Failed to read file. Make sure it\'s a valid Excel file.');
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv',
      ];
      const validExtensions = ['.xlsx', '.xls', '.csv'];

      const hasValidType = validTypes.includes(droppedFile.type);
      const hasValidExt = validExtensions.some(ext => droppedFile.name.endsWith(ext));

      if (!hasValidType && !hasValidExt) {
        setError('Please upload an Excel file (.xlsx, .xls) or CSV');
        return;
      }

      handleFile(droppedFile);
    }
  }, [handleFile]);

  const handleSubmit = async () => {
    if (preview.length === 0) return;

    setIsProcessing(true);
    setError(null);

    const validUsers = preview.filter(u => u.valid);
    const invalidCount = preview.length - validUsers.length;

    try {
      const response = await fetch('/api/admin/bulk-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users: validUsers }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create accounts');
      }

      setResults({
        created: data.created,
        failed: data.failed,
        errors: data.errors || [],
      });

      if (data.created > 0) {
        setSuccess(true);
      }

      if (invalidCount > 0) {
        setError(`${invalidCount} users were skipped due to invalid data`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreview([]);
    setResults(null);
    setSuccess(false);
    setError(null);
  };

  // Success view
  if (success && results) {
    return (
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
        <div className="text-center py-8">
          <div className="w-20 h-20 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-brand-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">{t('completed')}</h3>
          <p className="text-white/60 mb-6">
            {t('accountsCreated', { count: results.created })}
          </p>

          {results.errors.length > 0 && (
            <div className="text-left p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-6">
              <p className="text-amber-400 font-medium mb-2">{t('failedAccounts')}</p>
              <ul className="text-sm text-white/60 space-y-1">
                {results.errors.slice(0, 5).map((err, i) => (
                  <li key={i}>• {err}</li>
                ))}
                {results.errors.length > 5 && (
                  <li>• ...and {results.errors.length - 5} more</li>
                )}
              </ul>
            </div>
          )}

          <button
            onClick={resetForm}
            className="px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-all"
          >
            {t('uploadMore')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        className={cn(
          'relative p-8 rounded-2xl border-2 border-dashed transition-all text-center',
          isDragging
            ? 'border-blue-400 bg-blue-500/10'
            : 'border-white/20 bg-white/5 hover:border-white/30'
        )}
      >
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <Upload className={cn(
          'w-12 h-12 mx-auto mb-4 transition-colors',
          isDragging ? 'text-brand-400' : 'text-white/30'
        )} />
        <p className="text-white font-medium mb-2">{t('dropTitle')}</p>
        <p className="text-white/50 text-sm">{t('dropSubtitle')}</p>
        <p className="text-white/30 text-xs mt-4">
          {t('format')}: firstName, lastName, email, role
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center gap-3 text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* File Info */}
      {file && !success && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="p-2 rounded-lg bg-green-500/20">
            <FileSpreadsheet className="w-5 h-5 text-green-400" />
          </div>
          <div className="flex-1">
            <p className="text-white font-medium">{file.name}</p>
            <p className="text-white/50 text-sm">{preview.length} users found</p>
          </div>
          <button
            onClick={resetForm}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>
      )}

      {/* Preview Table */}
      {preview.length > 0 && (
        <div className="rounded-xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto max-h-80">
            <table className="w-full text-sm">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left p-3 text-white/60 font-medium">#</th>
                  <th className="text-left p-3 text-white/60 font-medium">{t('firstName')}</th>
                  <th className="text-left p-3 text-white/60 font-medium">{t('lastName')}</th>
                  <th className="text-left p-3 text-white/60 font-medium">{t('email')}</th>
                  <th className="text-left p-3 text-white/60 font-medium">{t('role')}</th>
                  <th className="text-left p-3 text-white/60 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {preview.slice(0, 20).map((user, i) => (
                  <tr key={i} className={cn(
                    'hover:bg-white/5',
                    !user.valid && 'bg-red-500/5'
                  )}>
                    <td className="p-3 text-white/40">{i + 1}</td>
                    <td className="p-3 text-white">{user.firstName}</td>
                    <td className="p-3 text-white">{user.lastName}</td>
                    <td className="p-3 text-white/70">{user.email}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 rounded-lg bg-white/10 text-white/70 text-xs">
                        {user.role}
                      </span>
                    </td>
                    <td className="p-3">
                      {user.valid ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <div className="flex items-center gap-1 text-red-400">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-xs">{user.error}</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {preview.length > 20 && (
            <p className="p-3 text-center text-white/40 text-sm border-t border-white/10">
              {t('showing20', { total: preview.length })}
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      {preview.length > 0 && preview.some(u => u.valid) && (
        <div className="flex gap-3">
          <button
            onClick={resetForm}
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 text-white font-medium hover:bg-white/10 transition-all"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isProcessing}
            className="flex-1 px-4 py-3 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t('processing')}
              </>
            ) : (
              <>
                <Users className="w-5 h-5" />
                {t('createAccounts', { count: preview.filter(u => u.valid).length })}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
