import React, { useEffect, useRef } from 'react'

const skillsData = [
  {
    title: 'Cloud & Platforms',
    skills: ['AWS', 'GCP', 'Azure', 'Kubernetes (EKS, GKE)', 'Docker', 'Helm', 'Terraform', 'Terragrunt']
  },
  {
    title: 'GitOps & CI/CD',
    skills: ['ArgoCD', 'FluxCD', 'GitHub Actions', 'GitLab CI/CD', 'Jenkins', 'Spinnaker', 'Karpenter']
  },
  {
    title: 'Observability',
    skills: ['Prometheus', 'Grafana', 'OpenTelemetry', 'Jaeger', 'ELK Stack', 'Datadog', 'Loki', 'VictoriaMetrics']
  },
  {
    title: 'Data & MLOps',
    skills: ['Kubeflow', 'MLflow', 'Apache Airflow', 'Flink', 'BigQuery', 'PostgreSQL', 'Redis', 'Seldon']
  },
  {
    title: 'Languages & Systems',
    skills: ['Go', 'Python', 'Bash', 'YAML', 'HCL', 'NGINX', 'Kafka', 'Pulsar', 'RabbitMQ']
  },
  {
    title: 'Security & Compliance',
    skills: ['ISO 27001', 'PCI-DSS', 'SOC 2', 'HashiCorp Vault', 'OPA', 'Hydra', 'SAST/DAST', 'SonarQube', 'Kube-bench']
  }
]

const Skills = () => {
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated')
            const skillGroups = entry.target.querySelectorAll('.skill-group')
            skillGroups.forEach((group, index) => {
              setTimeout(() => {
                group.classList.add('animated')
              }, index * 50)
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
          <span className="title-text">Technical Skills</span>
          <span className="title-line"></span>
        </h2>
      </div>
      <div className="section-content">
        <div className="skills-container">
          {skillsData.map((group, index) => (
            <div key={group.title} className="skill-group" data-animate="fade-up" data-delay={index * 50}>
              <h3 className="skill-group-title">{group.title}</h3>
              <div className="skill-tags">
                {group.skills.map((skill) => (
                  <span key={skill} className="skill-tag">{skill}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Skills

