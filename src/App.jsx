import React from 'react'
import Header from './components/Header'
import Summary from './components/Summary'
import Skills from './components/Skills'
import Experience from './components/Experience'
import Education from './components/Education'
import Footer from './components/Footer'

function App() {
  return (
    <div className="resume-wrapper">
      <Header />
      <main className="resume-main">
        <Summary />
        <Skills />
        <Experience />
        <Education />
      </main>
      <Footer />
    </div>
  )
}

export default App

