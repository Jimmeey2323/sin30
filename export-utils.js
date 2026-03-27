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

  function downloadUnifiedCSV(stats) {
    if (!Array.isArray(stats) || stats.length === 0) {
      throw new Error('No export data available.');
    }

    const headers = [
      'Name',
      'Email',
      'Location',
      'Level',
      'Classes Completed',
      'Classes Required',
      'Weeks Qualified',
      'Status',
      'Week 1',
      'Week 2',
      'Week 3',
      'Week 4'
    ];

    const rows = stats.map(member => [
      member.name || '',
      member.email || '',
      member.location || '',
      member.level || '',
      member.classesCompleted ?? '',
      member.classesRequired ?? '',
      member.weeksQualified ?? member.score ?? '',
      member.status || (member.fullyQualified ? 'QUALIFIED' : 'NOT QUALIFIED'),
      buildWeekStatus(member, 'week1Status'),
      buildWeekStatus(member, 'week2Status'),
      buildWeekStatus(member, 'week3Status'),
      buildWeekStatus(member, 'week4Status')
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(csvEscape).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `stronger-in-30-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function generateUnifiedPDF(stats) {
    if (!Array.isArray(stats) || stats.length === 0) {
      throw new Error('No export data available.');
    }

    const rows = stats.map(member => {
      const status = member.status || (member.fullyQualified ? 'QUALIFIED' : 'NOT QUALIFIED');
      return `
        <tr>
          <td>${member.name || ''}</td>
          <td>${member.location || ''}</td>
          <td>${member.level || ''}</td>
          <td style="text-align:center;">${member.classesCompleted ?? ''}/${member.classesRequired ?? ''}</td>
          <td style="text-align:center;">${member.weeksQualified ?? member.score ?? ''}</td>
          <td style="text-align:center;">${buildWeekStatus(member, 'week1Status')}</td>
          <td style="text-align:center;">${buildWeekStatus(member, 'week2Status')}</td>
          <td style="text-align:center;">${buildWeekStatus(member, 'week3Status')}</td>
          <td style="text-align:center;">${buildWeekStatus(member, 'week4Status')}</td>
          <td>${status}</td>
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
  <title>Stronger in 30 Export</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 24px; color: #111827; }
    h1 { margin: 0 0 8px; font-size: 24px; }
    p { margin: 0 0 20px; color: #6b7280; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #d1d5db; padding: 8px 10px; font-size: 12px; }
    th { background: #111827; color: white; text-align: left; }
    tr:nth-child(even) { background: #f9fafb; }
  </style>
</head>
<body>
  <h1>Stronger in 30 Export</h1>
  <p>Generated ${new Date().toLocaleString()}</p>
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Location</th>
        <th>Level</th>
        <th>Classes</th>
        <th>Weeks</th>
        <th>W1</th>
        <th>W2</th>
        <th>W3</th>
        <th>W4</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`);
    doc.document.close();
    doc.focus();
    setTimeout(() => doc.print(), 250);
  }

  window.downloadUnifiedCSV = downloadUnifiedCSV;
  window.generateUnifiedPDF = generateUnifiedPDF;
})();
