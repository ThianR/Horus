@echo off
setlocal enabledelayedexpansion

echo ==========================================================
echo           INICIANDO SISTEMA HORUS (FULL STACK)
echo ==========================================================

:: Configurar Variables de Entorno
SET MAVEN_HOME=C:\apache-maven-3.8.8
SET JAVA_HOME=C:\Program Files\Java\jdk-21
SET PATH=%JAVA_HOME%\bin;%MAVEN_HOME%\bin;%PATH%

:: Cargar archivo .env local si existe (para JWT_SECRET y otras claves)
if exist ".env" (
    echo [+] Cargando variables de entorno desde .env local...
    for /F "usebackq tokens=1* delims==" %%A in (".env") do (
        set %%A=%%B
    )
) else (
    echo [!] ADVERTENCIA: No se encontro el archivo .env. Esto podria causar fallos por JWT_SECRET faltante. 
    echo     Revisa el archivo .env.example
)

:: 1. Limpiar Puertos (8000 Backend, 8001 Python, 5173 Frontend)
echo [+] Comprobando puertos 8000, 8001 y 5173...
powershell -Command "$ports = @(8000, 8001, 5173); foreach ($port in $ports) { $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue; if ($conn) { foreach ($c in $conn) { Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue } Write-Host \" [+] Puerto $port liberado.\" } }"

:: 2. Iniciar el Frontend en segundo plano
echo [+] Iniciando FRONTEND (Vite)...
cd frontend
start "HORUS-FRONTEND" cmd /c "npm run dev"
cd ..

:: 3. Iniciar el Microservicio de Biometría (Python FastAPI)
echo [+] Iniciando MICROSERVICIO IA (DeepFace)...
cd python-service
start "HORUS-IA" cmd /c "start.bat"
cd ..

:: 4. Iniciar el Backend (este proceso se queda en primer plano)
echo [+] Iniciando BACKEND (Spring Boot)...
if exist "%MAVEN_HOME%\bin\mvn.cmd" (
    echo [i] Usando Maven %MAVEN_HOME%
    cd backend
    :: Compilar si es necesario. Si prefieres velocidad extrema, puedes omitir mvn package
    call mvn package -DskipTests
    cd target
    echo ==========================================================
    echo    EL SISTEMA ESTA LISTO:
    echo    - Backend: http://localhost:8000
    echo    - Frontend: http://localhost:5173
    echo    - Biometria IA: http://localhost:8001/docs
    echo ==========================================================
    java -jar asistencia-backend-0.0.1-SNAPSHOT.jar --server.port=8000
) else (
    echo [!] Maven no encontrado. Iniciando desde JAR pre-compilado...
    cd backend/target
    java -jar asistencia-backend-0.0.1-SNAPSHOT.jar --server.port=8000
)

:: Cuando se cierra el backend, intentamos cerrar la ventana del front e IA
taskkill /FI "WINDOWTITLE eq HORUS-FRONTEND*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq HORUS-IA*" /T /F >nul 2>&1
pause
