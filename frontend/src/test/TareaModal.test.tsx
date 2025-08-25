import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import TareaModal from '../components/TareaModal'
import { TareaProvider } from '../context/TareaContext'
import { Tarea, EstadoTarea } from '../types/Tarea'
import toast from 'react-hot-toast'

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

// Mock de react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

const mockTarea: Tarea = {
  id: 1,
  titulo: 'Tarea de prueba',
  descripcion: 'Descripción de la tarea de prueba',
  estado: EstadoTarea.CREADA,
  responsable: 'Juan Pérez',
  prioridad: 'Media' as any,
  fechaCreacion: '2024-01-01T00:00:00.000Z',
  fechaActualizacion: '2024-01-01T00:00:00.000Z',
  etiquetas: [],
  comentarios: [],
}

const renderWithProvider = (props = {}) => {
  const defaultProps = { mode: 'create' as const, ...props }
  return render(
    <TareaProvider>
      <TareaModal isOpen={true} onClose={vi.fn()} {...defaultProps} />
    </TareaProvider>
  )
}

describe('TareaModal', () => {
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

  describe('Creación de tareas', () => {
    it('debería renderizar el modal para crear nueva tarea', () => {
      renderWithProvider()

      expect(screen.getByText(/nueva tarea/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/título/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/responsable/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/prioridad/i)).toBeInTheDocument()
    })

    it('debería crear una nueva tarea con datos válidos', async () => {
      const user = userEvent.setup()
      renderWithProvider()

      // Llenar el formulario
      await user.type(screen.getByLabelText(/título/i), 'Nueva tarea')
      await user.type(screen.getByLabelText(/descripción/i), 'Descripción de la nueva tarea')
      await user.type(screen.getByLabelText(/responsable/i), 'María García')
      await user.selectOptions(screen.getByLabelText(/prioridad/i), 'Alta')

      // Enviar formulario
      const submitButton = screen.getByRole('button', { name: /crear tarea/i })
      await user.click(submitButton)

      // Verificar que se muestra el toast de éxito
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled()
      })
    })

    it('debería mostrar error al crear tarea con título vacío', async () => {
      const user = userEvent.setup()
      renderWithProvider()

      // Intentar enviar formulario sin título
      const submitButton = screen.getByRole('button', { name: /crear tarea/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/el título es requerido/i)).toBeInTheDocument()
      })
    })
  })

  describe('Edición de tareas', () => {
    it('debería renderizar el modal para editar tarea existente', () => {
      renderWithProvider({ tarea: mockTarea, mode: 'edit' as const })

      expect(screen.getByText(/editar tarea/i)).toBeInTheDocument()
      expect(screen.getByDisplayValue('Tarea de prueba')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Descripción de la tarea de prueba')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Juan Pérez')).toBeInTheDocument()
    })

    it('debería actualizar una tarea existente', async () => {
      const user = userEvent.setup()
      renderWithProvider({ tarea: mockTarea, mode: 'edit' as const })

      // Modificar el título
      const tituloInput = screen.getByDisplayValue('Tarea de prueba')
      await user.clear(tituloInput)
      await user.type(tituloInput, 'Tarea modificada')

      // Enviar formulario
      const submitButton = screen.getByRole('button', { name: /actualizar tarea/i })
      await user.click(submitButton)

      // Verificar que se muestra el toast de éxito
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled()
      })
    })
  })

  describe('Interfaz de usuario', () => {
    it('debería cerrar el modal al hacer clic en cancelar', async () => {
      const user = userEvent.setup()
      const mockOnClose = vi.fn()
      
      renderWithProvider({ onClose: mockOnClose })

      const cancelButton = screen.getByRole('button', { name: /cancelar/i })
      await user.click(cancelButton)

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('debería cerrar el modal al hacer clic en el botón X', async () => {
      const user = userEvent.setup()
      const mockOnClose = vi.fn()
      
      renderWithProvider({ onClose: mockOnClose })

      const closeButton = screen.getByRole('button', { name: /cerrar/i })
      await user.click(closeButton)

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('no debería renderizar cuando isOpen es false', () => {
      render(
        <TareaProvider>
          <TareaModal isOpen={false} onClose={vi.fn()} mode="create" />
        </TareaProvider>
      )

      expect(screen.queryByText(/nueva tarea/i)).not.toBeInTheDocument()
    })

    it('debería mostrar las opciones de prioridad correctas', () => {
      renderWithProvider()

      const selectPrioridad = screen.getByLabelText(/prioridad/i)
      expect(selectPrioridad).toBeInTheDocument()

      // Verificar que las opciones están disponibles
      expect(screen.getByRole('option', { name: 'Baja' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Media' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Alta' })).toBeInTheDocument()
    })

    it('debería limpiar el formulario después de crear una tarea exitosamente', async () => {
      const user = userEvent.setup()
      const mockOnClose = vi.fn()
      renderWithProvider({ onClose: mockOnClose })

      // Llenar formulario
      await user.type(screen.getByLabelText(/título/i), 'Nueva tarea')
      await user.type(screen.getByLabelText(/responsable/i), 'Juan Pérez')

      // Enviar formulario
      const submitButton = screen.getByRole('button', { name: /crear tarea/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled()
      })
    })
  })

  describe('Validaciones del formulario', () => {
    it('debería validar que el responsable es requerido', async () => {
      const user = userEvent.setup()
      renderWithProvider()

      // Llenar solo el título
      await user.type(screen.getByLabelText(/título/i), 'Tarea sin responsable')
      
      const submitButton = screen.getByRole('button', { name: /crear tarea/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/el responsable es requerido/i)).toBeInTheDocument()
      })
    })

    it('debería permitir crear tarea sin descripción', async () => {
      const user = userEvent.setup()
      renderWithProvider()

      await user.type(screen.getByLabelText(/título/i), 'Tarea sin descripción')
      await user.type(screen.getByLabelText(/responsable/i), 'Juan Pérez')
      
      const submitButton = screen.getByRole('button', { name: /crear tarea/i })
      await user.click(submitButton)

      // Verificar que se muestra el toast de éxito
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled()
      })
    })
  })
})