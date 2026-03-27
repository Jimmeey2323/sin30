(function () {
  function csvEscape(value) {
    const stringValue = value == null ? '' : String(value);
    if (/[",\n]/.test(stringValue)) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  }

  function buildWeekStatus(member, key) {
    return member[key] || (member.weekDetails && Array.isArray(member.weekDetails)
      ? (member.weekDetails[Number(key.replace('week', '').replace('Status', '')) - 1]?.qualified ? '✓' : '✗')
      : '-');
  }

  function isQualifiedExportMember(member) {
    if (!member) return false;
    if (typeof member.fullyQualified === 'boolean') return member.fullyQualified;
    if (typeof member.qualification === 'string') return member.qualification.toUpperCase() === 'QUALIFIED';
    if (typeof member.status === 'string') return member.status.toUpperCase() === 'QUALIFIED';
    return false;
  }

  function normalizeUnifiedMember(member) {
    const classesCompleted = member.classesCompleted ?? member.totalClasses ?? '';
    const classesRequired = member.classesRequired ?? member.totalRequired ?? '';
    const weeksQualified = member.weeksQualified ?? member.score ?? '';
    const qualification = member.qualification || member.status || (isQualifiedExportMember(member) ? 'QUALIFIED' : 'NOT QUALIFIED');

    return {
      name: member.name || '',
      email: member.email || '',
      location: member.location || '',
      level: member.level || '',
      qualification,
      classesCompleted,
      classesRequired,
      weeksQualified,
      week1Status: buildWeekStatus(member, 'week1Status'),
      week2Status: buildWeekStatus(member, 'week2Status'),
      week3Status: buildWeekStatus(member, 'week3Status'),
      week4Status: buildWeekStatus(member, 'week4Status'),
      bonusClassesUsed: member.bonusClassesUsed || '',
      disqualReason: member.disqualReason || '',
      qualificationCriteria: member.qualificationCriteria || '',
      fullyQualified: isQualifiedExportMember(member),
    };
  }

  function normalizeUnifiedMembers(stats) {
    return stats.map(normalizeUnifiedMember);
  }

  function buildSummary(normalizedMembers) {
    const byLevel = normalizedMembers.reduce((acc, member) => {
      const key = member.level || 'Unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return {
      total: normalizedMembers.length,
      qualified: normalizedMembers.filter(member => member.fullyQualified).length,
      byLevel,
    };
  }

  function buildExportTitle(options, normalizedMembers) {
    if (options && options.title) return options.title;
    const allQualified = normalizedMembers.length > 0 && normalizedMembers.every(member => member.fullyQualified);
    return allQualified ? 'Stronger in 30 — Qualified Members Export' : 'Stronger in 30 — Member Export';
  }

  function buildExportFilename(prefix, extension) {
    return `${prefix || 'stronger-in-30-export'}-${new Date().toISOString().split('T')[0]}.${extension}`;
  }

  function triggerBlobDownload(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function ellipsize(ctx, text, maxWidth) {
    const input = String(text ?? '');
    if (ctx.measureText(input).width <= maxWidth) return input;
    let output = input;
    while (output.length > 0 && ctx.measureText(`${output}…`).width > maxWidth) {
      output = output.slice(0, -1);
    }
    return output ? `${output}…` : '';
  }

  function downloadUnifiedCSV(stats, options = {}) {
    if (!Array.isArray(stats) || stats.length === 0) {
      throw new Error('No export data available.');
    }

    const members = normalizeUnifiedMembers(stats);

    const headers = [
      'Name',
      'Email',
      'Location',
      'Level',
      'Qualification',
      'Classes Completed',
      'Classes Required',
      'Weeks Qualified',
      'Bonus Classes Used',
      'Week 1',
      'Week 2',
      'Week 3',
      'Week 4',
      'Disqualification Reason'
    ];

    const rows = members.map(member => [
      member.name || '',
      member.email || '',
      member.location || '',
      member.level || '',
      member.qualification || '',
      member.classesCompleted,
      member.classesRequired,
      member.weeksQualified,
      member.bonusClassesUsed || '',
      member.week1Status,
      member.week2Status,
      member.week3Status,
      member.week4Status,
      member.disqualReason || ''
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(csvEscape).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    triggerBlobDownload(blob, buildExportFilename(options.filePrefix, 'csv'));
  }

  function generateUnifiedPDF(stats, options = {}) {
    if (!Array.isArray(stats) || stats.length === 0) {
      throw new Error('No export data available.');
    }

    const members = normalizeUnifiedMembers(stats);
    const summary = buildSummary(members);
    const title = buildExportTitle(options, members);

    const rows = members.map(member => {
      return `
        <tr>
          <td>${member.name || ''}</td>
          <td>${member.email || ''}</td>
          <td>${member.location || ''}</td>
          <td>${member.level || ''}</td>
          <td>${member.qualification}</td>
          <td style="text-align:center;">${member.classesCompleted}/${member.classesRequired}</td>
          <td style="text-align:center;">${member.weeksQualified}</td>
          <td>${member.bonusClassesUsed || '—'}</td>
          <td style="text-align:center;">${member.week1Status}</td>
          <td style="text-align:center;">${member.week2Status}</td>
          <td style="text-align:center;">${member.week3Status}</td>
          <td style="text-align:center;">${member.week4Status}</td>
        </tr>`;
    }).join('');

    const doc = window.open('', '', 'width=1200,height=900');
    if (!doc) {
      throw new Error('Popup blocked while opening print preview.');
    }

    doc.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 24px; color: #111827; background: #f8fafc; }
    .sheet { background: white; border: 1px solid #e5e7eb; border-radius: 18px; padding: 24px; box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08); }
    h1 { margin: 0 0 8px; font-size: 24px; }
    p { margin: 0 0 20px; color: #6b7280; }
    .summary { display: flex; gap: 12px; margin: 0 0 20px; flex-wrap: wrap; }
    .summary-chip { padding: 10px 14px; border-radius: 999px; background: #f3f4f6; font-size: 12px; font-weight: 600; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #d1d5db; padding: 8px 10px; font-size: 12px; }
    th { background: #111827; color: white; text-align: left; }
    tr:nth-child(even) { background: #f9fafb; }
  </style>
</head>
<body>
  <div class="sheet">
    <h1>${title}</h1>
    <p>Generated ${new Date().toLocaleString()}</p>
    <div class="summary">
      <div class="summary-chip">Members: ${summary.total}</div>
      <div class="summary-chip">Qualified: ${summary.qualified}</div>
      ${Object.entries(summary.byLevel).map(([level, count]) => `<div class="summary-chip">${level}: ${count}</div>`).join('')}
    </div>
    <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Email</th>
        <th>Location</th>
        <th>Level</th>
        <th>Qualification</th>
        <th>Classes</th>
        <th>Weeks</th>
        <th>Bonus</th>
        <th>W1</th>
        <th>W2</th>
        <th>W3</th>
        <th>W4</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  </div>
</body>
</html>`);
    doc.document.close();
    doc.focus();
    setTimeout(() => doc.print(), 250);
  }

  function downloadUnifiedPNG(stats, options = {}) {
    if (!Array.isArray(stats) || stats.length === 0) {
      throw new Error('No export data available.');
    }

    const members = normalizeUnifiedMembers(stats);
    const summary = buildSummary(members);
    const title = buildExportTitle(options, members);

    const rowHeight = 34;
    const headerHeight = 44;
    const topSectionHeight = 120;
    const padding = 32;
    const columns = [
      { key: 'name', label: 'Name', width: 210 },
      { key: 'level', label: 'Level', width: 120 },
      { key: 'location', label: 'Location', width: 150 },
      { key: 'email', label: 'Email', width: 240 },
      { key: 'classes', label: 'Classes', width: 110 },
      { key: 'weeksQualified', label: 'Weeks', width: 70 },
      { key: 'bonusClassesUsed', label: 'Bonus Used', width: 220 },
    ];

    const tableWidth = columns.reduce((sum, column) => sum + column.width, 0);
    const width = padding * 2 + tableWidth;
    const height = padding * 2 + topSectionHeight + headerHeight + members.length * rowHeight;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not initialize PNG export canvas.');
    }

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(16, 16, width - 32, height - 32, 20);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = '700 28px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif';
    ctx.fillText(title, padding, padding + 24);
    ctx.fillStyle = '#64748b';
    ctx.font = '500 14px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif';
    ctx.fillText(`Generated ${new Date().toLocaleString()}`, padding, padding + 50);

    const summaryChips = [
      `Members: ${summary.total}`,
      `Qualified: ${summary.qualified}`,
      ...Object.entries(summary.byLevel).map(([level, count]) => `${level}: ${count}`),
    ];

    let chipX = padding;
    let chipY = padding + 70;
    summaryChips.forEach(chip => {
      ctx.font = '600 13px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif';
      const chipWidth = ctx.measureText(chip).width + 24;
      ctx.fillStyle = '#eef2ff';
      ctx.beginPath();
      ctx.roundRect(chipX, chipY, chipWidth, 28, 14);
      ctx.fill();
      ctx.fillStyle = '#4338ca';
      ctx.fillText(chip, chipX + 12, chipY + 18);
      chipX += chipWidth + 10;
    });

    let x = padding;
    const tableTop = padding + topSectionHeight;
    ctx.fillStyle = '#111827';
    ctx.fillRect(padding, tableTop, tableWidth, headerHeight);
    ctx.font = '700 13px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif';
    ctx.fillStyle = '#ffffff';
    columns.forEach(column => {
      ctx.fillText(column.label, x + 10, tableTop + 27);
      x += column.width;
    });

    members.forEach((member, index) => {
      const rowTop = tableTop + headerHeight + index * rowHeight;
      ctx.fillStyle = index % 2 === 0 ? '#ffffff' : '#f8fafc';
      ctx.fillRect(padding, rowTop, tableWidth, rowHeight);
      ctx.strokeStyle = '#e5e7eb';
      ctx.strokeRect(padding, rowTop, tableWidth, rowHeight);

      let cellX = padding;
      columns.forEach(column => {
        let value = '';
        if (column.key === 'classes') {
          value = `${member.classesCompleted}/${member.classesRequired}`;
        } else {
          value = member[column.key] || '';
        }
        ctx.font = '500 12px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif';
        ctx.fillStyle = '#0f172a';
        ctx.fillText(ellipsize(ctx, value, column.width - 18), cellX + 8, rowTop + 22);
        cellX += column.width;
      });
    });

    canvas.toBlob(blob => {
      if (!blob) {
        throw new Error('Failed to build PNG file.');
      }
      triggerBlobDownload(blob, buildExportFilename(options.filePrefix, 'png'));
    }, 'image/png');
  }

  window.downloadUnifiedCSV = downloadUnifiedCSV;
  window.generateUnifiedPDF = generateUnifiedPDF;
  window.downloadUnifiedPNG = downloadUnifiedPNG;
  window.isQualifiedExportMember = isQualifiedExportMember;
})();
