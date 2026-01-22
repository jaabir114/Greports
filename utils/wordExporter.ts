
import { Report, Language, ReportTypeTranslations } from "../types";

export const exportToWord = (report: Report) => {
  const isRtl = report.language === Language.ARABIC;
  const dateStr = new Date(report.createdAt).toLocaleDateString(
    report.language === Language.ARABIC ? 'ar-SA' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );
  const localizedType = ReportTypeTranslations[report.language][report.type];

  // Professional Word-compatible HTML with absolute positioning hacks for Word
  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <style>
        @page {
          size: A4;
          margin: 1.25in 1in 1in 1in;
        }
        body { 
          font-family: ${isRtl ? "'Simplified Arabic', 'Times New Roman', serif" : "'Times New Roman', serif"}; 
          direction: ${isRtl ? 'rtl' : 'ltr'}; 
          line-height: 1.6;
          color: #1a1a1a;
          font-size: 13pt;
        }
        .header-section {
          width: 100%;
          border-bottom: 2px solid #2d3748;
          margin-bottom: 40px;
          padding-bottom: 20px;
        }
        .header-table {
          width: 100%;
          border-collapse: collapse;
        }
        .logo-cell {
          width: 50%;
          text-align: ${isRtl ? 'right' : 'left'};
        }
        .meta-cell {
          width: 50%;
          text-align: ${isRtl ? 'left' : 'right'};
          font-size: 10pt;
          color: #4a5568;
        }
        .title-block {
          text-align: center;
          margin: 40px 0;
        }
        .doc-type {
          font-size: 16pt;
          font-weight: bold;
          color: #2d3748;
          text-decoration: underline;
          text-transform: uppercase;
        }
        .subject-line {
          font-weight: bold;
          font-size: 14pt;
          margin-bottom: 30px;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 10px;
        }
        .content-body {
          text-align: justify;
          margin-bottom: 60px;
          white-space: pre-wrap;
        }
        .signature-section {
          margin-top: 50px;
          text-align: ${isRtl ? 'left' : 'right'};
          padding-${isRtl ? 'left' : 'right'}: 60px;
        }
        .signature-line {
          font-weight: bold;
          font-size: 14pt;
          margin-top: 10px;
          display: block;
        }
        .footer-note {
          margin-top: 100px;
          font-size: 8pt;
          color: #a0aec0;
          text-align: center;
          border-top: 1px solid #edf2f7;
          padding-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="header-section">
        <table class="header-table">
          <tr>
            <td class="logo-cell">
              ${report.logoUrl ? `<img src="${report.logoUrl}" style="max-height: 90px; width: auto;" />` : `<h2 style="margin:0; color:#2d3748;">${isRtl ? 'وثيقة رسمية' : 'Official Document'}</h2>`}
            </td>
            <td class="meta-cell">
              <div style="font-weight:bold;">${dateStr}</div>
              <div>${isRtl ? 'الرقم المرجعي' : 'Ref'}: SEC-${report.id.slice(-6).toUpperCase()}</div>
              <div>${isRtl ? 'تصنيف: سري للغاية' : 'Class: Official'}</div>
            </td>
          </tr>
        </table>
      </div>

      <div class="title-block">
        <div class="doc-type">${localizedType}</div>
      </div>

      <div class="subject-line">
        ${isRtl ? 'الموضوع: ' : 'Subject: '} ${report.title}
      </div>

      <div class="content-body">
        ${report.content.replace(/\n/g, '<br/>')}
      </div>

      <div class="signature-section">
        <p>${isRtl ? 'وتفضلوا بقبول فائق الاحترام والتقدير،،' : 'Sincerely yours,'}</p>
        <br/><br/>
        <span class="signature-line">${report.senderName}</span>
        <p style="font-size: 10pt; color: #718096; margin-top:5px;">${localizedType}</p>
      </div>

      <div class="footer-note">
        ${isRtl ? 'تم إصدار هذا المستند آلياً بواسطة نظام السكرتير الذكي' : 'Automated Document Issued via Smart Secretary AI'}
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${report.title.replace(/\s+/g, '_')}_${dateStr}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
