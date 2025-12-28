import React, { useEffect, useRef } from 'react'

const Summary = () => {
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
          <span className="title-text">Professional Summary</span>
          <span className="title-line"></span>
        </h2>
      </div>
      <div className="section-content">
        <p className="summary-text">
          DevOps Architect / Staff Platform Engineer with <strong>8+ years</strong> of experience designing and scaling cloud-native, multi-tenant platforms for enterprise SaaS and fintech systems. Proven track record as both an <strong>individual contributor</strong> and <strong>technical leader</strong>, delivering platform architecture initiatives that achieved <strong>60% infrastructure cost savings</strong> (USD 1.4M+ monthly) while maintaining <strong>99.99% uptime</strong> for systems handling <strong>500K+ requests per minute</strong> and <strong>5M+ active users</strong>. Expert in Kubernetes, GitOps, multi-cloud strategy, and security compliance (ISO 27001, PCI-DSS, SOC 2), with strong leadership in mentoring engineers and driving org-wide infrastructure standards.
        </p>
      </div>
    </section>
  )
}

export default Summary

