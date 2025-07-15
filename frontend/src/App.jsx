import React, { useState, useRef } from "react";
import { io } from "socket.io-client";

const BRANCHES = [
  { label: "master", value: "master" },
  { label: "main", value: "main" },
  { label: "dev", value: "dev" },
  { label: "test", value: "test" },
  { label: "自定义", value: "custom" }
];

export default function App() {
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("master");
  const [customBranch, setCustomBranch] = useState("");
  const [log, setLog] = useState("");
  const [zipUrl, setZipUrl] = useState("");
  const [building, setBuilding] = useState(false);
  const socketRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLog("");
    setZipUrl("");
    setBuilding(true);

    const branchName = branch === "custom" ? customBranch : branch;
    socketRef.current = io({ path: "/socket.io" });
    socketRef.current.emit("start_build", {
      repo_url: repoUrl,
      branch: branchName
    });

    socketRef.current.on("log", (data) => {
      setLog((prev) => prev + data.log);
    });

    socketRef.current.on("done", (data) => {
      setZipUrl(data.zip_url);
      setBuilding(false);
      socketRef.current.disconnect();
    });

    socketRef.current.on("disconnect", () => {
      setBuilding(false);
    });
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 50%, #fbc2eb 100%)",
      padding: 0,
      margin: 0
    }}>
      <div style={{
        width: "100%",
        height: 60,
        background: "linear-gradient(90deg, #6366f1 0%, #2563eb 100%)",
        display: "flex",
        alignItems: "center",
        paddingLeft: 36,
        boxSizing: "border-box",
        color: "#fff",
        fontWeight: 700,
        fontSize: 22,
        letterSpacing: 1,
        boxShadow: "0 2px 8px rgba(99,102,241,0.08)",
        marginBottom: 24
      }}>
        RPM包一键构建系统
      </div>
      <div style={{
        maxWidth: 520,
        margin: "48px auto",
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
        padding: "32px 28px 24px 28px"
      }}>
        <h1 style={{
          textAlign: "center",
          fontWeight: 700,
          fontSize: 28,
          letterSpacing: 1,
          color: "#2d3a4b",
          marginBottom: 28
        }}>
          RPM包一键构建系统
        </h1>
        <form onSubmit={handleSubmit} style={{ marginBottom: 0 }}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 500, color: "#374151" }}>仓库URL：</label>
            <input
              value={repoUrl}
              onChange={e => setRepoUrl(e.target.value)}
              required
              style={{
                width: "100%",
                marginTop: 6,
                padding: "10px 14px",
                border: "1px solid #cbd5e1",
                borderRadius: 8,
                fontSize: 16,
                outline: "none",
                transition: "border 0.2s",
                boxSizing: "border-box"
              }}
              placeholder="请输入Git仓库URL，如 https://github.com/example/repo.git"
            />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 500, color: "#374151" }}>分支名：</label>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6 }}>
              <select
                value={branch}
                onChange={e => setBranch(e.target.value)}
                style={{
                  padding: "8px 12px",
                  border: "1px solid #cbd5e1",
                  borderRadius: 8,
                  fontSize: 16,
                  outline: "none"
                }}
              >
                {BRANCHES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
              {branch === "custom" && (
                <input
                  placeholder="自定义分支名"
                  value={customBranch}
                  onChange={e => setCustomBranch(e.target.value)}
                  required
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: 8,
                    fontSize: 16,
                    outline: "none"
                  }}
                />
              )}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 10 }}>
            <button
              type="submit"
              disabled={building}
              style={{
                background: building ? "#a5b4fc" : "linear-gradient(90deg,#6366f1 0%,#2563eb 100%)",
                color: "#fff",
                fontWeight: 600,
                fontSize: 16,
                border: "none",
                borderRadius: 8,
                padding: "10px 28px",
                cursor: building ? "not-allowed" : "pointer",
                boxShadow: "0 2px 8px rgba(99,102,241,0.08)",
                transition: "background 0.2s"
              }}
            >
              {building ? "构建中...请不要关闭或刷新页面" : "开始构建"}
            </button>
            {zipUrl && (
              <a
                href={zipUrl}
                download
                style={{
                  fontSize: 16,
                  color: "#2563eb",
                  background: "#eef2ff",
                  borderRadius: 8,
                  padding: "10px 18px",
                  textDecoration: "none",
                  fontWeight: 600,
                  border: "1px solid #c7d2fe",
                  boxShadow: "0 1px 4px rgba(99,102,241,0.06)"
                }}
              >
                下载全部RPM包
              </a>
            )}
          </div>
        </form>
        <div style={{
          background: "#1e293b",
          color: "#a7f3d0",
          minHeight: 180,
          marginTop: 18,
          padding: 14,
          borderRadius: 8,
          fontFamily: "monospace",
          fontSize: 15,
          whiteSpace: "pre-wrap",
          overflowX: "auto",
          boxShadow: "0 1px 4px rgba(30,41,59,0.08)"
        }}>
          {log || "构建日志将在此处显示..."}
        </div>
      </div>
      <div style={{ textAlign: "center", color: "#64748b", marginTop: 24, fontSize: 14 }}>
        &copy; {new Date().getFullYear()} https://github.com/wanghongwei-dev. All Rights Reserved.
      </div>
    </div>
  );
}
