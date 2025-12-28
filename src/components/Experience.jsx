import React, { useEffect, useRef } from 'react'
import resumeData from '../data/resumeData'

const Experience = () => {
  const sectionRef = useRef(null)
  const { experience } = resumeData

  // Debug: Log experience data
  console.log('Experience component - experience data:', experience)
  console.log('Experience component - experience length:', experience?.length)

  // Safety check
  if (!experience || experience.length === 0) {
    return (
      <section className="resume-section" ref={sectionRef}>
        <div className="section-header">
          <h2 className="section-title">
            <span className="title-text">Professional Experience</span>
            <span className="title-line"></span>
          </h2>
        </div>
        <div className="section-content">
          <p>No experience data available. Experience: {JSON.stringify(experience)}</p>
        </div>
      </section>
    )
  }

  useEffect(() => {
    // Ensure content is visible immediately
    if (sectionRef.current) {
      sectionRef.current.classList.add('animated')
    }
  }, [experience])

  // Format responsibilities with HTML support for <strong> tags
  const formatResponsibility = (text) => {
    const parts = text.split(/(<strong>.*?<\/strong>|\d+%|\d+\+|\d+\.\d+%|USD \d+\.\d+M\+|\d+M\+ users|\d+K\+ users)/g);
    return parts.map((part, index) => {
      if (part.startsWith('<strong>')) {
        const content = part.replace(/<\/?strong>/g, '');
        return <strong key={index}>{content}</strong>;
      }
      if (part.match(/\d+%|\d+\+|\d+\.\d+%|USD \d+\.\d+M\+|\d+M\+ users|\d+K\+ users/)) {
        return <strong key={index}>{part}</strong>;
      }
      return part;
    });
  }

  return (
    <section className="resume-section" ref={sectionRef}>
      <div className="section-header">
        <h2 className="section-title">
          <span className="title-text">Professional Experience</span>
          <span className="title-line"></span>
        </h2>
      </div>
      <div className="section-content">
        <div className="timeline">
          {experience && experience.length > 0 ? experience.map((exp, index) => (
            <div key={index} className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <div className="experience-header">
                  <div className="experience-title-group">
                    <h3 className="job-title">{exp.title}</h3>
                    <p className="company-name">
                      {exp.website ? (
                        <a 
                          href={exp.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="company-link"
                        >
                          {exp.company}
                        </a>
                      ) : (
                        exp.company
                      )}
                      {exp.isYC && (
                        <span className="yc-badge">YC {exp.ycBatch}</span>
                      )}
                    </p>
                    {(exp.product || exp.domain) && (
                      <p className="company-product-domain">
                        {exp.product && <span className="product-info">📦 {exp.product}</span>}
                        {exp.product && exp.domain && <span className="separator"> • </span>}
                        {exp.domain && <span className="domain-info">🏢 {exp.domain}</span>}
                      </p>
                    )}
                  </div>
                  <div className="experience-meta">
                    <span className="location">{exp.location}</span>
                    <span className="date-range">{exp.dateRange}</span>
                  </div>
                </div>
                <ul className="job-responsibilities">
                  {exp.responsibilities.map((resp, idx) => (
                    <li key={idx}>{formatResponsibility(resp)}</li>
                  ))}
                </ul>
              </div>
            </div>
          )) : <p>Loading experience data...</p>}
        </div>
      </div>
    </section>
  )
}

export default Experience
