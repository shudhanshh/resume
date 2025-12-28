import React, { useEffect, useRef } from 'react'
import resumeData from '../data/resumeData'

const Skills = () => {
  const sectionRef = useRef(null)
  const { skills } = resumeData

  useEffect(() => {
    // Add animation class immediately for elements in viewport
    if (sectionRef.current) {
      const rect = sectionRef.current.getBoundingClientRect()
      const isInViewport = rect.top < window.innerHeight && rect.bottom > 0
      if (isInViewport) {
        setTimeout(() => {
          sectionRef.current?.classList.add('animated')
          const skillGroups = sectionRef.current?.querySelectorAll('.skill-group')
          skillGroups?.forEach((group, index) => {
            setTimeout(() => {
              group.classList.add('animated')
            }, index * 50)
          })
        }, 50)
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('animated')
              const skillGroups = entry.target.querySelectorAll('.skill-group')
              skillGroups.forEach((group, index) => {
                setTimeout(() => {
                  group.classList.add('animated')
                }, index * 50)
              })
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

  // Convert skills object to array format
  const skillsArray = Object.entries(skills).map(([title, skillList]) => ({
    title,
    skills: skillList
  }))

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
          {skillsArray.map((group, index) => (
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
