import config from '../config.js';

/**
 * 上传文件到 Gitee 仓库（带重试）
 * @param {Buffer} buffer - 文件内容
 * @param {string} originalName - 原始文件名
 * @returns {Promise<string>} - 文件的 raw 下载链接
 */
export async function uploadToGitee(buffer, originalName) {
  const { giteeOwner, giteeRepo, giteeToken } = config;
  if (!giteeOwner || !giteeRepo || !giteeToken) {
    throw new Error('Gitee 配置缺失，请检查 GITEE_OWNER / GITEE_REPO / GITEE_TOKEN');
  }

  const ext = originalName.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const path = `uploads/${fileName}`;
  const base64Content = buffer.toString('base64');
  const fileSizeMB = (buffer.length / 1024 / 1024).toFixed(2);

  console.log(`[Gitee] 开始上传: ${originalName} (${fileSizeMB}MB) -> ${path}`);

  const url = `https://gitee.com/api/v5/repos/${giteeOwner}/${giteeRepo}/contents/${path}`;
  const body = JSON.stringify({
    access_token: giteeToken,
    content: base64Content,
    message: `upload ${fileName}`,
  });

  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Gitee] 第 ${attempt}/${maxRetries} 次尝试...`);
      const controller = new AbortController();
      // 大文件给 60 秒超时
      const timeout = setTimeout(() => controller.abort(), 60000);

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        const rawUrl = data.content?.download_url
          || `https://gitee.com/${giteeOwner}/${giteeRepo}/raw/master/${path}`;
        console.log(`[Gitee] 上传成功: ${rawUrl}`);
        return rawUrl;
      }

      const errText = await res.text();
      console.error(`[Gitee] 响应错误(${res.status}): ${errText}`);

      if (res.status >= 400 && res.status < 500) {
        throw new Error(`Gitee 上传失败(${res.status}): ${errText}`);
      }
      if (attempt === maxRetries) {
        throw new Error(`Gitee 上传失败(${res.status}): ${errText}`);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.error(`[Gitee] 第 ${attempt} 次超时`);
        if (attempt === maxRetries) throw new Error('Gitee 上传超时，请稍后重试');
      } else if (err.message.startsWith('Gitee 上传失败(4')) {
        throw err;
      } else {
        console.error(`[Gitee] 第 ${attempt} 次异常: ${err.message}`);
        if (attempt === maxRetries) throw err;
      }
    }
    await new Promise(r => setTimeout(r, attempt * 2000));
  }
}
