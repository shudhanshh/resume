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
    // Remove href but keep content
    .replace(/\\href\{[^}]+\}\{([^}]+)\}/g, '$1')
    // Remove textbf but keep content
    .replace(/\\textbf\{([^}]+)\}/g, '$1')
    // Remove textit but keep content
    .replace(/\\textit\{([^}]+)\}/g, '$1')
    // Remove other common LaTeX commands
    .replace(/\\emph\{([^}]+)\}/g, '$1')
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\\textbar/g, '|')
    // Remove escaped characters
    .replace(/\\%/g, '%')
    .replace(/\\&/g, '&')
    .replace(/\\#/g, '#')
    .replace(/\\_/g, '_')
    .replace(/\\\{/g, '{')
    .replace(/\\\}/g, '}')
    .replace(/\\--/g, '--')
    // Remove remaining LaTeX commands (generic) - but be careful with role command
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

  // Extract contact information - handle href format
  const nameMatch = texContent.match(/\\LARGE\\bfseries\s+Shudhanshu Badkur/i) ||
                    texContent.match(/Shudhanshu Badkur/i);
  
  // Match contact info with href links
  const emailMatch = texContent.match(/\\href\{mailto:([^}]+)\}\{([^}]+)\}/);
  const phoneMatch = texContent.match(/\+91-78795-88884/);
  const linkedinMatch = texContent.match(/\\href\{https:\/\/linkedin\.com\/in\/([^}]+)\}\{LinkedIn\}/);
  const githubMatch = texContent.match(/\\href\{https:\/\/github\.com\/([^}]+)\}\{GitHub\}/);
  const locationMatch = texContent.match(/Bengaluru, India/);

  data.contact = {
    name: 'Shudhanshu Badkur',
    email: emailMatch ? emailMatch[2].trim() : 'shudhanshubadkur97@gmail.com',
    phone: phoneMatch ? '+91-78795-88884' : '+91-78795-88884',
    linkedin: linkedinMatch ? `linkedin.com/in/${linkedinMatch[1]}` : 'linkedin.com/in/shudhanshhh',
    github: githubMatch ? `github.com/${githubMatch[1]}` : 'github.com/shudhanshh',
    location: locationMatch ? 'Bengaluru, India' : 'Bengaluru, India'
  };

  // Extract Professional Summary - handle \section{} format
  const summaryMatch = texContent.match(/\\section\{Professional Summary\}[\s\S]*?\n([^\n]+(?:\n(?!\\section|\\vspace)[^\n]+)*)/i) ||
                       texContent.match(/\\section\*\{PROFESSIONAL SUMMARY\}[\s\S]*?\n(?:\\footnotesize\s*)?([^\n]+(?:\n(?!\\vspace|\\section)[^\n]+)*)/i);
  if (summaryMatch) {
    data.summary = cleanLaTeX(summaryMatch[1]);
  }

  // Extract Technical Skills - handle \section{} format
  const skillsSection = texContent.match(/\\section\{Technical Skills\}[\s\S]*?\\section\{Professional Experience\}/i) ||
                        texContent.match(/\\section\*\{TECHNICAL SKILLS\}[\s\S]*?\\section\*\{PROFESSIONAL EXPERIENCE\}/i);
  if (skillsSection) {
    const skillsText = skillsSection[0];
    
    // Extract each skill category - handle new format with & in category names
    const skillPattern = /\\textbf\{([^}]+):\}\s*([^\\]+)/g;
    let match;
    while ((match = skillPattern.exec(skillsText)) !== null) {
      let category = match[1].replace(/\\&/g, '&').trim();
      // Handle special cases like "Cloud & Infrastructure"
      category = category.replace(/\\&/g, '&');
      
      // Better parsing that handles parentheses and pipes
      const skillsStr = match[2].trim();
      const skills = [];
      let current = '';
      let parenDepth = 0;
      
      // Split by comma, but respect parentheses and handle pipes
      for (let i = 0; i < skillsStr.length; i++) {
        const char = skillsStr[i];
        if (char === '(') parenDepth++;
        if (char === ')') parenDepth--;
        
        if (char === ',' && parenDepth === 0) {
          if (current.trim()) {
            const skill = cleanLaTeX(current.trim());
            if (skill && !skill.includes('Professional Experience')) skills.push(skill);
          }
          current = '';
        } else if (char === '|' && parenDepth === 0 && current.trim().length > 0) {
          // Handle pipe separator (like in "Go, Python, Bash, HCL | Messaging: Kafka...")
          if (current.trim()) {
            const skill = cleanLaTeX(current.trim());
            if (skill && !skill.includes('Professional Experience')) skills.push(skill);
          }
          current = '';
          break; // Stop at pipe, next category will be handled separately
        } else {
          current += char;
        }
      }
      if (current.trim()) {
        const skill = cleanLaTeX(current.trim());
        if (skill) skills.push(skill);
      }
      
      // Filter out skills that contain section markers or are empty
      data.skills[category] = skills.filter(s => {
        return s.length > 0 && 
               !s.includes('Professional Experience') && 
               !s.includes('============================================') &&
               !s.includes('%');
      });
    }
  }

  // Extract Professional Experience - handle \role{} command format
  const experienceSection = texContent.match(/\\section\{Professional Experience\}[\s\S]*?\\section\{Education/i) ||
                            texContent.match(/\\section\*\{PROFESSIONAL EXPERIENCE\}[\s\S]*?\\section\*\{EDUCATION/i);
  if (experienceSection) {
    const expText = experienceSection[0];
    
    // Match \role{title}{company}{location}{dates} format
    const rolePattern = /\\role\{([^}]+)\}\{([^}]+)\}\{([^}]+)\}\{([^}]+)\}/g;
    let roleMatch;
    const roles = [];
    
    while ((roleMatch = rolePattern.exec(expText)) !== null) {
      roles.push({
        title: roleMatch[1].trim(),
        company: roleMatch[2].trim(),
        location: roleMatch[3].trim(),
        dateRange: roleMatch[4].trim().replace(/\\--/g, '--'),
        startPos: roleMatch.index
      });
    }
    
    // For each role, extract the product description and responsibilities
    for (let i = 0; i < roles.length; i++) {
      const role = roles[i];
      const nextRoleStart = i < roles.length - 1 ? roles[i + 1].startPos : expText.length;
      const roleSection = expText.substring(role.startPos, nextRoleStart);
      
      // Extract product/description (italic text after role)
      const productMatch = roleSection.match(/\\textit\{[^}]*\\small\s*([^}]+)\}/);
      const product = productMatch ? cleanLaTeX(productMatch[1]) : '';
      
      // Extract responsibilities - handle multi-line items
      const responsibilities = [];
      const itemizeMatch = roleSection.match(/\\begin\{itemize\}([\s\S]*?)\\end\{itemize\}/);
      if (itemizeMatch) {
        const itemizeContent = itemizeMatch[1];
        // Split by \item and process each one
        const items = itemizeContent.split(/\\item\s+/).filter(item => item.trim().length > 0);
        for (const item of items) {
          // Remove any trailing \end or \vspace commands
          const cleanItem = item.replace(/\\end.*$/, '').replace(/\\vspace.*$/, '').trim();
          if (cleanItem) {
            const resp = cleanLaTeX(cleanItem);
            if (resp) responsibilities.push(resp);
          }
        }
      }
      
      // Handle YC badge in company name
      const ycMatch = role.company.match(/\(YC\s+([^)]+)\)/i) || role.company.match(/\(Y Combinator\s+([^)]+)\)/i);
      let cleanCompany = role.company;
      let isYC = false;
      let ycBatch = null;
      
      if (ycMatch) {
        isYC = true;
        ycBatch = ycMatch[1].trim();
        cleanCompany = role.company.replace(/\s*\([^)]+\)/, '').trim();
      }
      
      data.experience.push({
        title: cleanLaTeX(role.title),
        company: cleanCompany,
        location: role.location,
        dateRange: role.dateRange,
        isYC,
        ycBatch,
        product,
        domain: '',
        responsibilities
      });
    }
  }

  // Extract Education and Certifications - handle \section{} format
  const eduSection = texContent.match(/\\section\{Education[^}]*\}[\s\S]*?\\end\{document\}/i) ||
                    texContent.match(/\\section\*\{EDUCATION[^}]*\}[\s\S]*?\\end\{document\}/i);
  if (eduSection) {
    const eduText = eduSection[0];
    
    // Extract Education - handle "B.E. Information Technology -- UIT RGPV, Bhopal" format
    const eduMatch = eduText.match(/\\textbf\{([^}]+)\}\s*--\s*([^\\]+)/);
    if (eduMatch) {
      data.education.degree = cleanLaTeX(`${eduMatch[1]} -- ${eduMatch[2]}`);
    }

    // Extract Certifications - handle "CKA | HashiCorp..." format
    const certMatch = eduText.match(/\\textbf\{Certifications:\}\s*([^\\]+)/);
    if (certMatch) {
      data.certifications = cleanLaTeX(certMatch[1])
        .split('|')
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
