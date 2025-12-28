import React, { useEffect, useRef } from 'react'
import resumeData from '../data/resumeData'

const Education = () => {
  const sectionRef = useRef(null)
  const { education, certifications } = resumeData

  useEffect(() => {
    // Add animation class immediately for elements in viewport
    if (sectionRef.current) {
      const rect = sectionRef.current.getBoundingClientRect()
      const isInViewport = rect.top < window.innerHeight && rect.bottom > 0
      if (isInViewport) {
        setTimeout(() => {
          sectionRef.current?.classList.add('animated')
        }, 50)
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('animated')
            }, 50)
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

  return (
    <section className="resume-section" ref={sectionRef} data-animate="fade-up">
      <div className="section-header">
        <h2 className="section-title">
          <span className="title-text">Education and Certifications</span>
          <span className="title-line"></span>
        </h2>
      </div>
      <div className="section-content">
        <div className="education-cert-container">
          <div className="education-section">
            <h3 className="subsection-title">Education</h3>
            <p className="education-detail">{education.degree}</p>
          </div>
          <div className="certifications-section">
            <h3 className="subsection-title">Certifications</h3>
            <div className="cert-badges">
              {certifications.map((cert, index) => (
                <span key={index} className="cert-badge">{cert}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Education
