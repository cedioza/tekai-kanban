# Tekai - Docker Setup

Este proyecto incluye una configuración completa de Docker con los siguientes servicios:

- **Frontend**: Aplicación React con Nginx
- **Backend**: API Node.js/Express
- **PostgreSQL**: Base de datos principal
- **n8n**: Plataforma de automatización de workflows
- **Gemma-3-270M**: Modelo de IA de Hugging Face

## Requisitos Previos

- Docker Desktop instalado
- Docker Compose v2.0+
- Al menos 8GB de RAM disponible
- 10GB de espacio en disco libre

## Configuración Inicial

### 1. Variables de Entorno

Copia el archivo de configuración:
```bash
cp .env.docker .env
```

Edita las variables según tus necesidades, especialmente:
- Contraseñas de base de datos
- JWT_SECRET para el backend
- Credenciales de n8n

### 2. Construcción y Ejecución

```bash
# Construir todas las imágenes
docker-compose build

# Iniciar todos los servicios
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f
```

### 3. Verificación de Servicios

Una vez iniciados, los servicios estarán disponibles en:

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **n8n**: http://localhost:5678
- **Gemma Model API**: http://localhost:8000
- **PostgreSQL**: localhost:5432

## Uso del Modelo Gemma

### Endpoint de Generación de Texto

```bash
curl -X POST "http://localhost:8000/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Explica qué es la inteligencia artificial",
    "max_length": 200,
    "temperature": 0.7
  }'
```

### Documentación de la API

Visita http://localhost:8000/docs para ver la documentación interactiva de Swagger.

## Comandos Útiles

### Gestión de Contenedores

```bash
# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v

# Reiniciar un servicio específico
docker-compose restart backend

# Ver estado de los servicios
docker-compose ps

# Acceder a un contenedor
docker-compose exec backend sh
docker-compose exec postgres psql -U tekai_user -d tekai_db
```

### Logs y Debugging

```bash
# Ver logs de un servicio específico
docker-compose logs backend
docker-compose logs gemma-model

# Seguir logs en tiempo real
docker-compose logs -f frontend

# Ver logs con timestamps
docker-compose logs -t postgres
```

### Base de Datos

```bash
# Conectar a PostgreSQL
docker-compose exec postgres psql -U tekai_user -d tekai_db

# Backup de la base de datos
docker-compose exec postgres pg_dump -U tekai_user tekai_db > backup.sql

# Restaurar backup
docker-compose exec -T postgres psql -U tekai_user -d tekai_db < backup.sql
```

## Configuración de n8n

1. Accede a http://localhost:5678
2. Usa las credenciales configuradas en `.env`:
   - Usuario: admin
   - Contraseña: admin123
3. Configura webhooks apuntando a tu backend: http://backend:3000

## Integración con el Modelo Gemma

Puedes integrar el modelo Gemma en tus workflows de n8n:

1. Usa el nodo HTTP Request
2. Configura la URL: http://gemma-model:8000/generate
3. Método: POST
4. Body: JSON con el prompt y parámetros

## Troubleshooting

### Problemas Comunes

**El modelo Gemma no carga:**
```bash
# Verificar logs del contenedor
docker-compose logs gemma-model

# Verificar espacio en disco
docker system df

# Limpiar caché si es necesario
docker system prune
```

**Error de conexión a la base de datos:**
```bash
# Verificar que PostgreSQL esté corriendo
docker-compose ps postgres

# Reiniciar el servicio de base de datos
docker-compose restart postgres
```

**Problemas de memoria:**
```bash
# Verificar uso de recursos
docker stats

# Ajustar límites en docker-compose.yml si es necesario
```

### Logs de Debugging

```bash
# Ver todos los logs
docker-compose logs

# Filtrar por servicio y nivel de error
docker-compose logs backend | grep ERROR
```

## Desarrollo

Para desarrollo local, puedes usar:

```bash
# Solo servicios de infraestructura
docker-compose up postgres n8n gemma-model -d

# Ejecutar frontend y backend localmente
npm run dev  # en ./frontend
npm start    # en ./backend
```

## Producción

Para producción, considera:

1. Cambiar todas las contraseñas por defecto
2. Configurar SSL/TLS
3. Usar un proxy reverso (nginx/traefik)
4. Configurar backups automáticos
5. Monitoreo y alertas
6. Limitar recursos de contenedores

## Soporte

Para problemas o preguntas:
1. Revisa los logs con `docker-compose logs`
2. Verifica el estado con `docker-compose ps`
3. Consulta la documentación de cada servicio