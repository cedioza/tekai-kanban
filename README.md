# Sistema de Gestión de Tareas Kanban - TEKAI

## 📋 Descripción

Sistema de gestión de tareas estilo Kanban desarrollado como prueba técnica para TEKAI. Incluye una aplicación frontend moderna en React, una API backend robusta en Node.js/TypeScript, y está preparado para integración con n8n y AI Agent.

## 🏗️ Arquitectura

```
tekai/
├── backend/          # API REST con Node.js + TypeScript + Express
├── frontend/         # Aplicación React + TypeScript + Tailwind CSS
└── README.md         # Documentación principal
```

## 🚀 Características

### Frontend
- ✅ Tablero Kanban interactivo con drag & drop
- ✅ Columnas: Creada, En progreso, Bloqueada, Finalizada, Cancelada
- ✅ Crear, editar y eliminar tareas
- ✅ Mover tareas entre columnas
- ✅ Mostrar fecha de creación y responsable
- ✅ Lista de responsables seleccionable
- ✅ **Diseño profesional y minimalista** con paleta de colores moderna
- ✅ **Sistema de diseño consistente** con variables CSS
- ✅ **Animaciones suaves** y transiciones elegantes
- ✅ **Indicadores visuales de estado** para cada tipo de tarea
- ✅ Interfaz moderna y responsive
- ✅ Notificaciones toast
- ✅ Validación de formularios

### Backend
- ✅ API REST con endpoints completos
- ✅ Arquitectura limpia (Controllers, Services, Repositories)
- ✅ Base de datos SQLite
- ✅ Validaciones de negocio
- ✅ Manejo de errores
- ✅ Pruebas unitarias
- ✅ CORS configurado
- ✅ Logging de requests

## 🛠️ Tecnologías

### Backend
- **Node.js** con **TypeScript**
- **Express.js** para el servidor web
- **SQLite** para persistencia de datos
- **Jest** para pruebas unitarias
- **CORS** para comunicación cross-origin

### Frontend
- **React 18** con **TypeScript**
- **Vite** como build tool
- **CSS personalizado** con sistema de diseño moderno
- **@hello-pangea/dnd** para drag & drop (fork mantenido de react-beautiful-dnd)
- **Axios** para comunicación con API
- **React Hot Toast** para notificaciones
- **Lucide React** para iconos

## 📦 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd tekai
```

### 2. Configurar Backend
```bash
cd backend
npm install
npm run build
```

### 3. Configurar Frontend
```bash
cd ../frontend
npm install
```

## 🚀 Ejecución

### Opción 1: Ejecución Manual

#### Backend (Terminal 1)
```bash
cd backend
npm run dev
```
El backend estará disponible en: http://localhost:3000

#### Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```
El frontend estará disponible en: http://localhost:3001

### Opción 2: Ejecución con Scripts (Recomendado)

Puedes usar PowerShell para ejecutar ambos servicios:

```powershell
# Ejecutar backend en segundo plano
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"

# Ejecutar frontend
cd frontend
npm run dev
```

## 📡 API Endpoints

### Tareas
- `POST /api/tareas` - Crear nueva tarea
- `GET /api/tareas` - Obtener todas las tareas
- `GET /api/tareas/:id` - Obtener tarea por ID
- `PUT /api/tareas/:id` - Actualizar tarea
- `DELETE /api/tareas/:id` - Eliminar tarea

### Consultas Específicas
- `GET /api/tareas/estado/:estado` - Tareas por estado
- `GET /api/tareas/responsable/:responsable` - Tareas por responsable
- `GET /api/estadisticas` - Estadísticas generales

### Health Check
- `GET /health` - Estado del servidor

### Ejemplo de Uso

#### Crear Tarea
```bash
curl -X POST http://localhost:3000/api/tareas \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Crear frontend",
    "descripcion": "Diseñar la interfaz Kanban",
    "estado": "Creada",
    "responsable": "Juan Henao"
  }'
```

#### Obtener Tareas
```bash
curl http://localhost:3000/api/tareas
```

## 🧪 Pruebas

### Backend
```bash
cd backend
npm test
```

### Cobertura de Pruebas
```bash
cd backend
npm test -- --coverage
```

## 🏗️ Build para Producción

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

## 📊 Estados de Tareas

1. **Creada** - Tarea recién creada
2. **En progreso** - Tarea en desarrollo
3. **Bloqueada** - Tarea con impedimentos
4. **Finalizada** - Tarea completada
5. **Cancelada** - Tarea cancelada

## 👥 Responsables Disponibles

- Juan Henao
- María García
- Carlos López
- Ana Martínez
- Pedro Rodríguez
- Laura Sánchez

## 🎨 Características de Diseño

### Sistema de Diseño Moderno
- **Paleta de colores profesional**: Tonos azules, grises y acentos de color
- **Tipografía consistente**: Jerarquía clara con diferentes pesos y tamaños
- **Espaciado sistemático**: Grid de 8px para consistencia visual
- **Sombras sutiles**: Efectos de profundidad para elementos interactivos
- **Animaciones fluidas**: Transiciones suaves para mejor UX

### Estados Visuales
- **Creada**: Indicador azul claro
- **En progreso**: Indicador amarillo
- **Bloqueada**: Indicador rojo
- **Finalizada**: Indicador verde
- **Cancelada**: Indicador gris

### Componentes Rediseñados
- **Header**: Diseño limpio con gradiente sutil
- **Tarjetas de tarea**: Bordes redondeados, sombras y hover effects
- **Columnas Kanban**: Separación clara con fondos diferenciados
- **Botones**: Estados hover y active con feedback visual

## 🔧 Configuración Adicional

### Variables de Entorno

#### Backend (.env)
```env
PORT=3000
DB_PATH=./database.sqlite
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
```

## 🐛 Solución de Problemas

### Error de CORS
Si experimentas problemas de CORS, verifica que el backend esté configurado para permitir el origen del frontend (http://localhost:3001).

### Base de Datos
La base de datos SQLite se crea automáticamente en `backend/database.sqlite` al iniciar el servidor.

### Puerto en Uso
Si los puertos 3000 o 3001 están en uso, puedes cambiarlos:
- Backend: Modifica `PORT` en el archivo `.env` o `src/index.ts`
- Frontend: Modifica `server.port` en `vite.config.ts`

### Migración de react-beautiful-dnd
Este proyecto utiliza `@hello-pangea/dnd` en lugar de `react-beautiful-dnd` para:
- ✅ Resolver warnings de deprecación de `defaultProps`
- ✅ Mantener compatibilidad con React 18+
- ✅ Asegurar mantenimiento a largo plazo
- ✅ API idéntica sin cambios en el código

## 📝 Próximos Pasos (n8n Integration)

Este proyecto está preparado para la integración con n8n:

1. **Docker Setup**: Configurar n8n en Docker
2. **Network Configuration**: Crear red Docker para comunicación
3. **Webhooks**: Implementar endpoints para n8n
4. **AI Agent**: Integrar servicio de AI (OpenAI/Azure)
5. **Chat Triggers**: Configurar triggers de chat en n8n

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👨‍💻 Autor

**TEKAI Development Team**

---

⭐ Si este proyecto te fue útil, ¡no olvides darle una estrella!

## 📞 Soporte

Para soporte técnico o preguntas sobre el proyecto, por favor crea un issue en el repositorio.