#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
WriteLens - Full Automatic System Launcher
Starts everything automatically with one command!
"""

import os
import sys
import subprocess
import time
import socket
from pathlib import Path

def print_banner():
    """Print system banner."""
    print("""
╔════════════════════════════════════════════════════════════════════════════════╗
║                                                                                ║
║          🎓 WRITELEN - COMPLETE AUTOMATED SYSTEM LAUNCHER v2.0                ║
║                                                                                ║
║            Everything runs automatically - No manual steps needed!             ║
║                                                                                ║
╚════════════════════════════════════════════════════════════════════════════════╝
    """)


def is_port_open(host, port, timeout=1.0):
    """Check whether a TCP port is open."""
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except OSError:
        return False


def wait_for_port(host, port, timeout_seconds=20):
    """Wait until a port becomes available."""
    deadline = time.time() + timeout_seconds
    while time.time() < deadline:
        if is_port_open(host, port):
            return True
        time.sleep(0.5)
    return False

def start_backend():
    """Start Backend API server."""
    print("\n▶️ Starting Backend API Server...")
    print("=" * 80)

    if is_port_open("127.0.0.1", 5000):
        print("ℹ️ Backend already running on port 5000")
        print("   📍 Running on: http://localhost:5000")
        return None
    
    backend_path = Path(__file__).parent / "backend" / "server.js"
    backend_env = os.environ.copy()
    backend_env.setdefault("JWT_SECRET", "writelens-local-dev-secret")
    backend_env.setdefault("ALLOW_DEMO_USERS", "true")
    backend_env.setdefault("DEMO_USER_PASSWORD", "writelens2025")
    
    # Start Node.js server
    process = subprocess.Popen(
        ["node", str(backend_path)],
        cwd=str(backend_path.parent),
        env=backend_env,
        creationflags=0x08  # CREATE_NEW_PROCESS_GROUP for Windows
    )

    if wait_for_port("127.0.0.1", 5000, timeout_seconds=20):
        print(f"✅ Backend server started (PID: {process.pid})")
        print("   📍 Running on: http://localhost:5000")
        print("   📡 API Ready: /api/dashboard, /api/charts, /api/process")
    else:
        print(f"⚠️ Backend process started (PID: {process.pid}) but port 5000 is not ready yet")
    
    return process

def start_frontend():
    """Start Frontend development server."""
    print("\n▶️ Starting Frontend Development Server...")
    print("=" * 80)

    for port in (5173, 5174, 5175):
        if is_port_open("127.0.0.1", port):
            print(f"ℹ️ Frontend already running on port {port}")
            print(f"   📍 Running on: http://localhost:{port}")
            print(f"   🎨 Dashboard Ready: http://localhost:{port}/auto-analytics")
            return None
    
    frontend_path = Path(__file__).parent / "frontend"
    npm_executable = "npm.cmd" if os.name == "nt" else "npm"
    
    # Start npm dev
    process = subprocess.Popen(
        [npm_executable, "run", "dev", "--", "--port", "5173"],
        cwd=str(frontend_path),
        creationflags=0x08  # CREATE_NEW_PROCESS_GROUP for Windows
    )

    active_port = None
    deadline = time.time() + 25
    while time.time() < deadline:
        for port in (5173, 5174, 5175, 5176):
            if is_port_open("127.0.0.1", port):
                active_port = port
                break
        if active_port is not None:
            break
        time.sleep(0.5)

    if active_port is not None:
        print(f"✅ Frontend server started (PID: {process.pid})")
        print(f"   📍 Running on: http://localhost:{active_port}")
        print(f"   🎨 Dashboard Ready: http://localhost:{active_port}/auto-analytics")
    else:
        print(f"⚠️ Frontend process started (PID: {process.pid}) but no Vite port detected yet")
    
    return process

def process_data():
    """Process Excel data automatically."""
    print("\n▶️ Processing Excel Data Automatically...")
    print("=" * 80)
    
    main_path = Path(__file__).parent / "writelen_main.py"
    
    # Run Python processing
    result = subprocess.run(
        [sys.executable, str(main_path)],
        cwd=str(main_path.parent),
        capture_output=False
    )
    
    if result.returncode == 0:
        print("\n✅ Data processing completed successfully!")
        print("   📁 Output: adaptive_writing_system/outputs/")
        print("   📊 Reports: AI_ANALYSIS_REPORTS/")
    else:
        print("\n❌ Data processing failed!")
    
    return result.returncode == 0

def main():
    """Main launcher function."""
    print_banner()
    
    base_path = Path(__file__).parent
    
    # Step 1: Process data
    print("\n" + "="*80)
    print("STEP 1/3: AUTOMATIC DATA PROCESSING")
    print("="*80)
    
    data_success = process_data()
    if not data_success:
        print("\n⚠️  Data processing encountered issues")
        print("   Continuing with demo data mode...")
        print("   (You can process data later via the dashboard)")
    else:
        print("\n✅ Data processed successfully!")
    
    # Step 2: Start Backend
    print("\n" + "="*80)
    print("STEP 2/3: BACKEND API INITIALIZATION")
    print("="*80)
    
    backend_process = start_backend()
    
    # Step 3: Start Frontend
    print("\n" + "="*80)
    print("STEP 3/3: FRONTEND INTERFACE INITIALIZATION")
    print("="*80)
    
    frontend_process = start_frontend()
    
    # Display final info
    print("\n" + "="*80)
    print("✅ WRITELEN SYSTEM FULLY OPERATIONAL")
    print("="*80)
    print("""
🎉 Everything is running automatically!

📍 Access Points:
   1. Dashboard:  http://localhost:5173/auto-analytics  🎨
   2. API:        http://localhost:5000/api            📡
   3. Reports:    AI_ANALYSIS_REPORTS/                  📊

📊 Dashboard Features (All Automatic):
   ✓ Real-time data loading
   ✓ Live statistics calculation
   ✓ Auto-refreshing charts (every 5 seconds)
   ✓ Student profile display
   ✓ AI states visualization
   ✓ Score distribution
   ✓ One-click reprocessing

🔄 Auto-Features:
   ✓ Data auto-loads on startup
   ✓ Charts auto-update every 5 seconds
   ✓ Statistics auto-calculated
   ✓ No manual steps needed

📝 Notes:
   • Auto-refresh can be toggled in dashboard
   • Click "Process Data" to reprocess
   • Everything updates in real-time

═══════════════════════════════════════════════════════════════════════════════

To Stop:
   • Close this window (Ctrl+C)
   
To Access Again:
   • Run: python full_system_launcher.py

═══════════════════════════════════════════════════════════════════════════════

🌟 WriteLens v2.0 - Completely Automated! 🌟
    """)
    
    # Keep servers running
    try:
        print("\n⏳ System running... Press Ctrl+C to stop")
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n\n🛑 Shutting down WriteLens System...")
        
        stopped_any = False

        # Terminate only processes started by this launcher.
        for proc in (backend_process, frontend_process):
            if proc is not None:
                try:
                    proc.terminate()
                    stopped_any = True
                except Exception:
                    pass

        if stopped_any:
            print("✅ All services started by launcher stopped gracefully")
        else:
            print("ℹ️ No launcher-owned processes to stop")
        
        print("\n👋 WriteLens System stopped")
        print("=" * 80)

if __name__ == "__main__":
    main()
