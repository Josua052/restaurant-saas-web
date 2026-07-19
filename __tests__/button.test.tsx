import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  it('renders the button with provided text', () => {
    render(<Button>Click Me</Button>)
    
    // Memeriksa apakah tombol dengan teks "Click Me" muncul di layar
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
  })

  it('calls onClick handler when clicked', async () => {
    // Membuat fungsi bohongan (mock function)
    const handleClick = jest.fn()
    
    render(<Button onClick={handleClick}>Submit</Button>)
    
    const button = screen.getByRole('button', { name: /submit/i })
    
    // Menyimulasikan klik dari user
    await userEvent.click(button)
    
    // Memeriksa apakah fungsi diklik 1 kali
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies the destructive variant class correctly', () => {
    render(<Button variant="destructive">Delete</Button>)
    
    const button = screen.getByRole('button', { name: /delete/i })
    
    // Memeriksa apakah class teks warna merah (destructive) diterapkan
    expect(button).toHaveClass('text-destructive')
  })
})
