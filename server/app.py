import os
import subprocess
import threading
import shutil
import time
import eventlet

# 必须在导入其他模块前调用 monkey_patch
eventlet.monkey_patch()

from flask import Flask, request, send_from_directory
from flask_socketio import SocketIO

app = Flask(__name__, static_folder="../frontend/dist", static_url_path="/")
socketio = SocketIO(app, cors_allowed_origins="*")

RPMBUILD_RPMS = os.path.expanduser("~/rpmbuild/RPMS")
ZIP_OUTPUT_DIR = os.path.expanduser("/tmp/ZIPPKGS")
os.makedirs(ZIP_OUTPUT_DIR, exist_ok=True)

@app.route("/")
def index():
    return app.send_static_file("index.html")

@app.route("/download_zip/<path:filename>")
def download_zip(filename):
    return send_from_directory(ZIP_OUTPUT_DIR, filename, as_attachment=True)

@socketio.on("start_build")
def handle_build(data):
    repo_url = data.get("repo_url")
    branch = data.get("branch")
    sid = request.sid

    if set(data.keys()) - {"repo_url", "branch"}:
        socketio.emit("log", {"log": "参数错误：只允许仓库URL和分支名\n"}, room=sid)
        socketio.emit("done", {"zip_url": ""}, room=sid)
        return

    if not repo_url or not branch:
        socketio.emit("log", {"log": "参数错误：仓库URL和分支名不能为空\n"}, room=sid)
        socketio.emit("done", {"zip_url": ""}, room=sid)
        return

    def run_build(sid):
        written_files = []
        cmd = ["bash", "../rpmbuild.sh", repo_url, branch]
        proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
        for line in iter(proc.stdout.readline, ''):
            socketio.emit("log", {"log": line}, room=sid)
            rpm_path = None
            if "已写至：" in line:
                rpm_path = line.split("已写至：", 1)[1].strip()
            elif "Wrote:" in line:
                rpm_path = line.split("Wrote:", 1)[1].strip()
            if rpm_path and os.path.isfile(rpm_path):
                written_files.append(rpm_path)
        proc.wait()

        if written_files:
            # 按时间排序
            written_files.sort(key=lambda x: os.path.getmtime(x))
            pkg_name = repo_url.strip().split('/')[-1].replace('.git','') if '/' in repo_url else repo_url.strip()
            timestamp = int(time.time())
            zip_name = f"{pkg_name}_{timestamp}.zip"
            zip_path = os.path.join(ZIP_OUTPUT_DIR, zip_name)
            import zipfile
            with zipfile.ZipFile(zip_path, 'w') as zipf:
                for f in written_files:
                    arcname = os.path.relpath(f, RPMBUILD_RPMS)
                    zipf.write(f, arcname)
            socketio.emit("done", {"zip_url": f"/download_zip/{zip_name}"}, room=sid)
        else:
            socketio.emit("log", {"log": "[未找到RPM包]\n"}, room=sid)
            socketio.emit("done", {"zip_url": ""}, room=sid)

    threading.Thread(target=run_build, args=(sid,)).start()

if __name__ == "__main__":
    # 使用 eventlet 作为 Web 服务器
    socketio.run(app, host="0.0.0.0", port=5000)
