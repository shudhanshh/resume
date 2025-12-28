import React, { useEffect, useRef } from 'react'
import resumeData from '../data/resumeData'

const Experience = () => {
  const sectionRef = useRef(null)
  const { experience } = resumeData

  useEffect(() => {
    // Ensure content is visible immediately
    if (sectionRef.current) {
      sectionRef.current.classList.add('animated')
    }
  }, [])

  // Format responsibilities with HTML support for <strong> tags
  const formatResponsibility = (text) => {
    if (!text) return ''
    const parts = text.split(/(\d+%|\d+\+|\d+\.\d+%|USD \d+\.\d+M\+|\d+M\+ users|\d+K\+ users)/g);
    return parts.map((part, index) => {
      if (part.match(/\d+%|\d+\+|\d+\.\d+%|USD \d+\.\d+M\+|\d+M\+ users|\d+K\+ users/)) {
        return <strong key={index}>{part}</strong>;
      }
      return <span key={index}>{part}</span>;
    });
  }

  if (!experience || !Array.isArray(experience) || experience.length === 0) {
    return (
      <section className="resume-section" ref={sectionRef}>
        <div className="section-header">
          <h2 className="section-title">
            <span className="title-text">Professional Experience</span>
            <span className="title-line"></span>
          </h2>
        </div>
        <div className="section-content">
          <p>No experience data available.</p>
        </div>
      </section>
    )
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
          {experience.map((exp, index) => {
            if (!exp || !exp.responsibilities || !Array.isArray(exp.responsibilities)) {
              return null
            }
            
            return (
              <div key={index} className="timeline-item">
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <div className="experience-header">
                    <div className="experience-title-group">
                      <h3 className="job-title">{exp.title || 'Untitled'}</h3>
                      <p className="company-name">
                        {exp.website ? (
                          <a 
                            href={exp.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="company-link"
                          >
                            {exp.company || 'Unknown Company'}
                          </a>
                        ) : (
                          exp.company || 'Unknown Company'
                        )}
                        {exp.isYC && exp.ycBatch && (
                          <span className="yc-badge">YC {exp.ycBatch}</span>
                        )}
                      </p>
                      {exp.product && (
                        <p className="company-product-domain">
                          <span className="product-info">📦 {exp.product}</span>
                          {exp.domain && (
                            <>
                              <span className="separator"> • </span>
                              <span className="domain-info">🏢 {exp.domain}</span>
                            </>
                          )}
                        </p>
                      )}
                    </div>
                    <div className="experience-meta">
                      {exp.location && <span className="location">{exp.location}</span>}
                      {exp.dateRange && <span className="date-range">{exp.dateRange}</span>}
                    </div>
                  </div>
                  {exp.responsibilities && exp.responsibilities.length > 0 && (
                    <ul className="job-responsibilities">
                      {exp.responsibilities.map((resp, idx) => (
                        <li key={idx}>{formatResponsibility(resp)}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Experience
