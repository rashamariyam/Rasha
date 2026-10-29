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
  isVerifiedCertificate?: boolean;
}

/**
 * Returns the raw student-attached file.
 * Prior to approval, this is the student's submission awaiting review.
 */
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
  const name = req.documentName || 'student_attachment';

  // 1. If student uploaded a file with data URL (image or PDF), return their actual file!
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

  // 2. If student only submitted a filename (e.g. from an older submission), show an unverified student attachment slip
  const studentName = escapeXml(req.studentName || 'Student Applicant');
  const rollNo = escapeXml(req.rollNo || 'N/A');
  const department = escapeXml(req.department || 'Academic Department');
  const leaveType = escapeXml(req.leaveType || 'Leave Application');
  const docName = escapeXml(name);
  const reason = escapeXml(req.reason || 'Reason stated in leave application.');
  const dates = escapeXml(
    req.startDate && req.endDate ? `${req.startDate} to ${req.endDate}` : 'As applied in portal'
  );
  const submittedOn = escapeXml(
    req.createdAt
      ? new Date(req.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : 'Submitted'
  );

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="100%" height="100%">
    <defs>
      <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#334155"/>
        <stop offset="100%" stop-color="#1e293b"/>
      </linearGradient>
    </defs>

    <!-- Page Background -->
    <rect width="800" height="1000" fill="#f8fafc"/>
    <rect x="35" y="35" width="730" height="930" rx="16" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>

    <!-- Header Banner -->
    <path d="M 35 51 Q 35 35 51 35 L 749 35 Q 765 35 765 51 L 765 140 L 35 140 Z" fill="url(#headerGrad)"/>
    
    <text x="70" y="80" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="700" fill="#ffffff">
      STUDENT ATTACHED FILE
    </text>
    <text x="70" y="105" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" fill="#94a3b8">
      Uploaded by student • Awaiting teacher / faculty verification
    </text>

    <!-- File Info Box -->
    <rect x="70" y="175" width="660" height="110" rx="12" fill="#fffbeb" stroke="#fef3c7" stroke-width="1.5"/>
    <text x="95" y="210" font-family="sans-serif" font-size="11" font-weight="700" fill="#b45309" letter-spacing="1">
      FILE ATTACHMENT
    </text>
    <text x="95" y="240" font-family="sans-serif" font-size="18" font-weight="600" fill="#92400e">
      📎 ${docName}
    </text>
    <text x="95" y="265" font-family="sans-serif" font-size="12" fill="#b45309">
      Status: ⏳ Unverified student upload (Pending review)
    </text>

    <!-- Student & Request Details Section -->
    <text x="70" y="335" font-family="sans-serif" font-size="16" font-weight="700" fill="#1e293b">
      Applicant Details
    </text>
    <line x1="70" y1="350" x2="730" y2="350" stroke="#e2e8f0" stroke-width="1.5"/>

    <!-- Grid Rows -->
    <text x="70" y="390" font-family="sans-serif" font-size="12" font-weight="600" fill="#64748b">Student Name:</text>
    <text x="230" y="390" font-family="sans-serif" font-size="15" font-weight="600" fill="#0f172a">${studentName}</text>

    <text x="440" y="390" font-family="sans-serif" font-size="12" font-weight="600" fill="#64748b">Roll / College ID:</text>
    <text x="580" y="390" font-family="sans-serif" font-size="15" font-weight="600" fill="#0f172a">${rollNo}</text>

    <text x="70" y="440" font-family="sans-serif" font-size="12" font-weight="600" fill="#64748b">Department:</text>
    <text x="230" y="440" font-family="sans-serif" font-size="15" font-weight="600" fill="#0f172a">${department}</text>

    <text x="440" y="440" font-family="sans-serif" font-size="12" font-weight="600" fill="#64748b">Leave Category:</text>
    <text x="580" y="440" font-family="sans-serif" font-size="15" font-weight="600" fill="#2563eb">${leaveType}</text>

    <text x="70" y="490" font-family="sans-serif" font-size="12" font-weight="600" fill="#64748b">Requested Dates:</text>
    <text x="230" y="490" font-family="sans-serif" font-size="15" font-weight="600" fill="#0f172a">${dates}</text>

    <text x="440" y="490" font-family="sans-serif" font-size="12" font-weight="600" fill="#64748b">Submitted On:</text>
    <text x="580" y="490" font-family="sans-serif" font-size="15" font-weight="600" fill="#0f172a">${submittedOn}</text>

    <!-- Stated Reason Box -->
    <rect x="70" y="535" width="660" height="150" rx="10" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
    <text x="95" y="565" font-family="sans-serif" font-size="12" font-weight="700" fill="#475569" letter-spacing="0.5">
      STUDENT STATED REASON
    </text>
    <foreignObject x="95" y="580" width="610" height="90">
      <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: sans-serif; font-size: 14px; color: #334155; line-height: 1.5;">
        ${reason}
      </div>
    </foreignObject>

    <!-- Faculty Review Pending Notice Banner -->
    <g transform="translate(70, 720)">
      <rect x="0" y="0" width="660" height="110" rx="12" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1.5"/>
      <circle cx="45" cy="55" r="22" fill="#dbeafe"/>
      <text x="45" y="62" text-anchor="middle" font-family="sans-serif" font-size="20">ℹ️</text>
      
      <text x="85" y="45" font-family="sans-serif" font-size="15" font-weight="700" fill="#1e40af">
        AWAITING FACULTY VERIFICATION
      </text>
      <text x="85" y="70" font-family="sans-serif" font-size="12" fill="#1e3a8a">
        This document has been submitted by the student and is pending teacher review.
      </text>
      <text x="85" y="90" font-family="sans-serif" font-size="11" fill="#3b82f6">
        The official Verified Certificate will be generated only after leave approval.
      </text>
    </g>

    <!-- Footer Note -->
    <text x="400" y="890" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#94a3b8">
      LeaveEase Student Attachment Portal • File Reference: ${docName}
    </text>
  </svg>`;

  return {
    url: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`,
    isGenerated: true,
    mimeType: 'image/svg+xml',
    name,
    isVerifiedCertificate: false,
  };
}

/**
 * Returns the Official Verified Document / Certificate.
 * Only shown after leave approval!
 */
export function getVerifiedDocumentUrl(req: {
  documentName?: string;
  studentName?: string;
  rollNo?: string;
  department?: string;
  leaveType?: string;
  reason?: string;
  startDate?: string;
  endDate?: string;
  decidedBy?: string;
  decidedAt?: string;
  decisionNote?: string;
}): ResolvedDocument {
  const studentName = escapeXml(req.studentName || 'Student Applicant');
  const rollNo = escapeXml(req.rollNo || 'N/A');
  const department = escapeXml(req.department || 'Academic Department');
  const leaveType = escapeXml(req.leaveType || 'Leave Application');
  const decidedBy = escapeXml(req.decidedBy || 'Faculty Authority');
  const decisionNote = escapeXml(req.decisionNote || 'Approved according to institutional attendance policy.');
  const dates = escapeXml(
    req.startDate && req.endDate ? `${req.startDate} to ${req.endDate}` : 'Approved Leave Duration'
  );
  const approvedOn = escapeXml(
    req.decidedAt
      ? new Date(req.decidedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  );
  const refCode = `VERIFIED-${Math.abs(hashCode(studentName + rollNo + leaveType)).toString(36).toUpperCase().slice(0, 8)}`;
  const certName = `Verified_Leave_Certificate_${req.rollNo || 'student'}.svg`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1080" width="100%" height="100%">
    <defs>
      <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#0f766e"/>
        <stop offset="100%" stop-color="#134e4a"/>
      </linearGradient>
      <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.1"/>
      </filter>
    </defs>

    <!-- Page Background -->
    <rect width="800" height="1080" fill="#f0fdfa"/>
    <rect x="35" y="35" width="730" height="1010" rx="16" fill="#ffffff" stroke="#99f6e4" stroke-width="2" filter="url(#shadow)"/>

    <!-- Header Banner -->
    <path d="M 35 51 Q 35 35 51 35 L 749 35 Q 765 35 765 51 L 765 145 L 35 145 Z" fill="url(#headerGrad)"/>
    
    <circle cx="85" cy="90" r="26" fill="#5eead4" fill-opacity="0.2"/>
    <path d="M 75 90 L 82 97 L 96 83" fill="none" stroke="#5eead4" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>

    <text x="125" y="82" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="700" fill="#ffffff">
      OFFICIAL VERIFIED LEAVE CERTIFICATE
    </text>
    <text x="125" y="108" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" fill="#ccfbf1">
      Institutional Accreditation • Verified Reference: ${refCode}
    </text>

    <!-- Approval Banner Card -->
    <rect x="70" y="175" width="660" height="95" rx="12" fill="#ecfdf5" stroke="#a7f3d0" stroke-width="1.5"/>
    <text x="95" y="210" font-family="sans-serif" font-size="11" font-weight="700" fill="#047857" letter-spacing="1">
      VERIFICATION &amp; APPROVAL STATUS
    </text>
    <text x="95" y="240" font-family="sans-serif" font-size="18" font-weight="700" fill="#065f46">
      ✓ Approved &amp; Verified by ${decidedBy}
    </text>
    <text x="520" y="210" font-family="sans-serif" font-size="11" font-weight="700" fill="#047857" letter-spacing="1">
      DECISION DATE
    </text>
    <text x="520" y="240" font-family="sans-serif" font-size="13" font-weight="600" fill="#065f46">
      ${approvedOn}
    </text>

    <!-- Details Section -->
    <text x="70" y="315" font-family="sans-serif" font-size="16" font-weight="700" fill="#0f172a">
      Student &amp; Leave Credentials
    </text>
    <line x1="70" y1="330" x2="730" y2="330" stroke="#e2e8f0" stroke-width="1.5"/>

    <text x="70" y="370" font-family="sans-serif" font-size="12" font-weight="600" fill="#64748b">Student Name:</text>
    <text x="230" y="370" font-family="sans-serif" font-size="15" font-weight="600" fill="#0f172a">${studentName}</text>

    <text x="440" y="370" font-family="sans-serif" font-size="12" font-weight="600" fill="#64748b">Roll / College ID:</text>
    <text x="580" y="370" font-family="sans-serif" font-size="15" font-weight="600" fill="#0f172a">${rollNo}</text>

    <text x="70" y="420" font-family="sans-serif" font-size="12" font-weight="600" fill="#64748b">Department:</text>
    <text x="230" y="420" font-family="sans-serif" font-size="15" font-weight="600" fill="#0f172a">${department}</text>

    <text x="440" y="420" font-family="sans-serif" font-size="12" font-weight="600" fill="#64748b">Approved Category:</text>
    <text x="580" y="420" font-family="sans-serif" font-size="15" font-weight="600" fill="#0d9488">${leaveType}</text>

    <text x="70" y="470" font-family="sans-serif" font-size="12" font-weight="600" fill="#64748b">Approved Duration:</text>
    <text x="230" y="470" font-family="sans-serif" font-size="15" font-weight="600" fill="#0f172a">${dates}</text>

    <text x="440" y="470" font-family="sans-serif" font-size="12" font-weight="600" fill="#64748b">Reviewed By:</text>
    <text x="580" y="470" font-family="sans-serif" font-size="15" font-weight="600" fill="#0f172a">${decidedBy}</text>

    <!-- Faculty Decision Note Box -->
    <rect x="70" y="515" width="660" height="130" rx="10" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="1"/>
    <text x="95" y="545" font-family="sans-serif" font-size="12" font-weight="700" fill="#15803d" letter-spacing="0.5">
      FACULTY / HOD DECISION NOTE
    </text>
    <foreignObject x="95" y="560" width="610" height="75">
      <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: sans-serif; font-size: 14px; color: #166534; line-height: 1.5;">
        ${decisionNote}
      </div>
    </foreignObject>

    <!-- Official Seal -->
    <g transform="translate(180, 680)">
      <rect x="0" y="0" width="440" height="150" rx="14" fill="#ffffff" stroke="#059669" stroke-width="2.5" stroke-dasharray="6,4"/>
      <circle cx="70" cy="75" r="38" fill="#d1fae5" stroke="#059669" stroke-width="2.5"/>
      <text x="70" y="85" text-anchor="middle" font-family="sans-serif" font-size="32">✓</text>
      
      <text x="130" y="58" font-family="sans-serif" font-size="17" font-weight="800" fill="#065f46" letter-spacing="1">
        VERIFIED &amp; APPROVED
      </text>
      <text x="130" y="85" font-family="sans-serif" font-size="12" fill="#047857">
        LeaveEase Accredited Faculty Approval Seal
      </text>
      <text x="130" y="110" font-family="monospace" font-size="11" fill="#059669">
        Ref: ${refCode} · Authorized Record
      </text>
    </g>

    <!-- Footer Note -->
    <text x="400" y="900" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#64748b">
      This is an official institutional document certifying approval of student leave.
    </text>
    <text x="400" y="925" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#94a3b8">
      Valid for academic attendance regularization, examination clearance, and student record keeping.
    </text>
  </svg>`;

  return {
    url: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`,
    isGenerated: true,
    mimeType: 'image/svg+xml',
    name: certName,
    isVerifiedCertificate: true,
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
