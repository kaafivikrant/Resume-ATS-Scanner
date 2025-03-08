import { jsPDF } from 'jspdf';
import { AnalysisResult } from '../types';

export const generatePDF = async (analysisResults: AnalysisResult) => {
  const doc = new jsPDF();
  let yPos = 20;
  const lineHeight = 7;
  const margin = 20;
  const pageWidth = doc.internal.pageSize.width;
  
  // Helper function to add text and handle overflow
  const addText = (text: string, y: number, options: any = {}) => {
    const fontSize = options.fontSize || 12;
    doc.setFontSize(fontSize);
    
    if (options.bold) {
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }
    
    const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
    doc.text(lines, margin, y);
    return y + (lines.length * lineHeight);
  };
  
  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Resume Analysis Report', margin, yPos);
  yPos += lineHeight * 2;
  
  // Overall Score
  yPos = addText(`Overall Score: ${analysisResults.overallScore}/100`, yPos, { fontSize: 16, bold: true });
  yPos += lineHeight;
  
  // Categories
  Object.entries(analysisResults.categories).forEach(([category, data]) => {
    // Check if we need a new page
    if (yPos > doc.internal.pageSize.height - 50) {
      doc.addPage();
      yPos = 20;
    }
    
    // Format category name
    const categoryName = category.replace(/([A-Z])/g, ' $1').trim();
    yPos = addText(`${categoryName}`, yPos, { fontSize: 14, bold: true });
    yPos += lineHeight / 2;
    
    // Add score
    yPos = addText(`Score: ${data.score}/100`, yPos);
    yPos += lineHeight / 2;
    
    // Add category-specific details
    if ('matches' in data) {
      yPos = addText(`Matching Keywords: ${data.matches.join(', ')}`, yPos);
      yPos = addText(`Missing Keywords: ${data.missing.join(', ')}`, yPos);
    }
    
    if ('feedback' in data) {
      yPos = addText(`Feedback: ${data.feedback}`, yPos);
    }
    
    if ('words' in data) {
      yPos = addText(`Words: ${data.words.join(', ')}`, yPos);
    }
    
    if ('errors' in data) {
      yPos = addText(`Errors: ${data.errors.join(', ')}`, yPos);
    }
    
    if ('appropriate' in data) {
      yPos = addText(`Appropriate Terms: ${data.appropriate.join(', ')}`, yPos);
      yPos = addText(`Excessive Terms: ${data.excessive.join(', ')}`, yPos);
    }
    
    if ('sections' in data) {
      yPos = addText(`Sections to Review: ${data.sections.join(', ')}`, yPos);
    }
    
    yPos += lineHeight;
  });
  
  // Add recommendations
  if (yPos > doc.internal.pageSize.height - 70) {
    doc.addPage();
    yPos = 20;
  }
  
  yPos = addText('Recommendations', yPos, { fontSize: 16, bold: true });
  yPos += lineHeight;
  
  analysisResults.recommendations.forEach((recommendation) => {
    if (yPos > doc.internal.pageSize.height - 30) {
      doc.addPage();
      yPos = 20;
    }
    yPos = addText(`• ${recommendation}`, yPos);
    yPos += lineHeight / 2;
  });
  
  // Add timestamp
  yPos += lineHeight;
  const date = new Date(analysisResults.timestamp).toLocaleString();
  yPos = addText(`Report generated on: ${date}`, yPos, { fontSize: 10 });
  
  // Save the PDF
  doc.save('resume-analysis-report.pdf');
};