import React, { useEffect, useRef } from 'react'

const certifications = [
  'CKA',
  'HashiCorp Terraform Associate',
  'Red Hat Certified Engineer/System Administrator',
  'CISSP Candidate'
]

const Education = () => {
  const sectionRef = useRef(null)

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
            <p className="education-detail">B.E. Information Technology, UIT RGPV, Bhopal</p>
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

