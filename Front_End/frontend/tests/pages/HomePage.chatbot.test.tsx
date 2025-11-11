import { describe, expect, test } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { HomePage } from '../../src/pages/Home/HomePage'

const renderHome = () =>
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </MemoryRouter>,
  )

describe('HomePage chatbot guidance', () => {
  test('guides residents with online steps after entering a known service', async () => {
    renderHome()
    const input = screen.getByLabelText('어떤 민원을 도와드릴까요?')
    fireEvent.change(input, { target: { value: '내 생애 최초 주택 자금 대출' } })
    fireEvent.submit(input.closest('form')!)

    await waitFor(() => {
      expect(
        screen.getAllByRole('heading', { name: /내 생애 최초 주택 자금 대출/ }).length,
      ).toBeGreaterThan(0)
    })

    expect(screen.getByRole('heading', { name: /온라인 신청 단계/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /방문 신청 단계/ })).toBeInTheDocument()
    expect(screen.getAllByText(/주민등록증 · 주민등록등본/).length).toBeGreaterThan(0)
  })

  test('offers helpful message when no service is found', async () => {
    renderHome()
    const input = screen.getByLabelText('어떤 민원을 도와드릴까요?')
    fireEvent.change(input, { target: { value: '없는 민원' } })
    fireEvent.submit(input.closest('form')!)

    await waitFor(() => {
      expect(
        screen.getByText(/해당 민원 정보를 찾을 수 없습니다/),
      ).toBeInTheDocument()
    })
  })
})
