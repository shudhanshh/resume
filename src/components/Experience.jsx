import React, { useEffect, useRef } from 'react'

const experiences = [
  {
    title: 'DevOps Architect',
    company: 'Virima',
    location: 'Bengaluru, India',
    dateRange: '09/2025 - Present',
    responsibilities: [
      'Leading cloud and platform architecture for enterprise SaaS products with focus on scalability, reliability, and security',
      'Designing and governing multi-tenant Kubernetes infrastructure using GitOps, Terraform, and policy-as-code (OPA)',
      'Driving cloud cost optimization, observability standards, and production readiness across engineering teams',
      'Acting as technical authority for CI/CD, Kubernetes, and cloud-native best practices',
      'Partnering with leadership and security teams to align infrastructure with enterprise compliance and SLA requirements'
    ]
  },
  {
    title: 'Staff Engineer - DevOps',
    company: 'Celona',
    location: 'Bengaluru, India',
    dateRange: '03/2025 - 08/2025',
    responsibilities: [
      'As an <strong>individual contributor</strong>, built ground-up multi-cloud / multi-tenant infrastructure supporting 50+ microservices with GitOps and security-first design',
      'Architected SOC 2 compliance workflows and mentored 8+ engineers on cloud-native best practices',
      'Developed MLOps pipelines using Kubeflow, MLflow, and Apache Airflow on GKE with Seldon for real-time analytics',
      'Defined platform architecture standards (networking, IAM, GitOps, tenancy) adopted across product teams'
    ]
  },
  {
    title: 'Associate Technical Lead - DevOps and InfoSec',
    company: 'OkCredit',
    location: 'Bengaluru, India',
    dateRange: '04/2021 - 03/2025',
    isYC: true,
    ycBatch: 'YC W18',
    responsibilities: [
      'Led and scaled an 8-person DevOps team owning production infrastructure for a fintech platform serving <strong>5M+ users</strong> at this <strong>Y Combinator-backed startup</strong>',
      'Excelled as both an <strong>individual contributor</strong> and team lead, achieving <strong>60% infrastructure cost reduction</strong> (USD 1.4M+ monthly) through automated scaling and multi-cloud optimization',
      'Spearheaded ISO 27001:2022 certification including policy development, audits, and vendor risk management',
      'Implemented PCI-DSS compliance, security monitoring, and incident response frameworks',
      'Deployed GitOps workflows using ArgoCD reducing deployment time by <strong>40%</strong> across 90+ microservices',
      'Enhanced observability stack reducing MTTR by <strong>15%</strong> and improving system uptime by <strong>25%</strong>',
      'Acted as platform owner for Kubernetes and CI/CD, influencing architecture decisions across 25+ engineering teams'
    ]
  },
  {
    title: 'Site Reliability Engineer',
    company: 'Runnel',
    location: 'Remote, India',
    dateRange: '11/2020 - 04/2021',
    responsibilities: [
      'As an <strong>individual contributor</strong>, maintained <strong>99.99% availability</strong> across AKS, EKS, and GCP environments serving 100K+ users',
      'Optimized ML model deployment pipelines reducing mobile app release cycles by <strong>50%</strong> for 15+ teams'
    ]
  },
  {
    title: 'DevOps Engineer - L2',
    company: 'Appointy',
    location: 'Bhopal, India',
    dateRange: '03/2019 - 11/2020',
    responsibilities: [
      'Streamlined platform provisioning with Helm charts for a multi-tenant SaaS platform reducing configuration errors by <strong>30%</strong>',
      'Migrated production infrastructure from Azure to GCP ensuring <strong>99% uptime</strong>',
      'Implemented APM and tracing using OpenTelemetry reducing production incidents by <strong>20%</strong>'
    ]
  },
  {
    title: 'System Engineer',
    company: 'ITE',
    location: 'Bhopal, India',
    dateRange: '03/2018 - 02/2019',
    responsibilities: [
      'Built and operated OpenStack-based private cloud infrastructure reducing hardware costs by <strong>30%</strong>',
      'Optimized Nginx and Apache performance improving response times by <strong>40%</strong> for smart city systems'
    ]
  }
]

const Experience = () => {
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated')
            const timelineItems = entry.target.querySelectorAll('.timeline-item')
            timelineItems.forEach((item, index) => {
              setTimeout(() => {
                item.classList.add('animated')
              }, index * 100)
            })
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
          <span className="title-text">Professional Experience</span>
          <span className="title-line"></span>
        </h2>
      </div>
      <div className="section-content">
        <div className="timeline">
          {experiences.map((exp, index) => (
            <div key={index} className="timeline-item" data-animate="fade-up">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <div className="experience-header">
                  <div className="experience-title-group">
                    <h3 className="job-title">{exp.title}</h3>
                    <p className="company-name">
                      {exp.company}
                      {exp.isYC && (
                        <span className="yc-badge">{exp.ycBatch}</span>
                      )}
                    </p>
                  </div>
                  <div className="experience-meta">
                    <span className="location">{exp.location}</span>
                    <span className="date-range">{exp.dateRange}</span>
                  </div>
                </div>
                <ul className="job-responsibilities">
                  {exp.responsibilities.map((resp, idx) => (
                    <li key={idx} dangerouslySetInnerHTML={{ __html: resp }} />
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Experience

