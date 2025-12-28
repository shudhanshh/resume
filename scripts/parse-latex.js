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
  const nameMatch = texContent.match(/\\textbf\{SHUDHANSHU BADKUR\}/i);
  const contactLineMatch = texContent.match(/Email:\s*([^|]+)\s*\|\s*Phone:\s*([^|]+)\s*\|\s*LinkedIn:\s*([^|]+)\s*\|\s*GitHub:\s*([^\n\\]+)/);
  const locationMatch = texContent.match(/Location:\s*([^\n\\]+)/);

  data.contact = {
    name: 'Shudhanshu Badkur',
    email: contactLineMatch ? contactLineMatch[1].trim() : '',
    phone: contactLineMatch ? contactLineMatch[2].trim() : '',
    linkedin: contactLineMatch ? contactLineMatch[3].trim() : '',
    github: contactLineMatch ? contactLineMatch[4].trim() : '',
    location: locationMatch ? locationMatch[1].trim() : ''
  };

  // Extract Professional Summary - ATS format
  const summaryMatch = texContent.match(/\\section\*\{PROFESSIONAL SUMMARY\}[\s\S]*?\n([^\n]+(?:\n(?!\\vspace|\\section)[^\n]+)*)/i);
  if (summaryMatch) {
    data.summary = summaryMatch[1]
      .replace(/\\%/g, '%')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Extract Technical Skills - ATS format
  const skillsSection = texContent.match(/\\section\*\{TECHNICAL SKILLS\}[\s\S]*?\\section\*\{PROFESSIONAL EXPERIENCE\}/i);
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

  // Extract Professional Experience - ATS format
  const experienceSection = texContent.match(/\\section\*\{PROFESSIONAL EXPERIENCE\}[\s\S]*?\\section\*\{EDUCATION/i);
  if (experienceSection) {
    const expText = experienceSection[0];
    
    // Match each job entry - ATS-friendly format: Title | Company | Location \n Date \n Product/Domain
    const jobPattern = /\\textbf\{([^}]+)\}\s*\|\s*([^|]+)\s*\|\s*([^\\]+)\s*\\\\\s*\\textit\{([^}]+)\}[\s\S]*?Product:\s*([^|]+)\s*\|\s*Domain:\s*([^\n\\]+)[\s\S]*?\\begin\{itemize\}([\s\S]*?)\\end\{itemize\}/g;
    let match;
    while ((match = jobPattern.exec(expText)) !== null) {
      const title = match[1].trim();
      const company = match[2].trim();
      const location = match[3].trim();
      const dateRange = match[4].trim();
      const product = match[5].trim();
      const domain = match[6].trim();
      
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
      while ((itemMatch = itemPattern.exec(match[7])) !== null) {
        let resp = itemMatch[1].replace(/\\%/g, '%').replace(/\s+/g, ' ').trim();
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

  // Extract Education and Certifications - ATS format
  const eduSection = texContent.match(/\\section\*\{EDUCATION AND CERTIFICATIONS\}[\s\S]*?\\end\{document\}/i);
  if (eduSection) {
    const eduText = eduSection[0];
    
    // Extract Education
    const eduMatch = eduText.match(/\\textbf\{Education:\}\s*([^\\]+)/);
    if (eduMatch) {
      data.education.degree = eduMatch[1].trim();
    }

    // Extract Certifications
    const certMatch = eduText.match(/\\textbf\{Certifications:\}\s*([^\\]+)/);
    if (certMatch) {
      data.certifications = certMatch[1]
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
