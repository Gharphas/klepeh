"""
Launcher Desktop Native Aplikasi My Klepeh E-Wallet menggunakan Windows WebView2
"""
import os
import sys

def get_base_path():
    if hasattr(sys, '_MEIPASS'):
        return sys._MEIPASS
    return os.path.dirname(os.path.abspath(__file__))

def main():
    try:
        import webview
    except ImportError:
        print("[INFO] Menginstall modul WebView...")
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pywebview"])
        import webview

    base_dir = get_base_path()
    html_file = os.path.abspath(os.path.join(base_dir, 'login.html'))
    
    # Konfigurasi Window Desktop Native
    window = webview.create_window(
        title='My Klepeh E-Wallet Premium',
        url=html_file,
        width=1280,
        height=850,
        min_size=(420, 680),
        background_color='#0b0f19',
        resizable=True
    )
    webview.start(private_mode=False)

if __name__ == '__main__':
    main()
