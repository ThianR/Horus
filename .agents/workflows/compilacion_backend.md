---
description: cómo compilar y solucionar errores de entorno del backend en horus
---
# Compilación y Ejecución del Backend Horus

**CRÍTICO: PROBLEMA DE ENTORNO WINDOWS DETECTADO**

El entorno global de Windows del usuario tiene configurada la variable `JAVA_HOME` apuntando al **JDK 8** (`jdk1.8.0_181`), posiblemente por compatibilidad con NetBeans 8 y GlassFish.

Sin embargo, este proyecto Horus (Spring Boot 3) **requiere Java 17 o superior**. 
Si ejecutas comandos de Maven normales (`mvn clean package` o `mvn spring-boot:run`) sin prefijar el JDK correcto, Maven heredará el Java 8 global y el proceso de construcción fallará devolviendo los siguientes errores comunes:
- `invalid flag: --release` (Java 8 no entiende el flag target/release moderno).
- `UnsupportedClassVersionError: class file version 61.0` (Java 8 intentando leer el bytecode generado/cargado de Spring Framework).
- Problemas recurrentes que bloquean la carpeta `target/`.

**LA SOLUCIÓN OBLIGATORIA:**
Siempre que necesites invocar un comando Maven o ejecutar el archivo `.jar`, **DEBES** forzar el uso del JDK 21 que se encuentra instalado en la ruta `C:\Program Files\Java\jdk-21`.

### Opción 1: Ejecutar script preparado (RECOMENDADO)
Usa siempre el script oficial que enmascara las variables de entorno correctamente de manera local a la consola:
```shell
// turbo
.\ejecutar_backend.bat
```

### Opción 2: Ejecución manual (Vía PowerShell o Bash)
Si necesitas ejecutar comandos Maven interactivos puramente, ajusta las variables en tu sesión actual primero:
```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
$env:PATH = "$env:JAVA_HOME\bin;" + $env:PATH
C:\apache-maven-3.8.8\bin\mvn.cmd clean package -DskipTests
```
No procedas con depuración compleja de código Java o dependencias del `pom.xml` si experimentas `MojoExecutionException` hasta no confirmar que se está usando la instancia correcta del compilador (ejecuta `javac -version` para verificar).
