#!/usr/bin/env node

/**
 * LaTeX Resume Parser
 * Extracts content from main.tex and generates JSON data for React components
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to clean LaTeX commands from text
function cleanLaTeX(text) {
  if (!text) return '';
  
  return text
    // Remove LaTeX font size commands
    .replace(/\\footnotesize\s*/g, '')
    .replace(/\\small\s*/g, '')
    .replace(/\\normalsize\s*/g, '')
    .replace(/\\large\s*/g, '')
    .replace(/\\Large\s*/g, '')
    .replace(/\\LARGE\s*/g, '')
    .replace(/\\huge\s*/g, '')
    .replace(/\\Huge\s*/g, '')
    // Remove textbf but keep content
    .replace(/\\textbf\{([^}]+)\}/g, '$1')
    // Remove textit but keep content
    .replace(/\\textit\{([^}]+)\}/g, '$1')
    // Remove other common LaTeX commands
    .replace(/\\emph\{([^}]+)\}/g, '$1')
    .replace(/\\text\{([^}]+)\}/g, '$1')
    // Remove escaped characters
    .replace(/\\%/g, '%')
    .replace(/\\&/g, '&')
    .replace(/\\#/g, '#')
    .replace(/\\_/g, '_')
    .replace(/\\\{/g, '{')
    .replace(/\\\}/g, '}')
    // Remove remaining LaTeX commands (generic)
    .replace(/\\[a-zA-Z]+\{([^}]*)\}/g, '$1')
    .replace(/\\[a-zA-Z]+/g, '')
    // Clean up whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

function parseLaTeX(texContent) {
  const data = {
    contact: {},
    summary: '',
    skills: {},
    experience: [],
    education: {},
    certifications: []
  };

  // Extract contact information - ATS-friendly format with pipe separators
  const nameMatch = texContent.match(/\\textbf\{SHUDHANSHU BADKUR\}/i) || 
                    texContent.match(/\\Large\\bfseries\s+SHUDHANSHU BADKUR/i) ||
                    texContent.match(/SHUDHANSHU BADKUR/i);
  
  // Match contact info - handle LaTeX spacing commands (\quad, etc.)
  const contactLineMatch = texContent.match(/Email:\s*([^|\\\n]+?)\s*(?:\||\\quad|\$\\|\$)\s*Phone:\s*([^|\\\n]+?)\s*(?:\||\\quad|\$\\|\$)\s*LinkedIn:\s*([^|\\\n]+?)\s*(?:\||\\quad|\$\\|\$)\s*GitHub:\s*([^\n\\]+)/);
  const locationMatch = texContent.match(/Location:\s*([^\n\\]+)/);

  data.contact = {
    name: 'Shudhanshu Badkur',
    email: contactLineMatch ? cleanLaTeX(contactLineMatch[1]).trim() : 'shudhanshubadkur97@gmail.com',
    phone: contactLineMatch ? cleanLaTeX(contactLineMatch[2]).trim() : '+91-78795-88884',
    linkedin: contactLineMatch ? cleanLaTeX(contactLineMatch[3]).trim() : 'linkedin.com/in/shudhanshhh',
    github: contactLineMatch ? cleanLaTeX(contactLineMatch[4]).trim() : 'github.com/shudhanshh',
    location: locationMatch ? cleanLaTeX(locationMatch[1]).trim() : 'Bengaluru, Karnataka, India'
  };

  // Extract Professional Summary - Updated format
  const summaryMatch = texContent.match(/\\noindent\\textbf\{\\large PROFESSIONAL SUMMARY\}[\s\S]*?\\\\([\s\S]*?)(?=\\vspace|\\noindent\\textbf|\\section)/i) ||
                       texContent.match(/\\section\*\{PROFESSIONAL SUMMARY\}[\s\S]*?\n(?:\\footnotesize\s*)?([^\n]+(?:\n(?!\\vspace|\\section)[^\n]+)*)/i);
  if (summaryMatch) {
    data.summary = cleanLaTeX(summaryMatch[1]);
  }

  // Extract Technical Skills - Updated format
  const skillsSection = texContent.match(/\\noindent\\textbf\{\\large TECHNICAL SKILLS\}[\s\S]*?\\noindent\\textbf\{\\large PROFESSIONAL EXPERIENCE\}/i) ||
                        texContent.match(/\\section\*\{TECHNICAL SKILLS\}[\s\S]*?\\section\*\{PROFESSIONAL EXPERIENCE\}/i);
  if (skillsSection) {
    const skillsText = skillsSection[0];
    
    // Extract each skill category - ATS format with full names
    const skillPattern = /\\textbf\{([^}]+):\}\s*([^\\]+)/g;
    let match;
    while ((match = skillPattern.exec(skillsText)) !== null) {
      const category = match[1].replace(/\\&/g, '&').trim();
      // Better parsing that handles parentheses
      const skillsStr = match[2].trim();
      const skills = [];
      let current = '';
      let parenDepth = 0;
      
      for (let i = 0; i < skillsStr.length; i++) {
        const char = skillsStr[i];
        if (char === '(') parenDepth++;
        if (char === ')') parenDepth--;
        
        if (char === ',' && parenDepth === 0) {
          if (current.trim()) skills.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      if (current.trim()) skills.push(current.trim());
      
      data.skills[category] = skills.filter(s => s.length > 0);
    }
  }

  // Extract Professional Experience - Updated format
  const experienceSection = texContent.match(/\\noindent\\textbf\{\\large PROFESSIONAL EXPERIENCE\}[\s\S]*?\\noindent\\textbf\{\\large EDUCATION/i) ||
                            texContent.match(/\\section\*\{PROFESSIONAL EXPERIENCE\}[\s\S]*?\\section\*\{EDUCATION/i);
  if (experienceSection) {
    const expText = experienceSection[0];
    
    // Match each job entry - Updated format: Title | Company | Location \n Date | Product/Domain
    const jobPattern = /\\textbf\{([^}]+)\}\s*\|\s*\\textbf\{([^}]+)\}\s*\|\s*([^\\]+)\s*\\\\\s*\\textit\{([^}]+)\}\s*\|\s*([^\n\\]+)[\s\S]*?\\begin\{itemize\}([\s\S]*?)\\end\{itemize\}/g;
    let match;
    while ((match = jobPattern.exec(expText)) !== null) {
      const title = match[1].trim();
      const company = match[2].trim();
      const location = match[3].trim();
      const dateRange = match[4].trim();
      const productDomain = match[5].trim();
      // Split product and domain if separated by |
      const productDomainParts = productDomain.split('|').map(s => s.trim());
      const product = productDomainParts[0] || '';
      const domain = productDomainParts[1] || '';
      
      // Handle YC badge in company name
      const ycMatch = company.match(/\(Y Combinator\s+([^)]+)\)/i) || company.match(/\(YC\s+([^)]+)\)/i);
      let cleanCompany = company;
      let isYC = false;
      let ycBatch = null;
      
      if (ycMatch) {
        isYC = true;
        ycBatch = ycMatch[1].trim();
        cleanCompany = company.replace(/\s*\([^)]+\)/, '').trim();
      }
      
      // Extract responsibilities
      const responsibilities = [];
      const itemPattern = /\\item\s*([^\n]+(?:\n(?!\\item|\\end|\\vspace)[^\n]+)*)/g;
      let itemMatch;
      while ((itemMatch = itemPattern.exec(match[6])) !== null) {
        let resp = cleanLaTeX(itemMatch[1]);
        responsibilities.push(resp);
      }

      data.experience.push({
        title,
        company: cleanCompany,
        location,
        dateRange,
        isYC,
        ycBatch,
        product,
        domain,
        responsibilities
      });
    }
  }

  // Extract Education and Certifications - Updated format
  const eduSection = texContent.match(/\\noindent\\textbf\{\\large EDUCATION AND CERTIFICATIONS\}[\s\S]*?\\end\{document\}/i) ||
                    texContent.match(/\\section\*\{EDUCATION AND CERTIFICATIONS\}[\s\S]*?\\end\{document\}/i);
  if (eduSection) {
    const eduText = eduSection[0];
    
    // Extract Education
    const eduMatch = eduText.match(/\\textbf\{Education:\}\s*([^\\]+)/);
    if (eduMatch) {
      data.education.degree = cleanLaTeX(eduMatch[1]);
    }

    // Extract Certifications
    const certMatch = eduText.match(/\\textbf\{Certifications:\}\s*([^\\]+)/);
    if (certMatch) {
      data.certifications = cleanLaTeX(certMatch[1])
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);
    }
  }

  return data;
}

// Read LaTeX file
const texPath = path.join(__dirname, '..', 'main.tex');
const texContent = fs.readFileSync(texPath, 'utf-8');

// Parse and generate JSON
const data = parseLaTeX(texContent);

// Write to src/data/resume-data.json
const outputPath = path.join(__dirname, '..', 'src', 'data', 'resume-data.json');
const outputDir = path.dirname(outputPath);

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');

console.log('✅ Successfully parsed LaTeX and generated resume-data.json');
console.log(`📄 Output: ${outputPath}`);
