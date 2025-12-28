import React from 'react'

const Footer = () => {
  const getLastUpdated = () => {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <footer className="resume-footer">
      <p>Last updated: <span>{getLastUpdated()}</span></p>
    </footer>
  )
}

export default Footer

