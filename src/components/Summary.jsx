import React, { useEffect, useRef } from 'react'
import resumeData from '../data/resumeData'

const Summary = () => {
  const sectionRef = useRef(null)
  const { summary } = resumeData

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [])

  // Convert plain text to JSX with bold formatting for numbers/percentages
  const formatSummary = (text) => {
    // Match numbers, percentages, and key phrases
    const pattern = /(\d+\+ years|\d+ percent|\d+%|USD \d+\.\d+M\+|\d+\.\d+ percent|\d+K\+ requests|\d+M\+ active users|individual contributor|technical leader)/gi;
    const parts = text.split(pattern);
    return parts.map((part, index) => {
      if (part.match(pattern)) {
        return <strong key={index}>{part}</strong>;
      }
      return <span key={index}>{part}</span>;
    });
  }

  return (
    <section className="resume-section" ref={sectionRef} data-animate="fade-up">
      <div className="section-header">
        <h2 className="section-title">
          <span className="title-text">Professional Summary</span>
          <span className="title-line"></span>
        </h2>
      </div>
      <div className="section-content">
        <p className="summary-text">
          {formatSummary(summary)}
        </p>
      </div>
    </section>
  )
}

export default Summary
