/**
 * Unified Export Utilities for Stronger in 30
 * Handles CSV and PDF export functionality across all fitness levels
 */

/**
 * Generate participant stats for unified export
 * @param {Array} members - Participants array
 * @param {Object} state - State object containing class data
 * @param {Array} days - Days array
 * @param {Array} stickers - Stickers/class types array
 * @param {string} level - Fitness level (Beginner, Intermediate, Advanced)
 * @param {Function} getScore - Function to get week qualification score
 * @param {Function} getTotalClasses - Function to get total classes
 * @param {Function} getTotalClassesRequired - Function to get required classes
 * @param {Function} getWeekScore - Function to get week-specific score
 * @param {Object} qualificationSettings - Qualification settings
 * @returns {Array} Array of participant stats
 */
function generateParticipantStatsForLevel(
  members,
  state,
  days,
  stickers,
  level,
  getScore,
  getTotalClasses,
  getTotalClassesRequired,
  getWeekScore,
  qualificationSettings
) {
  const stats = [];
  members.forEach((m, mi) => {
    const score = getScore(mi);
    const total = getTotalClasses(mi);
    const required = getTotalClassesRequired(mi);
    const isFullyQualified = score >= 4;
    
    // Count classes by type
    const classTypeCounters = {};
    stickers.forEach(s => classTypeCounters[s.label] = 0);
    
    days.forEach(d => {
      const emoji = state[mi][d.key];
      if (emoji) {
        const sticker = stickers.find(s => s.emoji === emoji);
        if (sticker) classTypeCounters[sticker.label]++;
      }
    });
    
    const weekDetails = [];
    for (let week = 1; week <= 4; week++) {
      const { completed } = getWeekScore(mi, week);
      weekDetails.push({ week, qualified: completed });
    }
    
    stats.push({
      name: `${m.first} ${m.last}`,
      email: m.email,
      location: m.loc,
      level: level,
      classesCompleted: total,
      classesRequired: required,
      weeksQualified: score,
      fullyQualified: isFullyQualified,
      status: isFullyQualified ? 'QUALIFIED' : 'NOT QUALIFIED',
      qualificationMethod: qualificationSettings.useClassDifferenceQualification ? 'Within 3 Classes' : 'Week-Based',
      classTypeCounters,
      weekDetails
    });
  });
  return stats;
}

/**
 * Export consolidated data from all levels to CSV
 * @param {Array} allStats - Combined stats from all levels
 * @returns {string} CSV content
 */
function generateUnifiedCSV(allStats) {
  // Group by location, level, and qualification status
  const byLocationLevel = {};
  allStats.forEach(s => {
    const key = `${s.location}`;
    if (!byLocationLevel[key]) byLocationLevel[key] = {};
    if (!byLocationLevel[key][s.level]) byLocationLevel[key][s.level] = { qualified: [], notQualified: [] };
    if (s.fullyQualified) {
      byLocationLevel[key][s.level].qualified.push(s);
    } else {
      byLocationLevel[key][s.level].notQualified.push(s);
    }
  });

  const allClassTypes = Array.from(new Set(allStats.flatMap(s => Object.keys(s.classTypeCounters))));
  
  // Define format groups
  const cardioFormats = ['Cardio Barre', 'HIIT', 'Amped Up', 'Cardio Barre Plus', "Trainer's Choice"];
  const strengthFormats = ['FIT', 'Strength Lab', 'Back Body Blaze'];
  
  const orderedClassTypes = [
    ...allClassTypes.filter(ct => cardioFormats.includes(ct)),
    ...allClassTypes.filter(ct => strengthFormats.includes(ct)),
    ...allClassTypes.filter(ct => !cardioFormats.includes(ct) && !strengthFormats.includes(ct))
  ];
  
  const headers = ['Name', 'Email', 'Location', 'Level', 'Classes Done/Required', 'Weeks Qualified', 'Status', 'Qualification Method', 'W1', 'W2', 'W3', 'W4', ...orderedClassTypes];
  const rows = [headers];
  
  // Add interchangeability guides
  rows.push(['--- INTERCHANGEABLE FORMAT GROUPS ---']);
  rows.push(['CARDIO (interchangeable): Cardio Barre, HIIT, Amped Up, Cardio Barre Plus, Trainer\'s Choice']);
  rows.push(['STRENGTH (interchangeable): FIT, Strength Lab, Back Body Blaze']);
  rows.push(['SPECIFIC FORMATS (non-interchangeable): PowerCycle, Barre 57, Mat 57, Recovery']);
  rows.push(['']);
  
  Object.entries(byLocationLevel).sort().forEach(([location, levels]) => {
    rows.push([`--- ${location} ---`]);
    ['Beginner', 'Intermediate', 'Advanced'].forEach(level => {
      if (levels[level]) {
        const levelLabel = level === 'Beginner' ? level : `  ${level}`;
        rows.push([levelLabel]);
        
        // QUALIFIED SECTION
        if (levels[level].qualified.length > 0) {
          rows.push(['  ✓ QUALIFIED', `(${levels[level].qualified.length})`]);
          levels[level].qualified.forEach(participant => {
            const classTypeCells = orderedClassTypes.map(ct => participant.classTypeCounters[ct] || 0);
            rows.push([
              participant.name,
              participant.email,
              '',
              '',
              `${participant.classesCompleted}/${participant.classesRequired}`,
              participant.weeksQualified,
              participant.status,
              participant.qualificationMethod,
              ...participant.weekDetails.map(w => w.qualified ? '✓' : '✗'),
              ...classTypeCells
            ]);
          });
          rows.push([]);
        }
        
        // NOT QUALIFIED SECTION
        if (levels[level].notQualified.length > 0) {
          rows.push(['  ✗ NOT QUALIFIED', `(${levels[level].notQualified.length})`]);
          levels[level].notQualified.forEach(participant => {
            const classTypeCells = orderedClassTypes.map(ct => participant.classTypeCounters[ct] || 0);
            rows.push([
              participant.name,
              participant.email,
              '',
              '',
              `${participant.classesCompleted}/${participant.classesRequired}`,
              participant.weeksQualified,
              participant.status,
              participant.qualificationMethod,
              ...participant.weekDetails.map(w => w.qualified ? '✓' : '✗'),
              ...classTypeCells
            ]);
          });
          rows.push([]);
        }
      }
    });
  });
  
  return rows.map(row => 
    row.map(cell => {
      const str = String(cell);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(',')
  ).join('\n');
}

/**
 * Export consolidated data to PDF
 * @param {Array} allStats - Combined stats from all levels
 */
function generateUnifiedPDF(allStats) {
  // Group by location and level
  const byLocationLevel = {};
  allStats.forEach(s => {
    const key = `${s.location}`;
    if (!byLocationLevel[key]) byLocationLevel[key] = {};
    if (!byLocationLevel[key][s.level]) byLocationLevel[key][s.level] = [];
    byLocationLevel[key][s.level].push(s);
  });
  
  const allClassTypes = Array.from(new Set(allStats.flatMap(s => Object.keys(s.classTypeCounters))));
  
  const qualifiedCount = allStats.filter(s => s.fullyQualified).length;
  const totalCount = allStats.length;
  
  let html = '<html><head><title>Stronger in 30 - Comprehensive Multi-Level Report</title><style>';
  html += 'body{font-family:"Segoe UI",Tahoma,Geneva,Verdana,sans-serif;margin:20px;background:#f5f5f5}';
  html += '.header{text-align:center;margin-bottom:30px;border-bottom:3px solid #b91c1c;padding-bottom:15px}';
  html += 'h1{color:#1a1a1a;margin:10px 0;font-size:28px}';
  html += 'h2{color:#b91c1c;border-bottom:2px solid #b91c1c;padding-bottom:10px;font-size:18px;margin-top:20px}';
  html += 'h3{color:#333;margin:15px 0 10px 0;font-size:14px;background:#f0f0f0;padding:8px;border-left:4px solid #8b5cf6}';
  html += '.level-section{background:#fff;margin:20px 0;padding:20px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1)}';
  html += '.location-title{font-size:18px;font-weight:bold;color:#333;margin-bottom:15px;background:#f9f9f9;padding:12px;border-left:4px solid #b91c1c}';
  html += '.level-subtitle{font-size:13px;color:#666;font-style:italic;margin-left:20px;padding:8px;background:#f5f5f5;border-left:3px solid #8b5cf6}';
  html += 'table{width:100%;border-collapse:collapse;margin-bottom:20px;margin-left:10px;margin-right:10px}';
  html += 'th{background-color:#b91c1c;color:white;padding:12px;text-align:left;font-weight:bold;border:1px solid #999;font-size:11px}';
  html += 'td{padding:10px;border:1px solid #ddd;font-size:11px}';
  html += 'tr:nth-child(even){background-color:#fafafa}';
  html += '.qualified{background-color:#d4edda;font-weight:bold}';
  html += '.not-qualified{background-color:#f8d7da;font-weight:bold}';
  html += '.center{text-align:center}';
  html += '.summary{background:#fff;padding:20px;margin-top:30px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1)}';
  html += '.summary-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:15px;margin-top:15px}';
  html += '.summary-card{padding:15px;background:#f9f9f9;border-radius:5px;border-left:4px solid #b91c1c;text-align:center}';
  html += '.summary-label{font-size:12px;color:#666;font-weight:bold}';
  html += '.summary-value{font-size:24px;font-weight:bold;color:#b91c1c;margin-top:5px}';
  html += '.meta{text-align:center;color:#999;font-size:11px;margin:15px 0}';
  html += '.legend{font-size:10px;color:#666;margin-top:30px;padding:15px;background:#f5f5f5;border-left:4px solid #999}';
  html += '</style></head><body>';
  
  html += '<div class="header"><h1>Stronger in 30 - Multi-Level Report</h1>';
  html += '<div class="meta">All Levels • Generated on ' + new Date().toLocaleString() + '</div></div>';
  
  Object.entries(byLocationLevel).sort().forEach(([location, levels]) => {
    html += '<div class="level-section"><div class="location-title">📍 ' + location + '</div>';
    
    ['Beginner', 'Intermediate', 'Advanced'].forEach(level => {
      if (!levels[level] || levels[level].length === 0) return;
      
      const members = levels[level];
      const qualified = members.filter(p => p.fullyQualified);
      const notQualified = members.filter(p => !p.fullyQualified);
      
      html += '<h3 style="margin-left:0">' + level + ' Level (' + members.length + ' participants)</h3>';
      html += '<table><thead><tr><th>Name</th><th class="center">Done</th><th class="center">Req.</th><th class="center">Weeks</th><th class="center">Method</th>';
      
      allClassTypes.forEach(ct => {
        html += '<th class="center">' + ct.substring(0, 10) + '</th>';
      });
      
      html += '<th class="center">Status</th></tr></thead><tbody>';
      
      // Qualified section
      if (qualified.length > 0) {
        html += '<tr style="background:rgba(212,237,218,0.6);"><td colspan="100%" style="font-weight:bold;color:#155724;padding:12px;border:2px solid #28a745;">✓ QUALIFIED (' + qualified.length + ')</td></tr>';
        qualified.forEach(p => {
          html += '<tr><td><strong>' + p.name + '</strong></td>';
          html += '<td class="center">' + p.classesCompleted + '</td>';
          html += '<td class="center">' + p.classesRequired + '</td>';
          html += '<td class="center">' + p.weeksQualified + '/4</td>';
          html += '<td class="center" style="font-size:10px;">' + p.qualificationMethod + '</td>';
          
          allClassTypes.forEach(ct => {
            html += '<td class="center">' + (p.classTypeCounters[ct] || 0) + '</td>';
          });
          
          html += '<td class="center qualified">' + p.status + '</td></tr>';
        });
      }
      
      // Not qualified section
      if (notQualified.length > 0) {
        html += '<tr style="background:rgba(248,215,218,0.6);"><td colspan="100%" style="font-weight:bold;color:#721c24;padding:12px;border:2px solid #dc3545;">✗ NOT QUALIFIED (' + notQualified.length + ')</td></tr>';
        notQualified.forEach(p => {
          html += '<tr><td><strong>' + p.name + '</strong></td>';
          html += '<td class="center">' + p.classesCompleted + '</td>';
          html += '<td class="center">' + p.classesRequired + '</td>';
          html += '<td class="center">' + p.weeksQualified + '/4</td>';
          html += '<td class="center" style="font-size:10px;">' + p.qualificationMethod + '</td>';
          
          allClassTypes.forEach(ct => {
            html += '<td class="center">' + (p.classTypeCounters[ct] || 0) + '</td>';
          });
          
          html += '<td class="center not-qualified">' + p.status + '</td></tr>';
        });
      }
      
      html += '</tbody></table>';
    });
    html += '</div>';
  });
  
  html += '<div class="summary"><h2>Summary Report</h2><div class="summary-grid">';
  html += '<div class="summary-card"><div class="summary-label">Total Participants</div><div class="summary-value">' + totalCount + '</div></div>';
  html += '<div class="summary-card"><div class="summary-label">Fully Qualified</div><div class="summary-value" style="color:#28a745;">' + qualifiedCount + '</div></div>';
  html += '<div class="summary-card"><div class="summary-label">Not Qualified</div><div class="summary-value" style="color:#dc3545;">' + (totalCount - qualifiedCount) + '</div></div>';
  html += '<div class="summary-card"><div class="summary-label">Qualification Rate</div><div class="summary-value">' + ((qualifiedCount / totalCount) * 100).toFixed(1) + '%</div></div>';
  html += '</div>';
  
  html += '<div class="legend">';
  html += '<strong>Format Notes:</strong><br>';
  html += '• <em>CARDIO (interchangeable):</em> Cardio Barre, HIIT, Amped Up, Cardio Barre Plus, Trainer\'s Choice<br>';
  html += '• <em>STRENGTH (interchangeable):</em> FIT, Strength Lab, Back Body Blaze<br>';
  html += '• <em>SPECIFIC (non-interchangeable):</em> PowerCycle, Barre 57, Mat 57, Recovery';
  html += '</div></div></body></html>';
  
  const printWindow = window.open('', '', 'height=900,width=1200');
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 250);
}

/**
 * Download unified CSV export
 * @param {Array} allStats - Combined stats from all levels
 */
function downloadUnifiedCSV(allStats) {
  const csv = generateUnifiedCSV(allStats);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `stronger-in-30-all-levels-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Helper to open print dialog for PDF generation
 * Used by individual level export functions
 */
function showPrintDialog(html, title) {
  const printWindow = window.open('', '', 'height=900,width=1200');
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 250);
}
