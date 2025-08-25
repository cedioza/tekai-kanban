#!/usr/bin/env python3
"""
Script de prueba para la API del modelo Gemma
Este script demuestra cómo consumir la API del modelo Gemma-3-270M
"""

import requests
import json
import time
from typing import Dict, Any

# Configuración de la API
API_BASE_URL = "http://localhost:8000"
HEADERS = {"Content-Type": "application/json"}

def check_health() -> bool:
    """Verifica si la API está funcionando correctamente"""
    try:
        response = requests.get(f"{API_BASE_URL}/health")
        if response.status_code == 200:
            print("✅ API está funcionando correctamente")
            print(f"   Respuesta: {response.json()}")
            return True
        else:
            print(f"❌ API no está disponible. Status: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ No se puede conectar a la API. ¿Está el contenedor ejecutándose?")
        return False
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
        return False

def get_model_info() -> Dict[str, Any]:
    """Obtiene información del modelo"""
    try:
        response = requests.get(f"{API_BASE_URL}/model-info")
        if response.status_code == 200:
            info = response.json()
            print("📊 Información del modelo:")
            for key, value in info.items():
                print(f"   {key}: {value}")
            return info
        else:
            print(f"❌ Error obteniendo info del modelo: {response.status_code}")
            return {}
    except Exception as e:
        print(f"❌ Error: {e}")
        return {}

def generate_text(prompt: str, **kwargs) -> Dict[str, Any]:
    """Genera texto usando el modelo Gemma"""
    payload = {
        "prompt": prompt,
        "max_length": kwargs.get("max_length", 512),
        "temperature": kwargs.get("temperature", 0.7),
        "top_p": kwargs.get("top_p", 0.9),
        "do_sample": kwargs.get("do_sample", True),
        "num_return_sequences": kwargs.get("num_return_sequences", 1)
    }
    
    try:
        print(f"🤖 Generando texto para: '{prompt}'")
        print(f"   Parámetros: {json.dumps({k: v for k, v in payload.items() if k != 'prompt'}, indent=2)}")
        
        start_time = time.time()
        response = requests.post(
            f"{API_BASE_URL}/generate",
            headers=HEADERS,
            json=payload
        )
        end_time = time.time()
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Texto generado en {end_time - start_time:.2f} segundos:")
            print(f"   Prompt: {result['prompt']}")
            print(f"   Respuesta: {result['generated_text']}")
            print(f"   Modelo: {result['model_name']}")
            return result
        else:
            print(f"❌ Error generando texto: {response.status_code}")
            print(f"   Respuesta: {response.text}")
            return {}
    except Exception as e:
        print(f"❌ Error: {e}")
        return {}

def run_tests():
    """Ejecuta una serie de pruebas con diferentes prompts"""
    print("🚀 Iniciando pruebas de la API Gemma\n")
    
    # 1. Verificar salud de la API
    print("1. Verificando estado de la API...")
    if not check_health():
        print("❌ La API no está disponible. Asegúrate de que el contenedor esté ejecutándose.")
        return
    print()
    
    # 2. Obtener información del modelo
    print("2. Obteniendo información del modelo...")
    get_model_info()
    print()
    
    # 3. Pruebas de generación de texto
    test_prompts = [
        {
            "prompt": "La inteligencia artificial es",
            "max_length": 100,
            "temperature": 0.7
        },
        {
            "prompt": "En el futuro, la tecnología",
            "max_length": 150,
            "temperature": 0.5
        },
        {
            "prompt": "Python es un lenguaje de programación",
            "max_length": 120,
            "temperature": 0.8
        },
        {
            "prompt": "Los beneficios del machine learning incluyen",
            "max_length": 200,
            "temperature": 0.6
        }
    ]
    
    print("3. Ejecutando pruebas de generación de texto...")
    for i, test in enumerate(test_prompts, 1):
        print(f"\n--- Prueba {i} ---")
        generate_text(**test)
        time.sleep(1)  # Pausa entre pruebas
    
    print("\n🎉 Pruebas completadas!")

def interactive_mode():
    """Modo interactivo para probar prompts personalizados"""
    print("🎯 Modo interactivo - Escribe 'quit' para salir\n")
    
    if not check_health():
        print("❌ La API no está disponible.")
        return
    
    while True:
        try:
            prompt = input("\n💬 Ingresa tu prompt: ").strip()
            if prompt.lower() in ['quit', 'exit', 'salir']:
                print("👋 ¡Hasta luego!")
                break
            
            if not prompt:
                print("⚠️ Por favor ingresa un prompt válido.")
                continue
            
            # Parámetros opcionales
            try:
                max_length = input("📏 Max length (default 512): ").strip()
                max_length = int(max_length) if max_length else 512
                
                temperature = input("🌡️ Temperature (default 0.7): ").strip()
                temperature = float(temperature) if temperature else 0.7
                
                generate_text(prompt, max_length=max_length, temperature=temperature)
            except ValueError:
                print("⚠️ Valores inválidos, usando defaults.")
                generate_text(prompt)
                
        except KeyboardInterrupt:
            print("\n👋 ¡Hasta luego!")
            break
        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    import sys
    
    print("🤖 Script de Prueba - API Gemma-3-270M")
    print("=" * 40)
    
    if len(sys.argv) > 1 and sys.argv[1] == "interactive":
        interactive_mode()
    else:
        run_tests()
        
        # Preguntar si quiere modo interactivo
        try:
            choice = input("\n¿Quieres probar el modo interactivo? (y/n): ").strip().lower()
            if choice in ['y', 'yes', 'sí', 'si']:
                interactive_mode()
        except KeyboardInterrupt:
            print("\n👋 ¡Hasta luego!")