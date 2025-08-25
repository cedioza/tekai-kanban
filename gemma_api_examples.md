# Ejemplos de Uso - API Gemma-3-270M

Este documento contiene ejemplos prácticos para consumir la API del modelo Gemma-3-270M que está ejecutándose en el contenedor Docker.

## 🔗 Información de la API

- **URL Base**: `http://localhost:8000`
- **Documentación Swagger**: `http://localhost:8000/docs`
- **Puerto**: 8000
- **Modelo**: google/gemma-3-270m

## 📋 Endpoints Disponibles

### 1. Health Check
**GET** `/health`

Verifica si la API está funcionando y el modelo está cargado.

```bash
curl -X GET "http://localhost:8000/health"
```

**Respuesta esperada:**
```json
{
  "status": "healthy",
  "model_loaded": true
}
```

### 2. Información del Modelo
**GET** `/model-info`

Obtiene información detallada del modelo cargado.

```bash
curl -X GET "http://localhost:8000/model-info"
```

**Respuesta esperada:**
```json
{
  "model_name": "google/gemma-3-270m",
  "model_type": "GemmaForCausalLM",
  "tokenizer_type": "GemmaTokenizer",
  "vocab_size": 256000,
  "device": "cpu",
  "dtype": "torch.float32"
}
```

### 3. Generar Texto
**POST** `/generate`

Genera texto basado en un prompt usando el modelo Gemma.

#### Ejemplo Básico
```bash
curl -X POST "http://localhost:8000/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "La inteligencia artificial es"
  }'
```

#### Ejemplo con Parámetros Personalizados
```bash
curl -X POST "http://localhost:8000/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "En el futuro, la tecnología",
    "max_length": 200,
    "temperature": 0.8,
    "top_p": 0.9,
    "do_sample": true
  }'
```

**Respuesta esperada:**
```json
{
  "generated_text": "será más avanzada y permitirá...",
  "prompt": "En el futuro, la tecnología",
  "model_name": "google/gemma-3-270m"
}
```

## 🔧 Parámetros de Generación

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `prompt` | string | **requerido** | Texto inicial para la generación |
| `max_length` | integer | 512 | Longitud máxima del texto generado |
| `temperature` | float | 0.7 | Controla la aleatoriedad (0.1-2.0) |
| `top_p` | float | 0.9 | Nucleus sampling (0.1-1.0) |
| `do_sample` | boolean | true | Usar sampling vs greedy decoding |
| `num_return_sequences` | integer | 1 | Número de secuencias a generar |

## 🐍 Ejemplos en Python

### Ejemplo Simple
```python
import requests

# Verificar estado
response = requests.get("http://localhost:8000/health")
print(response.json())

# Generar texto
payload = {
    "prompt": "Python es un lenguaje de programación",
    "max_length": 150,
    "temperature": 0.7
}

response = requests.post(
    "http://localhost:8000/generate",
    json=payload
)

result = response.json()
print(f"Prompt: {result['prompt']}")
print(f"Generado: {result['generated_text']}")
```

### Ejemplo con Manejo de Errores
```python
import requests
from typing import Dict, Any

def generate_text(prompt: str, **kwargs) -> Dict[str, Any]:
    url = "http://localhost:8000/generate"
    payload = {"prompt": prompt, **kwargs}
    
    try:
        response = requests.post(url, json=payload, timeout=30)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.ConnectionError:
        return {"error": "No se puede conectar a la API"}
    except requests.exceptions.Timeout:
        return {"error": "Timeout en la solicitud"}
    except requests.exceptions.HTTPError as e:
        return {"error": f"Error HTTP: {e}"}
    except Exception as e:
        return {"error": f"Error inesperado: {e}"}

# Uso
result = generate_text(
    "Los beneficios del machine learning incluyen",
    max_length=200,
    temperature=0.6
)

if "error" in result:
    print(f"Error: {result['error']}")
else:
    print(f"Texto generado: {result['generated_text']}")
```

## 🌐 Ejemplos en JavaScript/Node.js

### Usando fetch
```javascript
async function generateText(prompt, options = {}) {
  const payload = {
    prompt,
    max_length: options.maxLength || 512,
    temperature: options.temperature || 0.7,
    top_p: options.topP || 0.9,
    do_sample: options.doSample !== false
  };

  try {
    const response = await fetch('http://localhost:8000/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error:', error);
    return { error: error.message };
  }
}

// Uso
generateText('La inteligencia artificial es', {
  maxLength: 150,
  temperature: 0.8
}).then(result => {
  if (result.error) {
    console.error('Error:', result.error);
  } else {
    console.log('Prompt:', result.prompt);
    console.log('Generado:', result.generated_text);
  }
});
```

## 🧪 Prompts de Prueba Recomendados

### Prompts en Español
```bash
# Tecnología
curl -X POST "http://localhost:8000/generate" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "La inteligencia artificial revolucionará", "max_length": 150}'

# Ciencia
curl -X POST "http://localhost:8000/generate" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Los avances en medicina permiten", "max_length": 200}'

# Programación
curl -X POST "http://localhost:8000/generate" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Python es ideal para", "max_length": 120}'
```

### Prompts en Inglés
```bash
# Technology
curl -X POST "http://localhost:8000/generate" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Machine learning algorithms can", "max_length": 150}'

# Creative Writing
curl -X POST "http://localhost:8000/generate" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Once upon a time in a digital world", "max_length": 200}'
```

## 🔍 Troubleshooting

### Problemas Comunes

1. **Error de Conexión**
   ```bash
   curl: (7) Failed to connect to localhost port 8000
   ```
   - Verificar que el contenedor esté ejecutándose: `docker-compose ps`
   - Verificar que el puerto 8000 esté disponible

2. **Modelo No Cargado**
   ```json
   {"detail": "Model not loaded"}
   ```
   - El modelo aún se está cargando, esperar unos minutos
   - Verificar logs del contenedor: `docker-compose logs tekai-gemma`

3. **Timeout en Generación**
   - Reducir `max_length`
   - Ajustar `temperature` a valores más bajos
   - Verificar recursos del sistema

### Verificar Estado del Contenedor
```bash
# Ver estado de todos los contenedores
docker-compose ps

# Ver logs del contenedor Gemma
docker-compose logs tekai-gemma

# Ver logs en tiempo real
docker-compose logs -f tekai-gemma
```

## 📊 Monitoreo de Performance

### Medir Tiempo de Respuesta
```bash
time curl -X POST "http://localhost:8000/generate" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Test prompt", "max_length": 100}'
```

### Verificar Uso de Recursos
```bash
# Ver uso de CPU y memoria del contenedor
docker stats tekai-gemma
```

## 🚀 Script de Prueba Automatizado

Puedes usar el script `test_gemma_api.py` incluido en el proyecto:

```bash
# Ejecutar pruebas automáticas
python test_gemma_api.py

# Modo interactivo
python test_gemma_api.py interactive
```

Este script incluye:
- ✅ Verificación de salud de la API
- 📊 Obtención de información del modelo
- 🧪 Pruebas con múltiples prompts
- 🎯 Modo interactivo para pruebas personalizadas
- ⏱️ Medición de tiempos de respuesta