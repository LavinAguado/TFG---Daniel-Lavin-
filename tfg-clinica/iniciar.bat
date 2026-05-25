@echo off
title Iniciar TheraTrack
echo =======================================================================
echo                 INICIANDO PROYECTO THERATRACK
echo =======================================================================
echo.

:: Iniciar Backend
echo [1/2] Iniciando Backend de la API...
start "TheraTrack - Backend" cmd /k "cd backend && node src/server.js"

:: Iniciar Frontend
echo [2/2] Iniciando Frontend (React + Vite)...
start "TheraTrack - Frontend" cmd /k "cd frontend && npx.cmd vite"

echo.
echo =======================================================================
echo ¡Ambos servicios se estan ejecutando en ventanas independientes!
echo.
echo - API Backend: http://localhost:3001
echo - Web Frontend: http://localhost:5173
echo =======================================================================
echo.
pause
