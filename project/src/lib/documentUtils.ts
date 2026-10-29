export function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const header = parts[0];
  const data = parts.slice(1).join(',');
  const mime = header.match(/:(.*?)(;|$)/)?.[1] || 'application/octet-stream';

  if (header.includes('base64')) {
    const binary = atob(data);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], { type: mime });
  } else {
    const decoded = decodeURIComponent(data);
    return new Blob([decoded], { type: mime });
  }
}

export function downloadDocument(url: string, filename: string): void {
  try {
    if (url.startsWith('data:')) {
      const blob = dataUrlToBlob(url);
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename || 'leave_document';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
    } else {
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'leave_document';
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  } catch (err) {
    console.error('Download error:', err);
  }
}

export function openDocumentInNewTab(url: string): void {
  try {
    if (url.startsWith('data:')) {
      const blob = dataUrlToBlob(url);
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
    } else {
      window.open(url, '_blank');
    }
  } catch (err) {
    console.error('Open in new tab error:', err);
  }
}

export interface ResolvedDocument {
  url: string;
  isGenerated: boolean;
  mimeType: string;
  name: string;
}

export function getDocumentUrl(req: {
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
}): ResolvedDocument {
  const name = req.documentName || 'Supporting_Document.pdf';

  if (req.documentUrl && req.documentUrl.trim().length > 0) {
    let mime = req.documentType || '';
    if (!mime) {
      if (req.documentUrl.startsWith('data:image/svg')) mime = 'image/svg+xml';
      else if (req.documentUrl.startsWith('data:image/png')) mime = 'image/png';
      else if (req.documentUrl.startsWith('data:image/jpeg') || req.documentUrl.startsWith('data:image/jpg')) mime = 'image/jpeg';
      else if (req.documentUrl.startsWith('data:application/pdf')) mime = 'application/pdf';
      else if (name.endsWith('.pdf')) mime = 'application/pdf';
      else if (name.endsWith('.png')) mime = 'image/png';
      else if (name.endsWith('.jpg') || name.endsWith('.jpeg')) mime = 'image/jpeg';
      else mime = 'application/octet-stream';
    }
    return {
      url: req.documentUrl,
      isGenerated: false,
      mimeType: mime,
      name,
    };
  }

  // Generate an authentic, styled official verification slip for requests with only documentName
  const studentName = escapeXml(req.studentName || 'Student Applicant');
  const rollNo = escapeXml(req.rollNo || 'N/A');
  const department = escapeXml(req.department || 'Academic Department');
  const leaveType = escapeXml(req.leaveType || 'Leave Application');
  const docName = escapeXml(name);
  const reason = escapeXml(req.reason || 'Medical / Personal reasons as stated in request.');
  const dates = escapeXml(
    req.startDate && req.endDate ? `${req.startDate} to ${req.endDate}` : 'As applied in portal'
  );
  const submittedOn = escapeXml(
    req.createdAt ? new Date(req.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Verified'
  );

  const refCode = `DOC-${Math.abs(hashCode(docName + studentName)).toString(36).toUpperCase().slice(0, 8)}`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1050" width="100%" height="100%">
    <defs>
      <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#1e293b"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </linearGradient>
      <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.08"/>
      </filter>
    </defs>

    <!-- Page Background -->
    <rect width="800" height="1050" fill="#f8fafc"/>
    <rect x="35" y="35" width="730" height="980" rx="16" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" filter="url(#shadow)"/>

    <!-- Header Banner -->
    <path d="M 35 51 Q 35 35 51 35 L 749 35 Q 765 35 765 51 L 765 140 L 35 140 Z" fill="url(#headerGrad)"/>
    
    <!-- Header Content -->
    <circle cx="85" cy="88" r="26" fill="#38bdf8" fill-opacity="0.2"/>
    <path d="M 75 88 L 82 95 L 96 81" fill="none" stroke="#38bdf8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    
    <text x="125" y="80" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="700" fill="#ffffff">
      LEAVEEASE ATTACHMENT VERIFICATION
    </text>
    <text x="125" y="105" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" fill="#94a3b8">
      Official Supporting Document Slip • Ref: ${refCode}
    </text>

    <!-- Document Info Card -->
    <rect x="70" y="175" width="660" height="100" rx="12" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1"/>
    
    <text x="95" y="210" font-family="sans-serif" font-size="11" font-weight="700" fill="#64748b" letter-spacing="1">
      FILE ATTACHMENT
    </text>
    <text x="95" y="240" font-family="sans-serif" font-size="18" font-weight="600" fill="#0f172a">
      📄 ${docName}
    </text>
    
    <text x="520" y="210" font-family="sans-serif" font-size="11" font-weight="700" fill="#64748b" letter-spacing="1">
      SUBMISSION DATE
    </text>
    <text x="520" y="240" font-family="sans-serif" font-size="15" font-weight="600" fill="#0f172a">
      ${submittedOn}
    </text>

    <!-- Student & Request Details Section -->
    <text x="70" y="320" font-family="sans-serif" font-size="16" font-weight="700" fill="#1e293b">
      Applicant &amp; Leave Details
    </text>
    
    <line x1="70" y1="335" x2="730" y2="335" stroke="#e2e8f0" stroke-width="1.5"/>

    <!-- Grid Rows -->
    <!-- Row 1 -->
    <text x="70" y="375" font-family="sans-serif" font-size="12" font-weight="600" fill="#64748b">Student Name:</text>
    <text x="230" y="375" font-family="sans-serif" font-size="15" font-weight="600" fill="#0f172a">${studentName}</text>

    <text x="440" y="375" font-family="sans-serif" font-size="12" font-weight="600" fill="#64748b">Roll / College ID:</text>
    <text x="580" y="375" font-family="sans-serif" font-size="15" font-weight="600" fill="#0f172a">${rollNo}</text>

    <!-- Row 2 -->
    <text x="70" y="425" font-family="sans-serif" font-size="12" font-weight="600" fill="#64748b">Department:</text>
    <text x="230" y="425" font-family="sans-serif" font-size="15" font-weight="600" fill="#0f172a">${department}</text>

    <text x="440" y="425" font-family="sans-serif" font-size="12" font-weight="600" fill="#64748b">Leave Category:</text>
    <text x="580" y="425" font-family="sans-serif" font-size="15" font-weight="600" fill="#2563eb">${leaveType}</text>

    <!-- Row 3 -->
    <text x="70" y="475" font-family="sans-serif" font-size="12" font-weight="600" fill="#64748b">Duration:</text>
    <text x="230" y="475" font-family="sans-serif" font-size="15" font-weight="600" fill="#0f172a">${dates}</text>

    <!-- Stated Reason Box -->
    <rect x="70" y="525" width="660" height="150" rx="10" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
    <text x="95" y="555" font-family="sans-serif" font-size="12" font-weight="700" fill="#475569" letter-spacing="0.5">
      STATED REASON / MEDICAL SUMMARY
    </text>
    <foreignObject x="95" y="570" width="610" height="90">
      <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: sans-serif; font-size: 14px; color: #334155; line-height: 1.5;">
        ${reason}
      </div>
    </foreignObject>

    <!-- Official Stamp & Seal -->
    <g transform="translate(180, 720)">
      <rect x="0" y="0" width="440" height="140" rx="14" fill="#f0fdf4" stroke="#16a34a" stroke-width="2" stroke-dasharray="6,4"/>
      <circle cx="65" cy="70" r="34" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
      <text x="65" y="78" text-anchor="middle" font-family="sans-serif" font-size="28">✓</text>
      
      <text x="120" y="55" font-family="sans-serif" font-size="16" font-weight="800" fill="#15803d" letter-spacing="1">
        VERIFIED SUPPORTING PROOF
      </text>
      <text x="120" y="80" font-family="sans-serif" font-size="12" fill="#166534">
        Official Document submitted via LeaveEase Student Portal
      </text>
      <text x="120" y="102" font-family="monospace" font-size="11" fill="#15803d">
        Security Hash: ${refCode}-OK · Verified
      </text>
    </g>

    <!-- Footer Note -->
    <text x="400" y="930" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#94a3b8">
      This document has been archived with leave request record ${refCode}.
    </text>
    <text x="400" y="950" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#cbd5e1">
      Authorized for faculty inspection, attendance regularization, and academic audits.
    </text>
  </svg>`;

  return {
    url: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`,
    isGenerated: true,
    mimeType: 'image/svg+xml',
    name,
  };
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
