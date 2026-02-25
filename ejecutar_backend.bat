@echo off
echo Iniciando Sistema Oculus...
SET MAVEN_HOME=C:\apache-maven-3.8.8
SET JAVA_HOME=C:\Program Files\Java\jdk-21
SET PATH=%JAVA_HOME%\bin;%MAVEN_HOME%\bin;%PATH%

echo Comprobando y liberando el puerto 8000 si se encuentra ocupado...
powershell -Command "$pidToKill = (Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue).OwningProcess; if ($pidToKill) { Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue; Write-Host ' > Proceso anterior en puerto 8000 terminado con exito.' }"

if exist "%MAVEN_HOME%\bin\mvn.cmd" (
    echo Usando Maven 3.8.8 localizado en %MAVEN_HOME% y Java %JAVA_HOME%
    cd backend
    call mvn package -DskipTests
    cd target
    java -jar asistencia-backend-0.0.1-SNAPSHOT.jar --server.port=8000
) else (
    echo Maven 3.8.8 no encontrado. Iniciando desde JAR pre-compilado...
    cd backend/target
    java -jar asistencia-backend-0.0.1-SNAPSHOT.jar --server.port=8000
)
:: pause
