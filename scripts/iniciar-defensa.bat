@echo off
title Iniciar TheraTrack
set "ROOT=%~dp0.."
echo =======================================================================
echo                 INICIANDO PROYECTO THERATRACK
echo =======================================================================
echo.

:: Iniciar Backend
echo [1/2] Iniciando Backend de la API...
start "TheraTrack - Backend" cmd /k "cd /d ""%ROOT%\backend"" && npm run dev"

:: Iniciar Frontend
echo [2/2] Iniciando Frontend (React + Vite)...
start "TheraTrack - Frontend" cmd /k "cd /d ""%ROOT%\frontend"" && npm run dev"

echo.
echo =======================================================================
echo ¡Ambos servicios se estan ejecutando en ventanas independientes!
echo.
echo - API Backend: http://localhost:3001
echo - Web Frontend: http://localhost:5173
echo =======================================================================
echo.
pause
