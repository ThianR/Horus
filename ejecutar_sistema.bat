@echo off
setlocal enabledelayedexpansion

echo ==========================================================
echo           INICIANDO SISTEMA OCULUS (FULL STACK)
echo ==========================================================

:: Configurar Variables de Entorno
SET MAVEN_HOME=C:\apache-maven-3.8.8
SET JAVA_HOME=C:\Program Files\Java\jdk-21
SET PATH=%JAVA_HOME%\bin;%MAVEN_HOME%\bin;%PATH%

:: 1. Limpiar Puertos (8000 Backend, 8001 Python, 5173 Frontend)
echo [+] Comprobando puertos 8000, 8001 y 5173...
powershell -Command "$ports = @(8000, 8001, 5173); foreach ($port in $ports) { $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue; if ($conn) { foreach ($c in $conn) { Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue } Write-Host \" [+] Puerto $port liberado.\" } }"

:: 2. Iniciar el Frontend en segundo plano
echo [+] Iniciando FRONTEND (Vite)...
cd frontend
start "OCULUS-FRONTEND" cmd /c "npm run dev"
cd ..

:: 3. Iniciar el Microservicio de Biometría (Python FastAPI)
echo [+] Iniciando MICROSERVICIO IA (DeepFace)...
cd python-service
start "OCULUS-IA" cmd /c "start.bat"
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
taskkill /FI "WINDOWTITLE eq OCULUS-FRONTEND*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq OCULUS-IA*" /T /F >nul 2>&1
pause
