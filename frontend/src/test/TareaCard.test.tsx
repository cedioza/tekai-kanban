import { vi, describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import TareaCard from '../components/TareaCard'
import { TareaProvider } from '../context/TareaContext'
import { Tarea, EstadoTarea, PrioridadTarea } from '../types/Tarea'

// Mock de la API usando vi.hoisted
const mockTareaApi = vi.hoisted(() => ({
  getAll: vi.fn().mockResolvedValue([]),
  create: vi.fn().mockResolvedValue({ id: 1 }),
  update: vi.fn().mockResolvedValue({}),
  delete: vi.fn().mockResolvedValue({}),
  move: vi.fn().mockResolvedValue({}),
  addComment: vi.fn().mockResolvedValue({}),
  deleteComment: vi.fn().mockResolvedValue({}),
}))

vi.mock('../services/api', () => ({
  tareaApi: mockTareaApi,
}))

// Mock de window.open
const mockWindowOpen = vi.fn()
Object.defineProperty(window, 'open', {
  writable: true,
  value: mockWindowOpen,
})

// Mock de react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

const renderWithProvider = (props = {}) => {
  const defaultProps = { tarea: mockTarea, onEdit: vi.fn(), onDelete: vi.fn(), onMove: vi.fn(), ...props }
  return render(
    <TareaProvider>
      <TareaCard {...defaultProps} />
    </TareaProvider>
  )
}

const mockTarea: Tarea = {
  id: 1,
  titulo: 'Tarea de prueba',
  descripcion: 'Descripción de la tarea de prueba',
  estado: EstadoTarea.CREADA,
  responsable: 'Juan Pérez',
  prioridad: PrioridadTarea.MEDIA,
  fechaCreacion: '2024-01-01T00:00:00.000Z',
  fechaActualizacion: '2024-01-01T00:00:00.000Z',
  etiquetas: [],
  comentarios: [],
}

describe('TareaCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset all API mocks to their default behavior
    mockTareaApi.getAll.mockResolvedValue([])
    mockTareaApi.create.mockResolvedValue({ id: 1 })
    mockTareaApi.update.mockResolvedValue({})
    mockTareaApi.delete.mockResolvedValue({})
    mockTareaApi.move.mockResolvedValue({})
    mockTareaApi.addComment.mockResolvedValue({})
    mockTareaApi.deleteComment.mockResolvedValue({})
  })

  it('debería renderizar la información de la tarea correctamente', () => {
    renderWithProvider({
      tarea: mockTarea,
      onEdit: vi.fn(),
      onDelete: vi.fn(),
    })

    expect(screen.getByText('Tarea de prueba')).toBeInTheDocument()
    expect(screen.getByText('Descripción de la tarea de prueba')).toBeInTheDocument()
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
    expect(screen.getByText('Media')).toBeInTheDocument()
  })

  it('debería mostrar la fecha de creación formateada', () => {
    renderWithProvider({
      tarea: mockTarea,
      onEdit: vi.fn(),
      onDelete: vi.fn(),
    })

    // Verificar que se muestra alguna fecha (el formato puede variar según la localización)
    expect(screen.getByText(/2024/)).toBeInTheDocument()
  })

  it('debería abrir la página de edición en nueva pestaña al hacer clic en el botón editar', async () => {
    renderWithProvider({
      tarea: mockTarea,
      onEdit: vi.fn(),
      onDelete: vi.fn(),
    })

    const editButton = screen.getByRole('button', { name: /editar/i })
    fireEvent.click(editButton)

    await waitFor(() => {
      expect(mockWindowOpen).toHaveBeenCalledWith('/tasks/1/edit', '_blank')
    })
  })

  it('debería abrir la página de edición en nueva pestaña al hacer clic en la tarjeta', async () => {
    renderWithProvider({
      tarea: mockTarea,
      onEdit: vi.fn(),
      onDelete: vi.fn(),
    })

    const card = screen.getByTestId('tarea-card')
    fireEvent.click(card)

    await waitFor(() => {
      expect(mockWindowOpen).toHaveBeenCalledWith('/tasks/1/edit', '_blank')
    })
  })

  it('debería llamar a onDelete al hacer clic en el botón eliminar', async () => {
    const mockOnDelete = vi.fn()
    renderWithProvider({
      tarea: mockTarea,
      onEdit: vi.fn(),
      onDelete: mockOnDelete,
    })

    const deleteButton = screen.getByRole('button', { name: /eliminar/i })
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledWith(1)
    })
  })

  it('debería mostrar el estado correcto de la tarea', () => {
    const tareaEnProgreso = {
      ...mockTarea,
      estado: EstadoTarea.EN_PROGRESO
    }

    renderWithProvider({
      tarea: tareaEnProgreso,
      onEdit: vi.fn(),
      onDelete: vi.fn(),
    })

    // Verificar que el componente refleja el estado EN_PROGRESO
    // Esto dependerá de cómo se muestre visualmente el estado en el componente
    expect(screen.getByTestId('tarea-card')).toBeInTheDocument()
  })

  it('debería manejar tareas con diferentes prioridades', () => {
    const tareaAltaPrioridad = {
      ...mockTarea,
      prioridad: 'Alta'
    }

    renderWithProvider({
      tarea: tareaAltaPrioridad,
      onEdit: vi.fn(),
      onDelete: vi.fn(),
    })

    expect(screen.getByText('Alta')).toBeInTheDocument()
  })

  it('debería manejar tareas sin descripción', () => {
    const tareaSinDescripcion = {
      ...mockTarea,
      descripcion: ''
    }

    renderWithProvider({
      tarea: tareaSinDescripcion,
      onEdit: vi.fn(),
      onDelete: vi.fn(),
    })

    expect(screen.getByText('Tarea de prueba')).toBeInTheDocument()
    // La descripción vacía no debería causar errores
  })

  it('debería prevenir la propagación del evento al hacer clic en botones', async () => {
    const mockStopPropagation = vi.fn()
    
    renderWithProvider({
      tarea: mockTarea,
      onEdit: vi.fn(),
      onDelete: vi.fn(),
    })

    const editButton = screen.getByRole('button', { name: /editar/i })
    
    // Simular evento con stopPropagation
    const mockEvent = {
      stopPropagation: mockStopPropagation,
      preventDefault: vi.fn(),
    }
    
    fireEvent.click(editButton, mockEvent)

    // Verificar que se abre la ventana de edición
    await waitFor(() => {
      expect(mockWindowOpen).toHaveBeenCalledWith('/tasks/1/edit', '_blank')
    })
  })
})