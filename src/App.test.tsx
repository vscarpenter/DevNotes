import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders DevNotes heading', () => {
    render(<App />)
    expect(screen.getByText('DevNotes')).toBeInTheDocument()
  })

  it('renders description text', () => {
    render(<App />)
    expect(screen.getByText('A developer-focused note-taking application')).toBeInTheDocument()
  })
})