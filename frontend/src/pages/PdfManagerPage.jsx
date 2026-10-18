import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  FileText, Upload, CheckCircle2, AlertTriangle, Database,
  Sparkles, Edit3
} from 'lucide-react';

export default function PdfManagerPage() {
  const [uploads, setUploads] = useState([]);
  const [activeUpload, setActiveUpload] = useState(null);
  const [editableRecords, setEditableRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [message, setMessage] = useState('');

  const loadUploads = async () => {
    try {
      const res = await api.listPdfUploads();
      const list = res.uploads || [];
      setUploads(list);
      if (list.length > 0 && !activeUpload) {
        const detail = await api.getPdfDetail(list[0].id);
        setActiveUpload(detail);
        setEditableRecords(detail.records || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadUploads();
  }, []);

  const handleLoadSamplePdf = async () => {
    setLoading(true);
    setMessage('');
    try {
      const data = await api.loadCapstonePdfSample();
      setActiveUpload({
        id: data.uploadId,
        filename: data.filename,
        status: data.status,
        validRecordsCount: data.validRecordsCount,
        invalidRecordsCount: data.invalidRecordsCount,
        textPreview: data.textPreview,
      });
      setEditableRecords(data.records || []);
      setMessage('Successfully parsed ProjectCapstone PDF Dataset using 9-step validation pipeline! Review records below before approving.');
      loadUploads();
    } catch (err) {
      alert('Failed to parse sample PDF dataset: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setMessage('');
    try {
      const data = await api.uploadPdf(file, 'User Uploaded Tourism PDF');
      setActiveUpload({
        id: data.uploadId,
        filename: data.filename,
        status: data.status,
        validRecordsCount: data.validRecordsCount,
        invalidRecordsCount: data.invalidRecordsCount,
        textPreview: data.textPreview,
      });
      setEditableRecords(data.records || []);
      setMessage(`Uploaded & parsed ${file.name}. Review validation flags before approving into SQLite DB.`);
      loadUploads();
    } catch (err) {
      alert('PDF upload failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordChange = (idx, field, val) => {
    const updated = [...editableRecords];
    updated[idx] = { ...updated[idx], [field]: val };
    setEditableRecords(updated);
  };

  const handleRevalidate = async () => {
    if (!activeUpload?.id) return;
    setLoading(true);
    try {
      const res = await api.updatePdfRecords(activeUpload.id, editableRecords);
      setEditableRecords(res.records || []);
      setActiveUpload((prev) => ({
        ...prev,
        validRecordsCount: res.validRecordsCount,
        invalidRecordsCount: res.invalidRecordsCount,
      }));
      setMessage('Re-validated edited records!');
    } catch (err) {
      alert('Re-validation failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRecords = async () => {
    if (!activeUpload?.id) return;
    setApproving(true);
    setMessage('');
    try {
      await api.updatePdfRecords(activeUpload.id, editableRecords);
      const res = await api.approvePdfUpload(activeUpload.id);
      setMessage(res.message);
      setActiveUpload((prev) => ({ ...prev, status: res.status }));
      loadUploads();
    } catch (err) {
      alert('Approval failed: ' + err.message);
    } finally {
      setApproving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 space-y-8">
      {/* Header */}
      <div className="st-page-hero bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold mb-2">
          <FileText className="w-3.5 h-3.5" />
          9-Step PDF Tourism Dataset Extraction, Validation & Approval Pipeline
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold">
          PDF Dataset Ingestion & Human-in-the-Loop Verification
        </h1>
        <p className="text-slate-300 text-sm mt-1 max-w-3xl">
          Extracts structured Indian tourism records from PDF files (`pypdf`), validates coordinates/fees/hours, highlights anomalies, and requires explicit Admin approval before database insertion.
        </p>
      </div>

      {/* 9-Step Pipeline Banner */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        <div className="text-xs font-extrabold uppercase tracking-wider text-teal-700 mb-3">
          9-Step SafeTrip AI PDF Data Governance Workflow
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2 text-[11px]">
          {[
            '1. Upload PDF',
            '2. pypdf Extract',
            '3. Regex/Table Parse',
            '4. Clean Fields',
            '5. Bounds & Fee Check',
            '6. Preview Table',
            '7. Inline Edit/Fix',
            '8. Admin Approve',
            '9. DB Commit',
          ].map((step, i) => (
            <div key={i} className="p-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-700 text-center">
              {step}
            </div>
          ))}
        </div>
      </div>

      {/* Upload & Sample Action Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow cursor-pointer transition">
            <Upload className="w-4 h-4" />
            <span>{loading ? 'Processing PDF...' : 'Upload Custom Tourism PDF'}</span>
            <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={handleLoadSamplePdf}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow cursor-pointer transition"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            Parse ProjectCapstone PDF Dataset (SafeTrip_AI_Indian_Tourism_Safety_Dataset.pdf)
          </button>
        </div>

        {activeUpload && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleRevalidate}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer"
            >
              Re-Validate Edits
            </button>
            <button
              onClick={handleApproveRecords}
              disabled={approving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow cursor-pointer transition"
            >
              <Database className="w-4 h-4" />
              {approving ? 'Committing to SQLite...' : 'Step 8-9: Approve & Commit Valid Records to DB'}
            </button>
          </div>
        )}
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Extracted Records Preview & Inline Editor */}
      {activeUpload && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Extracted Records Preview: {activeUpload.filename}
              </h2>
              <p className="text-xs text-slate-500">
                Status: <strong className="uppercase text-teal-700">{activeUpload.status}</strong> • Total Extracted: <strong>{editableRecords.length}</strong> • Valid: <strong className="text-emerald-600">{activeUpload.validRecordsCount}</strong>
              </p>
            </div>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Edit3 className="w-3.5 h-3.5" /> Click any cell below to edit before approval
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                  <th className="p-2.5">Place Name</th>
                  <th className="p-2.5">State</th>
                  <th className="p-2.5">District / City</th>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5">Lat / Lon</th>
                  <th className="p-2.5">Entry Fee (₹)</th>
                  <th className="p-2.5">Safety Score</th>
                  <th className="p-2.5">Validation Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {editableRecords.map((rec, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-2">
                      <input
                        type="text"
                        value={rec.name || ''}
                        onChange={(e) => handleRecordChange(idx, 'name', e.target.value)}
                        className="w-40 px-2 py-1 rounded border border-slate-200 font-semibold text-slate-900"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={rec.state || ''}
                        onChange={(e) => handleRecordChange(idx, 'state', e.target.value)}
                        className="w-28 px-2 py-1 rounded border border-slate-200"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={rec.district || rec.city || ''}
                        onChange={(e) => handleRecordChange(idx, 'district', e.target.value)}
                        className="w-28 px-2 py-1 rounded border border-slate-200"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={rec.category || ''}
                        onChange={(e) => handleRecordChange(idx, 'category', e.target.value)}
                        className="w-24 px-2 py-1 rounded border border-slate-200"
                      />
                    </td>
                    <td className="p-2 font-mono text-[11px] text-slate-600">
                      {rec.latitude}, {rec.longitude}
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={rec.entry_fee ?? 0}
                        onChange={(e) => handleRecordChange(idx, 'entry_fee', Number(e.target.value))}
                        className="w-16 px-2 py-1 rounded border border-slate-200"
                      />
                    </td>
                    <td className="p-2 font-bold text-emerald-700">{rec.safety_score || 82}/100</td>
                    <td className="p-2">
                      {rec.is_valid !== false ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Valid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                          <AlertTriangle className="w-3 h-3" /> Check Bounds
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
