import { defineConfig, type Plugin, type PreviewServer, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import { buildMockAssignments } from './mock/assignments';

/** Độ trễ giả lập để nhìn rõ trạng thái `loading` của createAsyncThunk. */
const FAKE_LATENCY_MS = 600;

/**
 * Yêu cầu 7 — API giả lập chạy ngay trong dev server của Vite.
 * `fetch('/api/assignments')` trong thunk là request HTTP thật, thấy được ở tab Network.
 * Thêm ?simulateError=1 để server trả 500, dùng demo nhánh `rejected`.
 */
function mockApiPlugin(): Plugin {
  const attach = (server: ViteDevServer | PreviewServer) => {
    server.middlewares.use((req, res, next) => {
      if (!req.url?.startsWith('/api/assignments')) {
        next();
        return;
      }

      const url = new URL(req.url, 'http://localhost');
      setTimeout(() => {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');

        if (url.searchParams.get('simulateError') === '1') {
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, data: [], message: 'Máy chủ đang bảo trì.' }));
          return;
        }

        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, data: buildMockAssignments() }));
      }, FAKE_LATENCY_MS);
    });
  };

  return { name: 'mock-assignments-api', configureServer: attach, configurePreviewServer: attach };
}

export default defineConfig({
  plugins: [react(), mockApiPlugin()],
});
