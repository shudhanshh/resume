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

  // Extract contact information - more flexible parsing
  const nameMatch = texContent.match(/\\textbf\{Shudhanshu Badkur\}/);
  const emailMatch = texContent.match(/Email:\s*([^\n\\]+)/);
  const phoneMatch = texContent.match(/Phone:\s*([^\n\\]+)/);
  const linkedinMatch = texContent.match(/LinkedIn:\s*([^\n\\]+)/);
  const githubMatch = texContent.match(/GitHub:\s*([^\n\\]+)/);
  const locationMatch = texContent.match(/Location:\s*([^\n\\]+)/);

  data.contact = {
    name: 'Shudhanshu Badkur',
    email: emailMatch ? emailMatch[1].trim() : '',
    phone: phoneMatch ? phoneMatch[1].trim() : '',
    linkedin: linkedinMatch ? linkedinMatch[1].trim() : '',
    github: githubMatch ? githubMatch[1].trim() : '',
    location: locationMatch ? locationMatch[1].trim() : ''
  };

  // Extract Professional Summary
  const summaryMatch = texContent.match(/\\section\*\{Professional Summary\}[\s\S]*?\\hrule[\s\S]*?\\vspace\{2pt\}[\s\S]*?([^\n]+(?:\n(?!\\vspace|\\section)[^\n]+)*)/);
  if (summaryMatch) {
    data.summary = summaryMatch[1]
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Extract Technical Skills - better parsing
  const skillsSection = texContent.match(/\\section\*\{Technical Skills\}[\s\S]*?\\section\*\{Professional Experience\}/);
  if (skillsSection) {
    const skillsText = skillsSection[0];
    
    // Extract each skill category - handle escaped ampersands
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

  // Extract Professional Experience - improved parsing
  const experienceSection = texContent.match(/\\section\*\{Professional Experience\}[\s\S]*?\\section\*\{Education/);
  if (experienceSection) {
    const expText = experienceSection[0];
    
    // Match each job entry - improved regex
    const jobPattern = /\\textbf\{([^}]+)\},\s*\\textit\{([^}]+)\}[\s\S]*?\\begin\{itemize\}([\s\S]*?)\\end\{itemize\}/g;
    let match;
    while ((match = jobPattern.exec(expText)) !== null) {
      const title = match[1].trim();
      const companyLocationDate = match[2].trim();
      
      // Parse company, location, date
      // Format: "Company, Location, Date Range"
      const parts = companyLocationDate.split(',').map(s => s.trim());
      let company = parts[0] || '';
      let location = parts[1] || '';
      let dateRange = parts[2] || '';
      
      // Handle YC badge
      const ycMatch = company.match(/\(YC\s+([^)]+)\)/);
      const isYC = !!ycMatch;
      if (ycMatch) {
        company = company.replace(/\s*\(YC[^)]+\)/, '').trim();
      }
      
      // Extract responsibilities
      const responsibilities = [];
      const itemPattern = /\\item\s*([^\n]+(?:\n(?!\\item|\\end|\\vspace)[^\n]+)*)/g;
      let itemMatch;
      while ((itemMatch = itemPattern.exec(match[3])) !== null) {
        responsibilities.push(itemMatch[1].replace(/\s+/g, ' ').trim());
      }

      data.experience.push({
        title,
        company,
        location,
        dateRange,
        isYC,
        ycBatch: ycMatch ? ycMatch[1] : null,
        responsibilities
      });
    }
  }

  // Extract Education and Certifications
  const eduSection = texContent.match(/\\section\*\{Education and Certifications\}[\s\S]*?\\end\{document\}/);
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
