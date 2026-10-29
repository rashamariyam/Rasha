import { useEffect, useState, useMemo } from 'react';
import {
  X,
  Download,
  ExternalLink,
  FileText,
  ZoomIn,
  ZoomOut,
  FileCheck,
  ShieldCheck,
  Paperclip,
} from 'lucide-react';
import {
  dataUrlToBlob,
  downloadDocument,
  openDocumentInNewTab,
  getDocumentUrl,
  getVerifiedDocumentUrl,
  type ResolvedDocument,
} from '@/lib/documentUtils';

export interface DocumentViewerModalProps {
  open: boolean;
  onClose: () => void;
  documentName?: string;
  documentUrl?: string;
  documentType?: string;
  studentName?: string;
  rollNo?: string;
  department?: string;
  leaveType?: string;
  reason?: string;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  status?: string;
  teacherApproved?: boolean;
  hodApproved?: boolean;
  decidedBy?: string;
  decidedAt?: string;
  decisionNote?: string;
  initialMode?: 'attachment' | 'verified';
}

export function DocumentViewerModal({
  open,
  onClose,
  documentName,
  documentUrl,
  documentType,
  studentName,
  rollNo,
  department,
  leaveType,
  reason,
  startDate,
  endDate,
  createdAt,
  status,
  decidedBy,
  decidedAt,
  decisionNote,
  initialMode = 'attachment',
}: DocumentViewerModalProps) {
  const isApproved = status === 'approved';
  const [activeTab, setActiveTab] = useState<'attachment' | 'verified'>('attachment');
  const [zoom, setZoom] = useState(100);

  // Set initial tab on open
  useEffect(() => {
    if (open) {
      if (initialMode === 'verified' && isApproved) {
        setActiveTab('verified');
      } else {
        setActiveTab('attachment');
      }
      setZoom(100);
    }
  }, [open, initialMode, isApproved, documentName]);

  // Keyboard shortcut ESC to close
  useEffect(() => {
    if (open) {
      const handler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handler);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handler);
        document.body.style.overflow = '';
      };
    }
  }, [open, onClose]);

  const resolved: ResolvedDocument | null = useMemo(() => {
    if (!open) return null;

    if (activeTab === 'verified' && isApproved) {
      return getVerifiedDocumentUrl({
        documentName,
        studentName,
        rollNo,
        department,
        leaveType,
        reason,
        startDate,
        endDate,
        decidedBy,
        decidedAt,
        decisionNote,
      });
    }

    return getDocumentUrl({
      documentName,
      documentUrl,
      documentType,
      studentName,
      rollNo,
      department,
      leaveType,
      reason,
      startDate,
      endDate,
      createdAt,
    });
  }, [
    open,
    activeTab,
    isApproved,
    documentName,
    documentUrl,
    documentType,
    studentName,
    rollNo,
    department,
    leaveType,
    reason,
    startDate,
    endDate,
    createdAt,
    decidedBy,
    decidedAt,
    decisionNote,
  ]);

  // Generate safe blob URL for PDFs
  const blobUrl = useMemo(() => {
    if (!resolved) return null;
    if (resolved.mimeType === 'application/pdf' && resolved.url.startsWith('data:')) {
      try {
        const blob = dataUrlToBlob(resolved.url);
        return URL.createObjectURL(blob);
      } catch (err) {
        console.warn('Failed to create blob URL:', err);
        return null;
      }
    }
    return null;
  }, [resolved]);

  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  if (!open || !resolved) return null;

  const isPdf = resolved.mimeType === 'application/pdf';
  const isImage = resolved.mimeType.startsWith('image/');

  const handleDownload = () => {
    downloadDocument(resolved.url, resolved.name);
  };

  const handleOpenExternal = () => {
    openDocumentInNewTab(blobUrl || resolved.url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-navy-950/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 flex flex-col w-full max-w-4xl max-h-[92vh] rounded-2xl bg-white shadow-2xl overflow-hidden border border-gray-200 animate-slide-up">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50/90 px-4 sm:px-6 py-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                activeTab === 'verified'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-navy-100 text-navy-800'
              }`}
            >
              {activeTab === 'verified' ? <ShieldCheck size={22} /> : <FileText size={20} />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-semibold text-navy-900 truncate">
                  {resolved.name}
                </h3>
                <span
                  className={`shrink-0 inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold border ${
                    activeTab === 'verified'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : isApproved
                      ? 'bg-navy-50 text-navy-700 border-navy-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {activeTab === 'verified'
                    ? 'Verified Certificate'
                    : isApproved
                    ? 'Student File (Approved)'
                    : 'Student File (Pending Review)'}
                </span>
              </div>
              <p className="text-xs text-gray-500 truncate">
                {studentName ? `${studentName} · ` : ''}
                {leaveType ? `${leaveType}` : 'Supporting Document'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handleOpenExternal}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 hover:text-navy-900 transition"
              title="Open in new tab"
            >
              <ExternalLink size={14} />
              <span className="hidden sm:inline">Open in Tab</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1 rounded-lg bg-navy-800 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-white hover:bg-navy-900 shadow-xs transition"
              title="Download file"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Download</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Selection Bar (Active ONLY after approval) */}
        {isApproved && (
          <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-100/60 px-4 sm:px-6 py-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab('attachment');
                setZoom(100);
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === 'attachment'
                  ? 'bg-white text-navy-900 shadow-xs border border-gray-200'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Paperclip size={14} />
              Student Attached File
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('verified');
                setZoom(100);
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === 'verified'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <ShieldCheck size={14} />
              Official Verified Document
            </button>
          </div>
        )}

        {/* Zoom Controls Bar for Images / SVGs */}
        {isImage && (
          <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-4 py-2 text-xs text-gray-600">
            <span className="text-[11px] text-gray-500">
              {activeTab === 'verified'
                ? 'Official leave certificate issued upon approval'
                : 'Raw file uploaded by student'}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(50, z - 20))}
                className="rounded p-1 hover:bg-gray-200 text-gray-600"
                title="Zoom Out"
              >
                <ZoomOut size={15} />
              </button>
              <span className="w-12 text-center font-mono font-medium text-xs">{zoom}%</span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(200, z + 20))}
                className="rounded p-1 hover:bg-gray-200 text-gray-600"
                title="Zoom In"
              >
                <ZoomIn size={15} />
              </button>
              <button
                type="button"
                onClick={() => setZoom(100)}
                className="rounded px-1.5 py-0.5 text-[11px] font-medium text-navy-700 hover:bg-gray-200"
                title="Reset Zoom"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {/* Content Viewer Body */}
        <div className="flex-1 overflow-auto bg-gray-100/70 p-3 sm:p-5 flex items-center justify-center min-h-[350px] max-h-[68vh]">
          {isPdf ? (
            <div className="flex flex-col w-full h-[62vh] rounded-xl overflow-hidden border border-gray-200 bg-white shadow-xs">
              <iframe
                src={blobUrl || resolved.url}
                title={resolved.name}
                className="w-full h-full border-0"
              />
              <div className="flex items-center justify-between bg-gray-50 border-t border-gray-200 px-4 py-2 text-xs text-gray-600">
                <span>PDF not rendering?</span>
                <div className="flex gap-2">
                  <button
                    onClick={handleOpenExternal}
                    className="font-medium text-navy-700 hover:underline flex items-center gap-1"
                  >
                    <ExternalLink size={12} /> Open in Tab
                  </button>
                  <span>·</span>
                  <button
                    onClick={handleDownload}
                    className="font-medium text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <Download size={12} /> Download PDF
                  </button>
                </div>
              </div>
            </div>
          ) : isImage ? (
            <div className="flex items-center justify-center w-full min-h-[300px] overflow-auto">
              <img
                src={resolved.url}
                alt={resolved.name}
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
                className="transition-transform duration-150 max-w-full max-h-[62vh] object-contain rounded-lg shadow-md bg-white border border-gray-200"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-xs border border-gray-200 text-center max-w-md">
              <FileCheck size={48} className="text-navy-600 mb-3" />
              <h4 className="font-semibold text-navy-900 text-base">{resolved.name}</h4>
              <p className="text-xs text-gray-500 mt-1 mb-4">
                This document is ready to view or download.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-navy-800 px-4 py-2 text-xs font-semibold text-white hover:bg-navy-900 shadow-xs"
                >
                  <Download size={14} /> Download File
                </button>
                <button
                  onClick={handleOpenExternal}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  <ExternalLink size={14} /> Open
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-gray-200 bg-gray-50 px-4 sm:px-6 py-3 text-xs text-gray-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">Verification State:</span>
            {isApproved ? (
              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                Officially Approved &amp; Verified by {decidedBy || 'Faculty'}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-amber-700 font-semibold">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                Student Submission · Pending Approval
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-300 bg-white px-3.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
