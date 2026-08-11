# Especificación --- App de Rutinas desde PDF

## Objetivo

Construir una app web/mobile que reciba un PDF de una rutina de
gimnasio, extraiga automáticamente días, bloques, ejercicios, series,
repeticiones, tiempos e imágenes, y genere una rutina interactiva.

Flujo:

`PDF → extracción → JSON normalizado → rutina interactiva → sesión de entrenamiento`

## Lo que hicimos en el prototipo

Partimos de un PDF de 3 días. El documento contenía ejercicios
numerados, series, repeticiones, tiempos y fotografías.

### Día 1

-   Entrada en calor: Cinta por frecuencia cardíaca --- 10 minutos.
-   Bloque principal:
    -   Dorsal Hammer --- 4 × 10.
    -   Tríceps con polea (agarre prono) --- 4 × 10.
    -   Remo en Hammer --- 4 × 10.
-   Circuito:
    -   Vuelos frontales con disco --- 3 × 10.
    -   Tríceps copa --- 3 × 10.
    -   Remo con banda --- 3 × 10.
-   Circuito abdominal:
    -   Plancha prona alta + toque de hombros --- 3 × 20.
    -   Abdominal recto corto --- 3 × 20.

### Día 2

-   Entrada en calor: Cinta por frecuencia cardíaca --- 10 minutos.
-   Bloque principal:
    -   Vuelos laterales con mancuernas --- 3 × 10.
    -   Empuje de pecho con banda --- 3 × 10.
    -   Apertura de pecho con mancuernas en banco inclinado --- 4 × 10.
    -   Empuje de pecho en máquina --- 4 × 10.
    -   Bíceps con polea --- 4 × 10.
    -   Empuje de hombros en máquina --- 4 × 10.
-   Circuito abdominal:
    -   Puente prono más abducción --- 3 × 20.
    -   Abdominales oblicuos alternados --- 3 × 20.

## Diseño de la tarjeta

La tarjeta quedó definida así:

``` text
┌────────────────────────────────────┐
│ Dorsal Hammer                 [✓]  │
├────────────────────────────────────┤
│                                    │
│          IMAGEN DEL EJERCICIO      │
│                                    │
├──────────────────┬─────────────────┤
│ SERIES × REPS    │ PESO            │
│     4 × 10       │ [ 15 ] kg       │
└──────────────────┴─────────────────┘
```

Orden:

1.  Nombre del ejercicio.
2.  Checkbox arriba a la derecha.
3.  Imagen grande.
4.  Series × repeticiones.
5.  Campo de peso.

Características visuales:

-   Mobile first.
-   Cards grandes.
-   Bordes redondeados.
-   Fondo general gris claro.
-   Contenedor de imágenes gris oscuro.
-   Imagen con `object-fit: contain`.
-   Verde para ejercicios completados.
-   Tipografía grande.
-   Poco texto.

No usar:

-   Botones para cada serie.
-   Botón "Completar ejercicio".
-   Long press.
-   Texto de "mantené apretado".
-   "Macro pausa" en la tarjeta.
-   Numeración técnica como parte de la interacción.

## Checkbox y progreso

Cada ejercicio tiene un checkbox.

Al marcarlo:

-   El ejercicio pasa a `completed`.
-   La tarjeta se vuelve verde.
-   El porcentaje se actualiza.
-   El estado se guarda.

El porcentaje es por ejercicio, no por cantidad de series:

``` text
porcentaje = ejercicios_completados / ejercicios_totales × 100
```

Ejemplo con 9 ejercicios:

-   0/9 → 0%
-   1/9 → 11%
-   2/9 → 22%
-   9/9 → 100%

## Registro de peso

Cada tarjeta tiene un campo de peso.

Ejemplo:

``` json
{
  "weights": {
    "2": "12.5",
    "3": "20"
  }
}
```

El valor se guarda automáticamente.

## Persistencia

El prototipo usa `localStorage`.

Estado:

``` js
{
  completed: {
    "1": true,
    "2": false
  },
  weights: {
    "1": "",
    "2": "15"
  }
}
```

Para producción, si hay usuarios/login, conviene persistir las sesiones
en una base de datos.

## Modelo de datos

No convertir directamente PDF → HTML.

Primero:

`PDF → JSON`

Después:

`JSON → UI`

Ejemplo:

``` json
{
  "title": "Rutina",
  "goal": "Fortalecimiento General",
  "trainer": "Nicolás Rezzano",
  "validFrom": "2026-08-04",
  "validTo": "2026-10-02",
  "days": [
    {
      "name": "Día 1",
      "blocks": [
        {
          "type": "strength",
          "title": "Bloque principal",
          "exercises": [
            {
              "name": "Dorsal Hammer",
              "sets": 4,
              "reps": 10,
              "image": "..."
            }
          ]
        }
      ]
    }
  ]
}
```

Los tipos de bloque pueden ser:

-   `warmup`
-   `strength`
-   `circuit`
-   `abs`

Ejemplo de circuito:

``` json
{
  "type": "circuit",
  "title": "Circuito",
  "rounds": 3,
  "exercises": []
}
```

## Separar rutina de sesión

Es importante diferenciar la rutina original de lo que el usuario hizo
ese día.

### Routine

``` text
Rutina extraída del PDF
```

### WorkoutSession

``` json
{
  "routineId": "rutina-001",
  "day": 2,
  "date": "2026-08-11",
  "completedExercises": [
    "exercise-02",
    "exercise-03"
  ],
  "weights": {
    "exercise-02": 12.5,
    "exercise-03": 20
  }
}
```

Esto permite agregar historial y evolución posteriormente.

## Extracción del PDF

Pipeline recomendado:

``` text
PDF
 ↓
Upload
 ↓
Extracción de texto
 ↓
Extracción de imágenes
 ↓
Detección de días
 ↓
Detección de bloques
 ↓
Extracción de ejercicios
 ↓
Normalización
 ↓
JSON
 ↓
Validación
 ↓
Base de datos
 ↓
Frontend
```

No asumir que todos los PDFs tendrán exactamente el mismo diseño.

El parser debe reconocer conceptos como:

-   Día
-   Ejercicio
-   Series
-   Repeticiones
-   Minutos
-   Segundos
-   Kilogramos
-   Circuito
-   Vueltas
-   Pausa
-   Nombre del ejercicio

## IA para interpretar el PDF

Conviene combinar extracción determinística + LLM.

No depender exclusivamente de que el LLM lea el PDF completo.

Ejemplo:

``` text
PDF
 ↓
Parser
 ↓
Texto + imágenes
 ↓
LLM
 ↓
JSON estructurado
 ↓
Schema validation
```

La IA puede transformar:

``` text
Series 1 2 3 4
repeticiones 10 10 10 10
```

en:

``` json
{
  "sets": 4,
  "reps": 10
}
```

Y:

``` text
Vueltas: 3
```

en:

``` json
{
  "rounds": 3
}
```

El JSON debe validarse antes de guardarse.

Se puede usar Zod:

``` ts
const ExerciseSchema = z.object({
  name: z.string(),
  sets: z.number().optional(),
  reps: z.number().optional(),
  durationSeconds: z.number().optional(),
  image: z.string().optional()
});
```

## Normalización de ejercicios

El mismo ejercicio puede aparecer escrito de varias formas.

Ejemplo:

``` text
Tríceps con polea (agarre prono)
Triceps polea agarre prono
Tríceps polea prono
```

Normalizar a:

``` json
{
  "canonicalName": "Tríceps con polea — agarre prono",
  "slug": "triceps-polea-prono"
}
```

Esto permite asociar una imagen consistente.

## Imágenes

Hay dos estrategias.

### Imagen del PDF

Ventaja: corresponde exactamente a la rutina.

Problema: puede tener baja resolución.

### Biblioteca propia de ejercicios

Recomendado para producción:

``` text
exercise-images/
  dorsal-hammer.webp
  triceps-polea-prono.webp
  remo-hammer.webp
  vuelos-laterales.webp
```

Y:

``` json
{
  "name": "Dorsal Hammer",
  "slug": "dorsal-hammer",
  "image": "/exercise-images/dorsal-hammer.webp"
}
```

No depender de búsquedas de imágenes en Internet en tiempo real.

## Arquitectura recomendada

Frontend:

-   React
-   Next.js
-   TypeScript
-   Tailwind CSS
-   PWA

Backend:

-   API para upload/procesamiento.
-   Procesador de PDF.
-   LLM para estructuración.
-   Base de datos.
-   Storage para PDFs e imágenes.

Arquitectura:

``` text
                    ┌───────────────┐
                    │      PDF      │
                    └───────┬───────┘
                            ↓
                    ┌───────────────┐
                    │ PDF Processor │
                    └───────┬───────┘
                            ↓
                    ┌───────────────┐
                    │ JSON Routine  │
                    └───────┬───────┘
                            ↓
             ┌──────────────┴──────────────┐
             ↓                             ↓
       Exercise DB                    Routine DB
             │                             │
             └──────────────┬──────────────┘
                            ↓
                       React / Next
                            ↓
                         Usuario
```

## Procesamiento asíncrono

No conviene mantener una request HTTP abierta durante todo el
procesamiento del PDF.

Mejor:

``` text
POST /upload
 ↓
job creado
 ↓
processing
 ↓
completed
 ↓
routine available
```

La interfaz puede mostrar:

``` text
Procesando rutina...

✓ PDF recibido
✓ Detectando días
✓ Detectando ejercicios
● Procesando imágenes
○ Generando rutina
```

## URL productiva

La aplicación debería quedar disponible, por ejemplo:

``` text
https://app.tudominio.com
```

Los PDFs e imágenes deberían almacenarse en object storage y no dentro
del repositorio Git.

## MVP

Primera versión:

1.  Subir PDF.
2.  Extraer ejercicios.
3.  Detectar días.
4.  Detectar bloques.
5.  Detectar series.
6.  Detectar repeticiones.
7.  Extraer imágenes.
8.  Generar JSON.
9.  Mostrar rutina.
10. Checkbox para completar ejercicios.
11. Porcentaje de progreso.
12. Registro de peso.
13. Guardar sesión.

Segunda etapa:

-   Login.
-   Historial.
-   Evolución de pesos.
-   Comparación de sesiones.
-   Biblioteca de ejercicios.
-   Corrección manual del parser.
-   Edición de rutina.
-   Imágenes faltantes.
-   PWA.
-   Notificaciones.
-   Sincronización entre dispositivos.

## Regla principal de producto

El PDF es una **fuente de datos**, no la interfaz.

La aplicación debe interpretar el PDF y construir una experiencia mucho
más simple.

La prioridad durante el entrenamiento es:

**¿Qué ejercicio tengo que hacer? → ¿Cuántas series/repeticiones? → ¿Qué
peso usé? → ¿Lo terminé? → ¿Cuánto me falta?**
